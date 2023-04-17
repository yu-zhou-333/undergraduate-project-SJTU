# undergraduate-project-SJTU
## Get Started

### Install Node.js

For now, the website can only be ran in debug mode.  A Node.js environment will be required. You may visit this [website](https://nodejs.org/en/) to download the latest version.

### Clone the project

```
git clone https://github.com/yu-zhou-333/VisualToolForGNNExplainerBenchmark.git
```

There two parts you need to activate before seeing the pages.

### Frontend

First, cd to frontend and install the requirements using node.

```
cd VisualToolForGNNExplainerBenchmark/frontend
```

```
npm install
npm start
```

or if you use yarn: 

```
yarn install
yarn start 
```

The page will be displayed at localhost:3000.

### Backend

Second, cd to backend and install requirements.

```
cd VisualToolForGNNExplainerBenchmark/backend
conda env create -f backend.yaml
conda activate backend
```

then, run the following command to activate backend.

```
python server.py --logdir cache/
```

