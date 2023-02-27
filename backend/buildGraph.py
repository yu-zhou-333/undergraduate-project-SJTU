#增加禁止attach在初始m个结点上的参数选项
import numpy as np
import networkx as nx
import math
from dgl.data import DGLDataset
import dgl
import torch
def ba(start, width, role_start=0, m=5, seed = None):
    """Builds a BA preferential attachment graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    width       :    int size of the graph
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                     role_start)
    """
    graph = nx.barabasi_albert_graph(width, m, seed)
    graph.add_nodes_from(range(start, start + width))
    nids = sorted(graph)
    mapping = {nid: start + i for i, nid in enumerate(nids)}
    graph = nx.relabel_nodes(graph, mapping)
    roles = [role_start for i in range(width)]
    return graph, roles

def house(start, role_start=0):
    """Builds a house-like  graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 5))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start + 3),
            (start + 3, start),
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    graph.add_edges_from([(start + 4, start), (start + 4, start + 1)])
    roles = [role_start, role_start, role_start + 1, role_start + 1, role_start + 2]
    return graph, roles

def square_diagonal(start, role_start=0):
    """Builds a square_diagonal  graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 4))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start + 3),
            (start + 3, start),
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    graph.add_edges_from([(start, start + 2)])
    roles = [role_start, role_start, role_start, role_start]
    return graph, roles



def five_cycle(start, role_start = 0):
    """Builds a five-cycle  graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 5))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start + 3),
            (start + 3, start + 4),
            (start + 4, start)
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    #graph.add_edges_from([(start + 4, start), (start + 4, start + 1)])
    roles = [role_start, role_start, role_start + 1, role_start + 1, role_start + 2]
    return graph, roles

def three_cycle(start, role_start = 0):
    """Builds a three-cycle  graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 3))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start)
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    #graph.add_edges_from([(start + 4, start), (start + 4, start + 1)])
    roles = [role_start, role_start, role_start]
    return graph, roles
def four_cycle(start, role_start = 0):
    """Builds a four-cycle  graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 4))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start + 3),
            (start + 3, start)
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    #graph.add_edges_from([(start + 4, start), (start + 4, start + 1)])
    roles = [role_start, role_start, role_start, role_start]
    return graph, roles

def six_cycle(start, role_start = 0):
    """Builds a six-cycle  graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 6))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start + 3),
            (start + 3, start + 4),
            (start + 4, start + 5),
            (start + 5, start)
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    #graph.add_edges_from([(start + 4, start), (start + 4, start + 1)])
    roles = [role_start, role_start, role_start, role_start, role_start, role_start]
    return graph, roles

def multi_motif(start, role_start = 0):
    """Builds a multi_motif include square_diagonal and three-cycle graph, with index of nodes starting at start
    and role_ids at role_start
    INPUT:
    -------------
    start       :    starting index for the shape
    role_start  :    starting index for the roles
    OUTPUT:
    -------------
    graph       :    a house shape graph, with ids beginning at start
    roles       :    list of the roles of the nodes (indexed starting at
                    role_start)
    """
    graph = nx.Graph()
    graph.add_nodes_from(range(start, start + 4))
    graph.add_edges_from(
        [
            (start, start + 1),
            (start + 1, start + 2),
            (start + 2, start + 3),
            (start + 3, start),
        ]
    )
    # graph.add_edges_from([(start, start + 2), (start + 1, start + 3)])
    graph.add_edges_from([(start, start + 2)])

    graph.add_nodes_from(range(start + 4, start + 7))
    graph.add_edges_from(
        [
            (start + 4, start + 5),
            (start + 5, start + 6),
            (start + 6, start + 4)
        ]
    )
    roles = [role_start, role_start, role_start, role_start, role_start, role_start, role_start]
    return graph, roles

