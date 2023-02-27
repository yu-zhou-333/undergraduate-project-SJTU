# Backend For Visual Tool 
This is the backend of the website. You may find the algorithms and models we use here.
## environment
We recommend you use conda to manage your environment.

To install with conda:
```
conda env create -f backend.yaml
```

To activate:
```
conda activate backend
```

## Structure
```
root/
    |— backend
        |— server.py  place to initialize and activate 
        |— api.py  entrance for frontend
        |— db.py   data process functions
        |— extension.py  extension of flask such as cache
```
