import dgl
import json
import torch as th
from buildGraph import BA4labelDataset


def dgl2dict(g, graph_name = None, graph_label = -1):
    """
    Parameters 
    g : dgl graph
    graph_name : str
    nfeatures : list of features 
        Node features. The tensor can be reshaped as (N,dim) where N is the number
        of features and dim is the dimension of the feature. It can be (t,Nt,dim) 
        for hetergraph, where t is the type of the node; Nt is the number of type t.

    eweights : list of weights
        Edge weights. The tensor can be reshaped as (N,dim) or it van be (t,Nt,dim)
        for hetergraph, where t is the canonical_etype of the edge.
    Returns
    A dict of the given graph
    """
    res = dict()
    if graph_name:
        res['name'] = graph_name
    else:
        res['name'] = 'None'

    res['label'] = int(graph_label)
    res['canonical_etypes'] = g.canonical_etypes
    res['num_nodes'] = dict([(node_type,g.num_nodes(node_type)) for node_type in g.ntypes])
    res['graphs'] = []
    res['features'] = {}
    for graph_type in g.canonical_etypes:
        srcs,dsts = g.edges(etype=graph_type)
        res['graphs'].append(
            {
                "graph_type" : {"src_type":graph_type[0],"edge_type":graph_type[1], "dst_type":graph_type[2]},
                "srcs" : srcs.tolist(),
                "dsts" : dsts.tolist(),
                "edge_mask" : dict([(k,v.tolist())  for k,v in dict(g.edges[graph_type[1]].data).items()])
            }
        )
    for node_type in g.ntypes:
        res['features'][node_type] = dict([(k,v.tolist()) for k,v in dict(g.nodes[node_type].data).items()])

    return res

def writeDglGraph(logdir,g,filename):
    """
    Transfer a dgl graph to dict and save it to logdir
    """
    res = dgl2dict(g,filename)
    with open(logdir+'/'+filename, 'w') as f:
        json.dump(res,f)
    return res

def write9BAs(logdir,g_list,g_labels):
    """
    Parameters:
    logdir : str
        the path registered in server
    g_list: list of dgl graphs
    Returns:
    A list of dict of dgl graphs
    """
    res = []
    for i,g in enumerate(g_list):
        t = dgl2dict(g,i+1,g_labels[i])
        res.append(t)
        with open(logdir + '/ba_{}.json'.format(i+1),'w') as f:
            json.dump(t,f)
    return res

if __name__ == '__main__':
    ba = BA4labelDataset(graphs_num=9)
    g = ba.graphs
    labels = ba.labels
    graph_data = {
    ('drug', 'interacts', 'drug'): (th.tensor([0, 1]), th.tensor([1, 2])),
    ('drug', 'interacts', 'gene'): (th.tensor([0, 1]), th.tensor([2, 3])),
    ('drug', 'treats', 'disease'): (th.tensor([1]), th.tensor([2]))
    }
    hg = dgl.heterograph(graph_data)
    hsrcs,hdsts = hg.edges(etype=('drug', 'interacts', 'gene'))
    srcs = g[0].edges()

    print()
    write9BAs('backend/cache',g,labels)