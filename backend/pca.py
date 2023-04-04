import numpy as np

def PCA(X,n):
    X = np.array(X.T)
    X_mean = np.mean(X,axis=1)
    X = X - X_mean.reshape(-1,1)
    cov_mat = np.dot(X,X.T)
    values,vectors = np.linalg.eig(cov_mat)
    eig_mat = [(np.abs(values[i]),vectors[:,i]) for i in range(len(X))]
    eig_mat.sort(reverse=True,key=lambda x:x[0])
    WT = np.array([i[1] for i in eig_mat[:n]])
    return np.transpose(np.dot(WT,X))

