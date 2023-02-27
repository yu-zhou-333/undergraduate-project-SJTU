import json
import torch
from dgl2json import *
from buildGraph import BA4labelDataset
from model import GCN_designed
from explainMethod import ExplainMethods

def read_json(file_name):
    with open(file_name, "r") as f:
        obj = json.load(f)
    return obj

# last 10 nodes of the generated ba graph
def get_Correctids(g): 
    # get ground Truth
    GT = []
    correct_ids = [x for x in range(len(g.nodes())-10,len(g.nodes()))]
    for i in range(g.num_edges()):
                u = g.edges()[0][i].item()
                v = g.edges()[1][i].item()
                if u in correct_ids and v in correct_ids: 
                    GT.append(1)
                elif v in correct_ids:
                    GT.append(1)
                else:
                    GT.append(0)
    return torch.tensor(GT)


def get9BA(logdir,nodes_num,m):
    ba = BA4labelDataset(graphs_num=9,nodes_num=nodes_num,m=m)
    
    dglgraphs = []
    for i,g in enumerate(ba.graphs):
        
        # get ground Truth
        if ba.labels[i]:
            correct_node = [0]*(len(g.nodes())-10) +[1]*10 # last 10 nodes are motif
        else:
            correct_node = [0]*len(g.nodes()) 
        g.nodes['_N'].data['ground_truth'] = torch.tensor(correct_node)
        dglgraphs.append(g)
    BAs = write9BAs(logdir,dglgraphs,ba.labels)
    return BAs,dglgraphs,ba.labels

def getFeatures(logdir,g,theta=1,label=-1):
    model = GCN_designed(num_node_features=1,theta=theta,num_layers=2,concat_features=0,conv_type='GraphConvWL')
    model.set_paramerters()
    _ = model(g,g.ndata['x'])
    g.nodes['_N'].data['x1'] = model.layers_features[0].squeeze()
    g.nodes['_N'].data['x2'] = model.layers_features[1].squeeze()

    filename = "selected_graph"
    dict_g = dgl2dict(g,filename,label)
    dict_g['readout'] = model.readout.data.item()
    with open(logdir+'/'+filename+'.json', 'w') as f:
        json.dump(dict_g,f)
    return dict_g

def getExplainResults(logdir,g,theta,label):

    METHODS = [
    'random',
    'gnnexplainer',
    'sa',
    'ig',
    'pgmexplainer']


    # set parameters to run gnn
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    expmethods = ExplainMethods(device)
    model = GCN_designed(num_node_features=1,theta=theta,num_layers=2,
    concat_features=0,conv_type='GraphConvWL')
    model.set_paramerters()
    _ = model(g,g.ndata['x'])
    model.to(device)
    _g=g.to(device)

    # get explaination for each method
    accs = {}
    for method in METHODS:
        try:
            fun = getattr(expmethods,'explain_{}'.format(method))
            acc,edge_mask = expmethods.evaluate_explanation(fun,model,[(_g,label)],method,device,10)
            for k,v in edge_mask.items():
                g.edges['_E'].data['{}_{}'.format(method,k)] = torch.tensor(v)
                accs['{}_{}'.format(method,k)] = acc[k][0]
        except:
            continue

    # get ground Truth
    GT = get_Correctids(g)
    g.edges['_E'].data['ground_truth'] = GT
    accs['ground_truth'] = 1

    filename = "explain_graph" 
    dict_g = dgl2dict(g,filename,label)
    dict_g['readout'] = model.readout.data.item()
    dict_g['accs'] = accs

    with open(logdir+'/'+filename+'.json', 'w') as f:
        json.dump(dict_g,f)
    return dict_g

def get_DIYExplain(logdir,g,theta,label,expfun):
    '''Return explainations of expfun'''
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    expmethods = ExplainMethods(device)
    model = GCN_designed(num_node_features=1,theta=theta,num_layers=2,
    concat_features=0,conv_type='GraphConvWL')
    model.set_paramerters()
    _ = model(g,g.ndata['x'])
    model.to(device)
    _g=g.to(device)

    method = 'Your Method'
    accs = {}
    acc,edge_mask = expmethods.evaluate_explanation(expfun,model,[(_g,label)],method,device,10)
    for k,v in edge_mask.items():
        g.edges['_E'].data['{}_{}'.format(method,k)] = torch.tensor(v)
        accs['{}_{}'.format(method,k)] = acc[k][0]
    
    # get ground Truth
    GT = get_Correctids(g)
    g.edges['_E'].data['ground_truth'] = GT
    accs['ground_truth'] = 1

    filename = "DIYexplain_graph" 
    dict_g = dgl2dict(g,filename,label)
    dict_g['readout'] = model.readout.data.item()
    dict_g['accs'] = accs

    with open(logdir+'/'+filename+'.json', 'w') as f:
        json.dump(dict_g,f)

    return dict_g