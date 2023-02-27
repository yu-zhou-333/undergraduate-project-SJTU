export const function_text = 'def YourExplainer(model, task_type, g, x, target):  #do not modify\n\t\'\'\'\n\
\tYou can provide your own explainer function here\n\
\tParameters:\n\
\t\tmodel : the 2 layers model introduced before. You may use ret = model(g,x) to get the output.\n\
\t\tg : the selected graph given in dgl graph\n\
\t\tx : the input value of each node\n\
\t\ttarget : Task type. 1 for 2 pentagons ; 2 for 1 pentagon and 1 house ; 3 for 2 houses\n\
\t\ttask_type : Don\'t need to specify\n\
\tReturns\:\n\
\t\tA list of intergers whose size equals to the number of edges\n\n\
\t\tExamples\:\n\
\t\tA random method\:\n\
\t\t\treturn np.random.uniform(size=g.num_edges())\n\t\'\'\'\n\
\t# Your import area\n\n\
\t#import numpy as np\n\n\
\t#Your code strats here\n\n\t#return np.random.uniform(size\=g.num_edges())\n\n\
\t# End of your code\n\nfunc = YourExplainer'