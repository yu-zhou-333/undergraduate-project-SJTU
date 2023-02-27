import time
from pgmpy import device
import torch
import numpy as np
import pandas as pd
from scipy.special import softmax
#from pgmpy.estimators import ConstraintBasedEstimator
from pgmpy.estimators.CITests import chi_square
from scipy.stats import chi2_contingency
from scipy.stats import chisquare



class Graph_Explainer:
    def __init__(
        self,
        model,
        graph,
        num_layers = None,
        perturb_feature_list = None,
        perturb_mode = "mean", # mean, zero, max or uniform
        perturb_indicator = "diff", # diff or abs
        print_result = 1,
        snorm_n = None, 
        snorm_e = None
    ):
        self.model = model
        self.model.eval()
        self.graph = graph
        self.snorm_n = snorm_n
        self.snorm_e = snorm_e
        self.num_layers = num_layers
        self.perturb_feature_list = perturb_feature_list
        self.perturb_mode = perturb_mode
        self.perturb_indicator = perturb_indicator
        self.print_result = print_result
        self.device = next(self.model.parameters()).device
        self.X_feat = torch.ones((graph.num_nodes(),1),device = self.device)
        self.E_feat = torch.ones((graph.num_edges(),1),device = self.device)
    def perturb_features_on_node(self, feature_matrix, node_idx, random = 0):
        
        X_perturb = feature_matrix.detach().clone()
        perturb_array = X_perturb[node_idx].detach().clone()
        perturb_array = perturb_array
        epsilon = 0.05*torch.max(self.X_feat, dim = 0)[0]
        epsilon = epsilon.cpu()
        seed = np.random.randint(2)
        
        if random == 1:
            if seed == 1:
                for i in range(perturb_array.shape[0]):
                    if i in self.perturb_feature_list:
                        if self.perturb_mode == "mean":
                            perturb_array[i] = torch.mean(feature_matrix[:,i])
                        elif self.perturb_mode == "zero":
                            perturb_array[i] = 0
                        elif self.perturb_mode == "max":
                            perturb_array[i] = torch.max(feature_matrix[:,i])
                        elif self.perturb_mode == "uniform":
                            perturb_array[i] = perturb_array[i] + np.random.uniform(low=-epsilon[i], high=epsilon[i])
                            if perturb_array[i] < 0:
                                perturb_array[i] = 0 
                            elif perturb_array[i] > torch.max(self.X_feat, dim = 0)[0][i]:
                                perturb_array[i] = torch.max(self.X_feat, dim = 0)[0][i]

        
        X_perturb[node_idx] = perturb_array

        return X_perturb 
    
    def batch_perturb_features_on_node(self, num_samples, index_to_perturb,
                                            percentage, p_threshold, pred_threshold):
        X_torch = self.X_feat.detach().clone()
        E_torch = self.E_feat.detach().clone()
        pred_torch = self.model.forward(self.graph, X_torch, E_torch).cpu()
        #print(pred_torch)
        soft_pred = np.asarray(softmax(np.asarray(pred_torch[0].data)))
        pred_label = np.argmax(soft_pred)
        num_nodes = self.X_feat.shape[0]
        Samples = [] 
        for iteration in range(num_samples):
            X_perturb = self.X_feat.detach().clone()
            sample = []
            for node in range(num_nodes):
                if node in index_to_perturb:
                    seed = np.random.randint(100)
                    if seed < percentage:
                        latent = 1
                        X_perturb = self.perturb_features_on_node(X_perturb, node, random = latent)
                    else:
                        latent = 0
                else:
                    latent = 0
                sample.append(latent)
            
            X_perturb_torch =  X_perturb
            pred_perturb_torch = self.model.forward(self.graph, X_perturb_torch, E_torch).cpu()
            soft_pred_perturb = np.asarray(softmax(np.asarray(pred_perturb_torch[0].data)))
        
            pred_change = np.max(soft_pred) - soft_pred_perturb[pred_label]
            
            sample.append(pred_change)
            Samples.append(sample)
        
        Samples = np.asarray(Samples)
        if self.perturb_indicator == "abs":
            Samples = np.abs(Samples)
        
        top = int(num_samples/8)
        top_idx = np.argsort(Samples[:,num_nodes])[-top:] 
        for i in range(num_samples):
            if i in top_idx:
                Samples[i,num_nodes] = 1
            else:
                Samples[i,num_nodes] = 0
            
        return Samples
    
    def explain(self, num_samples = 10, percentage = 50, top_node = None, p_threshold = 0.05, pred_threshold = 0.1):

        num_nodes = self.X_feat.shape[0]
        if top_node == None:
            top_node = int(num_nodes/20)
        #Round 1
        Samples = self.batch_perturb_features_on_node(int(num_samples/2), range(num_nodes),percentage, 
                                                            p_threshold, pred_threshold)         
        
        data = pd.DataFrame(Samples)

        p_values = []
        candidate_nodes = []
        
        target = num_nodes # The entry for the graph classification data is at "num_nodes"
        for node in range(num_nodes):
            _,p,_ = chi_square(node, target, [], data,False)
            p_values.append(p)
        
        number_candidates = int(top_node*2)
        candidate_nodes = np.argpartition(p_values, number_candidates)[0:number_candidates]

        #Round 2
        Samples = self.batch_perturb_features_on_node(num_samples, candidate_nodes, percentage, 
                                                            p_threshold, pred_threshold)          
        data = pd.DataFrame(Samples)

        p_values = []
        dependent_nodes = []
        
        target = num_nodes
        for node in range(num_nodes):
            chi2, p,_ = chi_square(node, target, [], data,False)
            p_values.append(p)
            if p < p_threshold:
                dependent_nodes.append(node)
        top_p = np.min((top_node,num_nodes-1))
        ind_top_p = np.argpartition(p_values, top_p)[0:top_p]
        pgm_nodes = list(ind_top_p)
        
        return pgm_nodes, p_values, candidate_nodes