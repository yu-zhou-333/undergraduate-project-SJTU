import json
import torch
from dgl2json import *
from dgl.data.citation_graph import CoraGraphDataset,CiteseerGraphDataset
from pca import PCA

def read_json(file_name):
    with open(file_name, "r") as f:
        obj = json.load(f)
    return obj

def get_Datasets():
    '''Load dgl datasets'''
    g1 = getDataset(CoraGraphDataset())
    g2 = getDataset(CiteseerGraphDataset())

    res1 = dgl2dict(g1,'cora')
    res2 = dgl2dict(g2,'citeseer')
    return [res1,res2]

def getDataset(dataset):
    '''Get one dataset from dgl'''
    g = dataset[0]
    num_class = dataset.num_classes
    # get node feature
    feat = g.ndata['feat']
    # get data split
    train_mask = g.ndata['train_mask']
    val_mask = g.ndata['val_mask']
    test_mask = g.ndata['test_mask']
    # get labels
    label = g.ndata['label']
    g = add_PCA(g)
    g = InitialSample_BFS(g)
    g = dgl.reorder_graph(g,edge_permute_algo='src')
    return g

def add_PCA(g,nodeType='_N'):
    '''Turn features into PCA features'''
    device = g.device
    k_list = [k for k,v in g.nodes[nodeType].data.items()]
    for k in k_list:
        feat = g.nodes[nodeType].data[k]
        if feat.dim() == 1 or (feat.dim() == 2 and feat.shape[-1] == 1):
            continue
        feat_pca = PCA(feat,1)
        g.nodes[nodeType].data[k+'_pca'] = torch.tensor(feat_pca,device=device).squeeze()
    return g

def add_random_efeature(g,edgeType='_E'):
    device = g.device
    g.edges[edgeType].data['random'] = torch.rand(g.num_edges())
    return g


def InitialSample_BFS(g,min_size=100,max_size=500,nodeType='_N'):
    """Sampling a sub graph using BFS """
    InitialSample= torch.zeros(len(g.nodes()))
    num = 0
    nid = 0
    selected_nodes = []
    while(num < min_size):
        if nid in selected_nodes:
            nid += 1
            continue
        current_list = torch.cat(dgl.bfs_nodes_generator(g,nid))
        for i in current_list:
            if i not in selected_nodes:
                num += 1
                InitialSample[i] = 1
                selected_nodes.append(i)
                if num >= max_size:
                    g.nodes[nodeType].data['InitialSample'] = InitialSample
                    return g
        nid += 1

    g.nodes[nodeType].data['InitialSample'] = InitialSample
    return g

def squeeze_list(list_data, axis=None, _now_axis=0):
    while(isinstance(list_data, (list, tuple))):
        list_data = list_data[0]
    return list_data
