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
f = open('backend\cache\cora.json')
a = json.load(f)
f.close()
print()

