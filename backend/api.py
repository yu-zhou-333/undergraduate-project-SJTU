from flask import request, jsonify, Blueprint, current_app
from extension import cache
from db import *
from db2 import *
import dgl
from werkzeug.datastructures import FileStorage
api = Blueprint('api', __name__)

######################
# API Starts here
######################

# cache for 9 bas
@cache.cached(timeout=0,key_prefix='genBA')
def genBA(logdir,nodes_num,m):
    BAs,dglBAs,labels = get9BA(logdir,nodes_num,m)
    return BAs,dglBAs,labels

# cache for selected ba
@cache.cached(timeout=0,key_prefix='selected_graph')
def getSelectedGraph(g,label):
    return g,label

# cache for theta
@cache.cached(timeout=0,key_prefix='theta')
def getTheta(theta):
    return theta

# cache for explain results
@cache.cached(timeout=0,key_prefix='explain')
def getExplains(g):
    return g

@api.route('/genBA', methods=['GET'])
def get_ba_graph():
    """Generate 9 ba graphs randomly"""
    logdir = current_app.config['LOGDIR']
    nodes_num = request.args.get('nodes_num',25,type=int)
    m = request.args.get('m', 1, type=int)
    cache.delete(key='genBA')
    BAs,_,_ = genBA(logdir,nodes_num,m)
    print(nodes_num,m)
    return jsonify({"success":True,"BAs":BAs})

@api.route('/selectBA',methods=['GET'])
def select_ba_graph():
    """Return the selected id of the 9 BAs generated before"""
    logdir = current_app.config["LOGDIR"]
    ba_id = request.args.get('id',None,type=int)
    if not ba_id:
        return jsonify({'success':False,"info":"Did not get your choice of BA graph."})
    
    
    # Succefully selected
    BAs,dglgraphs,labels = genBA() # load from cache  

    if ba_id==-1 :
        #find the first not 0 label graph as default graph
        for i in range(len(labels)):
            if labels[i]!=0:
                ba_id = i+1
                break
    
    selected_graph = BAs[ba_id-1]

    # save selected graph to cache
    cache.delete(key='selected_graph')
    getSelectedGraph(dglgraphs[ba_id-1],labels[ba_id-1])
    return jsonify({"success":True,"info":"You have selected graph {}".format(ba_id),'graph':selected_graph})


@api.route('/2layers', methods=['GET'])
def get_2layers_gnn():
    """Calculate features of 2 layers gcn using the selected graph"""
    logdir = current_app.config["LOGDIR"]
    theta = request.args.get('theta',None,type=float)
    if not theta:
        return jsonify({'success':False,"info":"Did not get theta."})

    # save theta in cache
    cache.delete(key='theta')
    theta = getTheta(theta)
    # load from cache
    selected_graph,label = getSelectedGraph()
    features = getFeatures(logdir,selected_graph,theta,label)
    return jsonify({'success':True,'graph':features})

@api.route('/edgemasks',methods=['GET'])
def get_edgemasks():
    """Return the explanation results for the selected graph"""
    logdir = current_app.config["LOGDIR"]
    theta = request.args.get('theta',None,type=float)
    if not theta:
        # load theta from cache
        theta = getTheta()
    else :
        theta = getTheta(theta)
    
    # load from cache
    selected_graph,label = getSelectedGraph()

    # save explain results to cache
    g = getExplains(getExplainResults(logdir,selected_graph,theta,label))

    return jsonify({'success':True,'graph':g})


def test_function(fun):
    fun()

@api.route('/newExplain',methods=['POST'])
def get_newExplain():
    """Receive explain method and return explain results"""
    logdir = current_app.config["LOGDIR"]
    func = None

    # load from cache
    theta = getTheta()
    selected_graph,label = getSelectedGraph()

    data = request.get_data()
    data = eval(str(data,encoding='utf-8'))
    data = data['function_text']

    # use exec to get function instance 
    loc = {}
    exec(data,{},loc)
    func = loc['func']

    try:
        g = get_DIYExplain(logdir,selected_graph,theta,label,func)
        return jsonify({'success':True,'graph':g})
    except Exception as e:
        return jsonify({'success':False,'info':repr(e)})
    
######################################### New code start here #########################################

# init datasets
@api.route('/datasets',methods=['GET'])
def get_datasets():
    # datasets = get_Datasets()
    logdir = current_app.config["LOGDIR"]
    g = {}
    # for dataset in datasets:
    #     writeDictGraph(logdir,dataset,dataset['name'])
    #     g[dataset['name']] = dataset

    # Load datasets from cache
    dataset_names = ['cora','citeseer']
    for dataset in dataset_names:
        with open(logdir+'/'+dataset+'.json') as f:
            g[dataset] = json.load(f)
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
        graph = dgl2dict(squeeze_g,filename)
        g = {}
        g[filename.split('.')[0]] = graph
        return jsonify({'success':True,'graph':g})
    except Exception as e:
        return jsonify({'success':False,'info':repr(e)})