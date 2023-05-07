import networkx as nx
import matplotlib.pyplot as plt
import torch
import dgl

def top_nodes(g,nfeature_name,top_nodes_num):
    '''Returns a graph with a new node feature that map the top n nodes to 1 and others to 0'''
    fea = g.ndata[nfeature_name]
    k = torch.sort(fea)[0][-top_nodes_num]
    new_fea = torch.zeros_like(fea)
    new_fea[fea >= k] = 1
    g.ndata[nfeature_name+'_top{}'.format(top_nodes_num)] = new_fea
    return g