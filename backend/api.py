from flask import request, jsonify, Blueprint, current_app
from extension import cache
from db import *
import dgl
from werkzeug.datastructures import FileStorage
api = Blueprint('api', __name__)

######################
# API Starts here
######################

# init datasets
@api.route('/datasets',methods=['GET'])
def get_datasets():
    datasets = get_Datasets()
    logdir = current_app.config["LOGDIR"]
    g = {}
    for dataset in datasets:
        writeDictGraph(logdir,dataset,dataset['name'])
        g[dataset['name']] = dataset

   ######## Load datasets from cache #######################
    # dataset_names = ['cora','citeseer']
    # for dataset in dataset_names:
    #     with open(logdir+'/'+dataset+'.json') as f:
    #         g[dataset] = json.load(f)
    ########################################################
    return jsonify({'success':True,'graph':g})

# receive uploaded graph
@api.route('/get_graph',methods=['POST'])
def get_graph():
    logdir = current_app.config["LOGDIR"]
    data = request.files.get('graph')
    filename = 'Your_'+data.filename
    data.save(logdir+'/'+filename)
    try:
        data = dgl.load_graphs(logdir+'/'+filename)
        squeeze_g = squeeze_list(data)
        # add PCA features
        squeeze_g = add_PCA(squeeze_g)
        squeeze_g = InitialSample_BFS(squeeze_g)
        squeeze_g = dgl.reorder_graph(squeeze_g,edge_permute_algo='src')
        squeeze_g = add_random_efeature(squeeze_g)
        graph = dgl2dict(squeeze_g,filename)
        g = {}
        g[filename.split('.')[0]] = graph
        return jsonify({'success':True,'graph':g})
    except Exception as e:
        return jsonify({'success':False,'info':repr(e)})