from dgl.data.citation_graph import CoraGraphDataset
from dgl2json import *
from db import *
from algorithms.pagerank import *
from algorithms.centrality import *
from algorithms.utils import top_nodes
import dgl
import torch
import json

# g = getDataset(CoraGraphDataset())
# g = getDataset(CiteseerGraphDataset())

# dgl.save_graphs('cora2.bin',g)
g = dgl.load_graphs('sg.bin')
# g = g[0][0]
# ret = PCA(g.ndata['feat'],1)
# gg = add_PCA(g)
# gg = add_random_efeature(g)

# g = dgl.graph(([0, 1, 0,5], [1, 2, 3, 0]))
# g = dgl.reorder_graph(g,edge_permute_algo='src')
# g = pagerank_with_networkx(g,**{'tol':1e-6})
# g = degreeCentrality_with_networkx(g)
# g = betweenessCentrality_with_networkx(g)
# g = top_nodes(g,'degree_centrality',40)
# g = top_nodes(g,'degree_centrality',20)
# g = top_nodes(g,'pagerank',40)
# g = top_nodes(g,'pagerank',20)
# g = top_nodes(g,'betweeness_centrality',40)
# dgl.save_graphs('cora.bin',g)
g = squeeze_list(g)
g = InitialSample_BFS(g)
print()

