
export class ProcessHetergraph
{
    nodes:any = [];
    edges:any = [];
    nfeatures:any = [];
    nfeatures_map:any = [];
    mapp:any = []; //key : NodeType + local id ; value : global id
    edgemask_type:any = [];
    graph_name:string = 'None';
    constructor(g:any)
    {
        let cnt = 0;
        this.graph_name = g.name;
        for (let nodeType in g.features){
            for(let feat in g.features[nodeType])
            {
                this.nfeatures.push(feat.concat(nodeType))
                this.nfeatures_map[feat.concat(nodeType)] = feat;
            }
        }

        // Map different nodes to same id (key : NodeType + local id)
        for (let k in g.num_nodes){
            for (let i = 0 ; i<g.num_nodes[k];i++)
            {
                
                this.mapp[k+i] = cnt;
                var feas:any = {};
                for (let fea_k in g['features'][k])
                {
                    feas[fea_k] = g['features'][k][fea_k][i]
                }
                this.nodes[cnt]={id:cnt,ntype:k,localid:i,features:feas};
                cnt+=1;
            }
        }

        for (let k in g.graphs)
        {
            let subg = g.graphs[k]
            let dst_type = subg['graph_type']['dst_type']
            let edge_type = subg['graph_type']['edge_type']
            let src_type = subg['graph_type']['src_type']
            for (let i = 0 ; i < subg['dsts'].length ; i++)
            {
                var feas:any = {};
                for (let fea_k in subg['edge_mask'])
                {
                    if (!this.edgemask_type.includes(fea_k)) {this.edgemask_type.push(fea_k)} 
                    feas[fea_k] = subg['edge_mask'][fea_k][i]
                }

                // ******************** if not ground_truth label, please delete this section ********
                let type = 0;
                if (feas['ground_truth']) type=1;
                // **********************************************************************************
                this.edges.push({source : this.mapp[src_type+subg['srcs'][i]],target : this.mapp[dst_type+subg['dsts'][i]],
            edgemasks:feas,type:type});
            }
        }
    }

    addEdgeMask = (g:any) =>{
        for (let k in g.graphs)
        {
            let subg = g.graphs[k]
            let dst_type = subg['graph_type']['dst_type']
            let edge_type = subg['graph_type']['edge_type']
            let src_type = subg['graph_type']['src_type']
            for (let i = 0 ; i < subg['dsts'].length ; i++)
            {
                var feas:any = this.edges[i].edgemasks;
                for (let fea_k in subg['edge_mask'])
                {
                    if (!this.edgemask_type.includes(fea_k)) {this.edgemask_type.push(fea_k)} 
                    feas[fea_k] = subg['edge_mask'][fea_k][i]
                }
                this.edges[i].edgemasks = feas;
            }
        }
    }

    // given edge mask type . Return edges with type [1,2,3,4]. where 3 means exists both in given range and ground truth, 
    // 1 means exists only in ground truth, 2 means exists only in given range, 4 means others, 0 means default 
    genEdgeType = (eRange:any,eType:string) =>{
        if (!this.edgemask_type.includes(eType)) return 'Invalid edge mask type';
        let low = eRange.low;
        let high = eRange.high;
        for (let idx in this.edges)
        {
            if (this.edges[idx].edgemasks['ground_truth'] && this.edges[idx].edgemasks[eType]>=low && this.edges[idx].edgemasks[eType]<=high)
            {
                this.edges[idx] = {...this.edges[idx],type:1}
            }
            else if(this.edges[idx].edgemasks['ground_truth']){
                this.edges[idx] = {...this.edges[idx],type:2}
            }
            else if(this.edges[idx].edgemasks[eType]>=low && this.edges[idx].edgemasks[eType]<=high){
                this.edges[idx] = {...this.edges[idx],type:3}
            }
            else {
                this.edges[idx] = {...this.edges[idx],type:4}
            }
        }
        return this.edges
    }
}


export function processHeter(g:any)
{
    let cnt = 0;
        let nodes = [];
        let features = [];
        let edges = [];
        let label = g.label;
        let mapp:any = [];

        // Map different nodes to same id (key : NodeType + local id)
        for (let k in g.num_nodes){
            for (let i = 0 ; i<g.num_nodes[k];i++)
            {
                nodes.push({id:cnt,IsGT:g['features'][k]['ground_truth'][i]});
                mapp[k+i] = cnt;
                features[cnt] = g['features'][k]['x'][i] // Modify 'x' if features change
                cnt+=1;
            }
        }

        for (let k in g.graphs)
        {
            let subg = g.graphs[k]
            let dst_type = subg['graph_type']['dst_type']
            let edge_type = subg['graph_type']['edge_type']
            let src_type = subg['graph_type']['src_type']
            for (let i = 0 ; i < subg['dsts'].length ; i++)
            {
                edges.push({source : mapp[src_type+subg['srcs'][i]],target : mapp[dst_type+subg['dsts'][i]]})
            }
        }

        return {
            nodes : nodes,
            edges : edges,
            label : label
        }
} 