from dgl.data.citation_graph import CoraGraphDataset
from dgl2json import *
from db2 import *
import dgl
import torch
import json

# g = getDataset(CoraGraphDataset())

# dgl.save_graphs('cora2.bin',g)
# g = dgl.load_graphs('cora2.bin')
# g = g[0][0]
# ret = PCA(g.ndata['feat'],1)
# gg = add_PCA(g)
# gg = add_random_efeature(g)

g = dgl.graph(([0, 1, 0,5], [1, 2, 3, 0]))
g = dgl.reorder_graph(g,edge_permute_algo='src')
print()

