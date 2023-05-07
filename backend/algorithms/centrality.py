import networkx as nx
import matplotlib.pyplot as plt
import torch
import dgl

def degreeCentrality_with_networkx(g,**config):
    ''' a wrapper for dgl to use degree centrality function with networkx
        g : a dgl graph
        config : a dictionary of parameters(same as networkx)
    '''
    ret = nx.degree_centrality(g.to_networkx(),**config)
    g.ndata['degree_centrality'] = torch.tensor([v for k,v in ret.items()])
    return g

def betweenessCentrality_with_networkx(g,**config):
    ret = nx.betweenness_centrality(g.to_networkx(),**config)
    g.ndata['betweeness_centrality'] = torch.tensor([v for k,v in ret.items()])
    return g