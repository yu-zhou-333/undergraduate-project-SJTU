import dgl
import json
import torch as th


def dgl2dict(g, graph_name = None, graph_label = -1):
    """
    Parameters 
    g : dgl graph
    graph_name : str
    graph_label : int  
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
    with open(logdir+'/'+filename+'.json', 'w') as f:
        json.dump(res,f)
    return res

def writeDictGraph(logdir,g,filename):
    with open(logdir+'/'+filename+'.json', 'w') as f:
        json.dump(g,f)
    return g
