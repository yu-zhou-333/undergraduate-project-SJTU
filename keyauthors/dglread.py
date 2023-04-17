import dgl
import os
import json
import torch
from tqdm import tqdm

def read_edges(file):
    u = []
    v = []
    w = []
    for line in tqdm(file.readlines()):
        ui,vi,wi = line.strip('\n').split()
        u.append(int(ui))
        v.append(int(vi))
        w.append(float(wi))
    return [u,v],w

def read_keyauthor(file):
    k = []
    for line in tqdm(file.readlines()):
        i,ki = line.strip('\n').split();
        k.append(int(ki))
    return k

def mapID2NodeNums(nodes):
    nodes = torch.unique(torch.tensor(nodes))
    sorted_nodes,indices = torch.sort(nodes)
    my_map = {}
    anti_map = {}
    for index,node in enumerate(sorted_nodes):
        my_map[int(node)] = index
        anti_map[index] = int(node)
    return my_map,anti_map

def read_data(device='cpu'):
    # with open('keyauthors/author_info_covid.json') as f:
    #     author_info = json.load(f)
    with open('keyauthors/coauthor_covid.txt') as f:
        edges,w = read_edges(f);

    my_map,anti_map = mapID2NodeNums(edges[0]+edges[1])
    u = [my_map[i] for i in edges[0]]
    v = [my_map[i] for i in edges[1]]
    w = torch.tensor(w,device=device)

    with open('keyauthors/keyauthor_label.txt') as f:
        key_author = read_keyauthor(f)

    g = dgl.graph((u,v),device=device)
    g.edata['times_of_cooperation'] = w
    
    g.ndata['key_author'] = torch.tensor(key_author,device=device)
    

    return g

g = read_data()
dgl.save_graphs('keyauthors_bi.bin',dgl.to_bidirected(g,copy_ndata=True))
print()