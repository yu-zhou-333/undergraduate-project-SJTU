import json
import torch
from dgl2json import *
from dgl.data.citation_graph import CoraGraphDataset

def get_Datasets():
    dataset = CoraGraphDataset()
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
    res = dgl2dict(g,'cora')
    return res
