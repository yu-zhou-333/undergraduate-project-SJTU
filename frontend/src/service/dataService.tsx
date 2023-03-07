import axios from 'axios';

// If enable, then it will load static data. Otherwise, it will load from remote backend.
// Currently, it does not support remote backend mode. 
const ENABLE_STATIC_JSON = false;
// Remote Backend.
const URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:7777'
    : window.location.origin;
const axiosInstance1 = axios.create({
    baseURL: `${URL}/api/`,
    // timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

// Load Static Data.
const URL2 = window.location.origin;
const axiosInstance2 = axios.create({
    baseURL: `${URL2}/data/`,
    // timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

let axiosInstance = (ENABLE_STATIC_JSON)?axiosInstance2:axiosInstance1;


// Read 9 BAs.
export async function get9BAs(nodes_num:number,m:number): Promise<any>{
    let url = '/genBA';
    let res;
    let params = {nodes_num,m};
    res = await axiosInstance.get(url,{params});
    if (res.status === 200){
        return res.data;
    }
    throw res;
}

// select one BA
export async function selectBA(id:number) : Promise<any>{
    let url = '/selectBA';
    let res;
    let params = {id};
    res = await axiosInstance.get(url,{params});
    if (res.status === 200){
        return res.data;
    }
    throw res;
}

// get GNN features of the selected BA
export async function getFeatures(theta:number) : Promise<any>{
    let url = '/2layers';
    let res;
    let params = {theta};
    res = await axiosInstance.get(url,{params});
    if (res.status === 200){
        return res.data;
    }
    throw res;
}

// get Explain Resultes of the selected BA
export async function getExplain(theta:number) : Promise<any>{
    let url = '/edgemasks';
    let res;
    let params = {theta};
    res = await axiosInstance.get(url,{params});
    if (res.status === 200){
        return res.data;
    }
    throw res;
}


// upload ExplainMethod and get explain results
export async function uploadExplainMethod(text:any) : Promise<any>{
    let url = '/newExplain';
    let res;
    let data = {
        function_text : text
    }
    console.log('sending post')
    res = await axiosInstance.post(url,data);
    
    if (res.status === 200){
        return res.data;
    }
    throw res;
}

export async function getDatasets(): Promise<any>{
    let url = '/datasets';
    let res;
    res = await axiosInstance.get(url);
    
    if (res.status === 200){
        return res.data;
    }
    throw res;
}