def build_graph(
    width_basis,
    basis_type,
    list_shapes,
    start=0,
    rdm_basis_plugins=False,
    add_random_edges=0,
    m=5,
    seed = None,
    no_attach_init_nodes = False
):
    """This function creates a basis (scale-free, path, or cycle)
    and attaches elements of the type in the list randomly along the basis.
    Possibility to add random edges afterwards.
    INPUT:
    --------------------------------------------------------------------------------------
    width_basis      :      width (in terms of number of nodes) of the basis
    basis_type       :      (torus, string, or cycle)
    shapes           :      list of shape list (1st arg: type of shape,
                            next args:args for building the shape,
                            except for the start)
    start            :      initial nb for the first node
    rdm_basis_plugins:      boolean. Should the shapes be randomly placed
                            along the basis (True) or regularly (False)?
    add_random_edges :      nb of edges to randomly add on the structure
    m                :      number of edges to attach to existing node (for BA graph)
    OUTPUT:
    --------------------------------------------------------------------------------------
    basis            :      a nx graph with the particular shape
    role_ids         :      labels for each role
    plugins          :      node ids with the attached shapes
    """
    if basis_type == "ba":
        basis, role_id = eval(basis_type)(start, width_basis, m=m, seed = seed)
    else:
        basis, role_id = eval(basis_type)(start, width_basis)

    n_basis, n_shapes = nx.number_of_nodes(basis), len(list_shapes)
    start += n_basis  # indicator of the id of the next node
    
    if n_shapes != 0:
    # Sample (with replacement) where to attach the new motifs
        if rdm_basis_plugins is True:
            if no_attach_init_nodes:
                plugins = m+np.random.choice(n_basis-m, n_shapes, replace=False)
            else:
                plugins = np.random.choice(n_basis, n_shapes, replace=False)
        else:
            if no_attach_init_nodes:
                spacing = math.floor((n_basis-m) / n_shapes)
                plugins = [m+int(k * spacing) for k in range(n_shapes)]
            else:
                spacing = math.floor(n_basis / n_shapes)
                plugins = [int(k * spacing) for k in range(n_shapes)]
        seen_shapes = {"basis": [0, n_basis]}

        for shape_id, shape in enumerate(list_shapes):
            shape_type = shape[0]
            args = [start]
            if len(shape) > 1:
                args += shape[1:]
            args += [0]
            graph_s, roles_graph_s = eval(shape_type)(*args)
            n_s = nx.number_of_nodes(graph_s)
            try:
                col_start = seen_shapes[shape_type][0]
            except:
                col_start = np.max(role_id) + 1
                seen_shapes[shape_type] = [col_start, n_s]
            # Attach the shape to the basis
            basis.add_nodes_from(graph_s.nodes())
            basis.add_edges_from(graph_s.edges())
            basis.add_edges_from([(start, plugins[shape_id])])
            if shape_type == "cycle":
                if np.random.random() > 0.5:
                    a = np.random.randint(1, 4)
                    b = np.random.randint(1, 4)
                    basis.add_edges_from([(a + start, b + plugins[shape_id])])
            temp_labels = [r + col_start for r in roles_graph_s]
            # temp_labels[0] += 100 * seen_shapes[shape_type][0]
            role_id += temp_labels
            start += n_s

        if add_random_edges > 0:
            # add random edges between nodes:
            for p in range(add_random_edges):
                src, dest = np.random.choice(nx.number_of_nodes(basis), 2, replace=False)
                print(src, dest)
                basis.add_edges_from([(src, dest)])

        return basis, role_id, plugins
    else:
        return basis, role_id, []


class BA4labelDataset(DGLDataset):
    basis_type = "ba"

    def __init__(self, graphs_num = 1000, nodes_num = 25, m = 1, perturb_dic = {}, no_attach_init_nodes = False, include_bias_class = True):
        self.graphs_num = graphs_num
        self.nodes_num = nodes_num
        self.m = m
        self.perturb_dic = perturb_dic
        self.no_attach_init_nodes = no_attach_init_nodes
        self.include_bias_class = include_bias_class
        self.nxG = []
        super(BA4labelDataset, self).__init__('BA4labelDataset')

    def process(self):
        self.graphs = []
        self.labels = []
        self.role_id = []
        self.plug_id = []
        for _ in range(self.graphs_num):
            if self.include_bias_class:
                which_type = np.random.choice([0,1,2,3])
            else:
                which_type = np.random.choice([1,2,3])
            perturb_type = np.random.choice([0]+list(self.perturb_dic.keys()))
            if self.m == None:
                m = np.random.choice([1,3,5])
            else:
                m = self.m
            if which_type == 0:
                if perturb_type == 0:
                    G, role_id, plug_id = build_graph(self.nodes_num, self.basis_type, [], start = 0, m = m, no_attach_init_nodes = self.no_attach_init_nodes)
                else:
                    G, role_id, plug_id = build_graph(self.nodes_num - perturb_type, self.basis_type, [[self.perturb_dic[perturb_type]]], start = 0, m = m, 
                    no_attach_init_nodes = self.no_attach_init_nodes)
            else:
                list_shapes = [["house"]] * (which_type - 1) + [["five_cycle"]] * (3 - which_type)
                if perturb_type != 0:
                    list_shapes = list_shapes + [[self.perturb_dic[perturb_type]]]
                G, role_id, plug_id = build_graph(self.nodes_num-10-perturb_type, self.basis_type, list_shapes, start = 0, m = m, no_attach_init_nodes = self.no_attach_init_nodes)


            self.nxG.append(G)
            g = dgl.from_networkx(G)
            g.ndata['x'] = torch.ones((self.nodes_num,1))
            self.graphs.append(g)
            self.labels.append(which_type)
            self.role_id.append(role_id)
            self.plug_id.append(plug_id)

    @property
    def num_classes(self):
        return 4

    @property
    def num_node_features(self):
        return 1


    def __getitem__(self, idx):
        return self.graphs[idx], self.labels[idx]

    def __len__(self):
        return len(self.graphs)
