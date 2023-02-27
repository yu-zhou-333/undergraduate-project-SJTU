import numpy as np
import torch
import torch.nn.functional as F

from captum._utils.typing import TargetType
from captum.attr import Saliency, IntegratedGradients, LayerGradCam
from torch import Tensor
import dgl
from method.gnn_explainer import GNNExplainer
import method.pgm_explainer as pe
from copy import deepcopy
from tqdm import tqdm,trange
from collections import Counter


class ExplainMethods(object):
    def __init__(self,device):
        self.device = device

    def model_forward(self,input_mask, g, model, x):
        if input_mask.shape[0] != g.num_edges():
            out = []
            for i in range(int(input_mask.shape[0]/g.num_edges())):
                out.append(model(g, x[(i*g.num_nodes()):((i+1)*g.num_nodes())], input_mask[(i*g.num_edges()):((i+1)*g.num_edges())]))
            out = torch.cat(out, dim = 0)
        else:
            out = model(g, x, input_mask)
        return out

    def node_attr_to_edge(self,g, node_mask):
        edge_mask = np.zeros(g.num_edges())
        edge_mask += node_mask[g.edges()[0].cpu().numpy()]
        edge_mask += node_mask[g.edges()[1].cpu().numpy()]
        return edge_mask

    def explain_random(self,model, task_type, g, x, target):
        return np.random.uniform(size=g.num_edges())



    def explain_sa(self,model, task_type, g, x, target):
        saliency = Saliency(self.model_forward)
        input_mask = torch.ones(g.num_edges()).requires_grad_(True).to(self.device)
        input_mask.retain_grad()
        attr = saliency.attribute(inputs=input_mask, target=int(target), additional_forward_args = (g,model,x), abs = True)
        attr = attr.detach().cpu().numpy()
        return attr


    def explain_ig(self,model, task_type, g, x, target):
        ig = IntegratedGradients(self.model_forward)
        input_mask = torch.ones(g.num_edges()).requires_grad_(True).to(self.device)
        attr,delta = ig.attribute(inputs=input_mask, target=int(target), additional_forward_args = (g,model,x),return_convergence_delta=True, n_steps=500)
        attr = attr.detach().cpu().numpy()
        return attr



    def explain_gnnexplainer(self,model, task_type, g, x, target):
        explainer = GNNExplainer(model, num_hops=2, log = False)
        feat_mask, edge_weights = explainer.explain_graph(g, x)
        return edge_weights.cpu().numpy()

    def explain_pgmexplainer(self,model, task_type, g, x, target, include_edges=None):
        #Get pred_threshold by predict of model (Actually not use in Explainer)
        pred = model.forward(g, x).cpu()
        soft_pred = np.array(pred[0].data)
        pred_threshold = 0.1*np.max(soft_pred)

        #Implement Graph_Explainer with 
        e = pe.Graph_Explainer(model, g,
                                perturb_feature_list = [0],
                                perturb_mode = "uniform",
                                perturb_indicator = "diff")
        pgm_nodes, p_values, candidates = e.explain(num_samples = 1000, percentage = 10, 
                                top_node = 12, p_threshold = 0.05, pred_threshold = pred_threshold)
        explanation = zip(pgm_nodes,p_values)

        #Importance of node = 1 - p-value, convert node importance to edge importance
        node_attr = np.zeros(x.shape[0])
        for node, p_value in explanation:
            node_attr[node] = 1-p_value
        edge_mask = self.node_attr_to_edge(g, node_attr)

        return edge_mask

    @staticmethod
    def get_accuracy(g, correct_ids, edge_mask):
        '''
        Calculate accuracy from correct nodes id and edge mask.
        '''
        if correct_ids == []:
            if np.all(np.mean(edge_mask) == edge_mask):
                return 1
            else:
                return 0
        else:
            correct_edges = set()
            for i in range(g.num_edges()):
                u = g.edges()[0][i].item()
                v = g.edges()[1][i].item()
                if u in correct_ids and v in correct_ids: 
                    correct_edges.add((u,v))
                    correct_edges.add((v,u))
                elif v in correct_ids:
                    correct_edges.add((u,v))
                else:
                    continue
            #elements in ground truth and explanation set are directional edges
            correct_count = 0
            for x in np.argsort(-edge_mask)[:len(correct_edges)]:
                u = g.edges()[0][x].item()
                v = g.edges()[1][x].item()
                if (u, v) in correct_edges:
                    correct_count += 1
            return correct_count / len(correct_edges)
    


    def evaluate_explanation(self,explain_function, model, test_dataset, explain_name,device, iteration = 1):
        '''
        Evaluate a explanation method on test dataset.
        INPUT:
        -------------
        explain_function:    use which explanation method
        model           :    explained model
        test_dataset    :    test dataset (iterable (graph,label))
        explain_name    :    explanation method name
        iteration       :    how many times does the explanation method run, if not 1, will summarize explanation results by 4 methods
        OUTPUT:
        -------------
        accs            :    accuracies of the explanation method. If iteration is not 1, there will be accs_sum and some others, meaning use "sum" method to summarize explanation result
        '''
        accs = []
        tested_graphs = 0
        accs_sum = []
        accs_count13 = []
        accs_rank = []
        accs_count26 = []
        for g, label in tqdm(test_dataset):
            g = g.to(device)
            tested_graphs += 1
            edge_mask = explain_function(model, 'graph', g, g.ndata['x'], label)

            if iteration != 1: # iteration not 
                edge_mask_list = [deepcopy(edge_mask)]
                if explain_name:
                    print('\nGet explain results for {}'.format(explain_name))
                for _ in range(1,iteration):
                    
                    new_edge_mask = explain_function(model, 'graph', g, g.ndata['x'], label)
                    edge_mask_list.append(new_edge_mask)
                
                for summarytype in ['sum','count13','count26','rank']:
                    edge_mask = deepcopy(edge_mask_list[0])
                    print("Start {} evaluation".format(summarytype))
                    if summarytype == 'sum':
                        for i in range(1, iteration):
                            edge_mask += edge_mask_list[i]
                        sum_edge_mask = edge_mask
                    if summarytype == 'count26':#influence by threshold and not be appropriate to stable method
                        top_edges_index = list(np.argsort(-edge_mask)[:26])
                        for j in range(1, iteration):
                            edge_mask = edge_mask_list[j]
                            top_edges_index.extend(list(np.argsort(-edge_mask)[:26]))
                        edges_index_dic = Counter(top_edges_index)
                        edge_mask = np.zeros(g.num_edges())
                        for k,v in edges_index_dic.items():
                            edge_mask[k] = v 
                        count26_edge_mask = edge_mask
                    if summarytype == 'rank':
                        edges_index = np.argsort(-edge_mask)
                        edges_rank = {}
                        for i in range(len(edges_index)):
                            edges_rank[edges_index[i]] = i
                        for j in range(1, iteration):
                            edge_mask = edge_mask_list[j]
                            edges_index = np.argsort(-edge_mask)
                            for i in range(len(edges_index)):
                                edges_rank[edges_index[i]] += i
                        edge_mask = []
                        for i in range(g.num_edges()):
                            edge_mask.append(edges_rank[i])
                        edge_mask = -np.array(edge_mask)
                        rank_edge_mask = edge_mask
                    if summarytype == 'count13':#influence by threshold and not be appropriate to stable method
                        top_edges_index = list(np.argsort(-edge_mask)[:13])
                        for j in range(1, iteration):
                            edge_mask = edge_mask_list[j]
                            top_edges_index.extend(list(np.argsort(-edge_mask)[:13]))
                        edges_index_dic = Counter(top_edges_index)
                        edge_mask = np.zeros(g.num_edges())
                        for k,v in edges_index_dic.items():
                            edge_mask[k] = v 
                        count13_edge_mask = edge_mask
                if label == 0:
                    correct_ids = []
                else:
                    correct_ids = [x for x in range(len(g.nodes())-10,len(g.nodes()))]
                explain_acc = self.get_accuracy(g, correct_ids, sum_edge_mask)
                accs_sum.append(explain_acc)
                explain_acc = self.get_accuracy(g, correct_ids, count13_edge_mask)
                accs_count13.append(explain_acc)
                explain_acc = self.get_accuracy(g, correct_ids, rank_edge_mask)
                accs_rank.append(explain_acc)
                explain_acc = self.get_accuracy(g, correct_ids, count26_edge_mask)
                accs_count26.append(explain_acc)
                edge_mask = edge_mask_list[0]
                
            if label == 0:
                correct_ids = []
            else:
                correct_ids = [x for x in range(len(g.nodes())-10,len(g.nodes()))]

            explain_acc = self.get_accuracy(g, correct_ids, edge_mask)
            accs.append(explain_acc)

        if iteration != 1:
            acc = {'edge_mask':accs,'sum':accs_sum,'rank':accs_rank,'count26':accs_count26,'count13':accs_count13}
            edge_mask = {'edge_mask':edge_mask,'sum':sum_edge_mask,'rank':rank_edge_mask,'count13':count13_edge_mask,
            'count26':count26_edge_mask}
            return acc,edge_mask
        return accs