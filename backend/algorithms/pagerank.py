import networkx as nx
import matplotlib.pyplot as plt
import torch
import dgl

def pagerank_with_networkx(g,**config):
    ''' a wrapper for dgl to use pagerank function with networkx
        g : a dgl graph
        config : a dictionary of parameters(same as networkx)
    '''
    ret = nx.pagerank(g.to_networkx(),**config)
    g.ndata['pagerank'] = torch.tensor([v for k,v in ret.items()])
    return g




