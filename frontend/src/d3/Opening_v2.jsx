import { ForceGraph } from "./FDGDirected";
import Histogram from "./Histogram"

var d3 = require("d3");

export function SelectEdgesByNodes(nodes,edges){
    let availableID = nodes.map(d=>d.id);
    let new_edges = edges.filter(function(edge){
        return availableID.includes(edge.source) && availableID.includes(edge.target)
    })
    return new_edges
}

export default class OpeningGraphs{
    constructor(
    prevHis,
    prevFDG, // the d3 selection where to append the graph
    {
        nodes, // an iterable of node objects (typically [{id}, …])
        links // an iterable of link objects (typically [{source, target}, …])
    },
    {
        nfeature, // node feature
        bins, // approximate number of bins
        hist_label, // label for histogram
        width, // the width of the window
        height // the height of the window
    }={},
    {
        Display_label, // label for nodes needed to be displayed
    }={},
    {
        nodeID, // specify node by id
        Hop, // hop for the node
    }={},
)
    {
        this.nodes = nodes;
        this.links = links;
        this.fdg_nodes = nodes;
        this.fdg_links = links;
        this.fdg;
        this.hist;
        this.nid = nodeID;
        this.hop = Hop;
        this.highlight_fdg_nodes = [];
        this.prevHis = prevHis;
        this.prevFDG = prevFDG;
        this.nfeature = nfeature;
        this.bins = bins;
        this.hist_label = hist_label;
        this.width = width;
        this.height = height;
        if (this.nid !== undefined) {
            this.fdg_nodes = this.SelectNodesByID_BFS();
            this.fdg_links = SelectEdgesByNodes(this.fdg_nodes,this.links);
        }
        if (Display_label !== undefined) {
            this.fdg_nodes = this.fdg_nodes.filter(function(node){return node.features[Display_label]})
            this.fdg_links = SelectEdgesByNodes(this.fdg_nodes,this.links)
        }
    }

    // console.log(fdg_nodes,fdg_links)

    SelectNodesByID_BFS(){
        console.log('niddd',this.nid);
        console.log('hoppp',this.hop);
        let list = [{node:this.nodes[this.nid],hop:0}],selected_list = [];
        let current,current_hop=0;
        while (list.length!==0){
            current = list.pop();
            if(!selected_list.includes(current.node))selected_list.push(current.node);
            current_hop = current.hop;
            for(let k in this.links){
                if (this.links[k].source === current.node.id){
                    if (current_hop>=this.hop) continue;
                    list.push({
                        node:this.nodes[this.links[k].target],
                        hop:current_hop+1
                    });
                }
            }
        }
        return selected_list;
    }

    SelectNodesByNFeature(nmin,nmax,nfeature){
        this.fdg_nodes = this.nodes.filter(function(node){return node.features[nfeature]>=nmin && node.features[nfeature]<=nmax})
        this.fdg_links = SelectEdgesByNodes(this.fdg_nodes,this.links)
        return {
            nodes: this.fdg_nodes,
            links: this.fdg_links
        }
    }
    
    drawGraph(){
        this.drawFDG()
    
        this.hist = Histogram(this.nodes,this.prevHis,{
            value: d=>d.features[this.nfeature],
            thresholds:this.bins,
            label: this.hist_label,
            color:'#2196f3',
            width:this.width,
            height:this.height/3
        })

        //When histogram is selected, update fdg
        d3.select(this.hist).on('highlightRange',()=>{
            console.log(this.hist.highlightRange);
            let g = this.SelectNodesByNFeature(this.hist.highlightRange.low,this.hist.highlightRange.high,this.nfeature);
            this.drawFDG();
            // fdg.updateEdge(hist.highlightRange)
        })

        this.prevHis.selectAll('svg').style("border","solid 1px #2196f3")
    }

    cleanFDG(){
        console.log('cleanFDG',this.prevFDG);
        this.prevFDG.selectAll("svg").remove();
    }

    drawFDG(){
        console.log('nid',this.nid);
        console.log('hop',this.hop);
        this.cleanFDG();
        let fdg = ForceGraph(this.prevFDG,{nodes:this.fdg_nodes,links:this.fdg_links},{
            nodeFill:'#2196f3',
            linkTypes:[1,2,3,4],
            // edgemask: d=>d.edgemasks[method],
            width:this.width,
            height:this.height/2,
            HighlightNodes:this.highlight_fdg_nodes,
            CenterNodeId:this.nid,
            linktype: d=>1
        })

        // When FDG is selected, update fdg
        d3.select(fdg).on('CenterNode',()=>{
            this.nid = fdg.CenterNode.centernode;
            this.highlight_fdg_nodes = fdg.CenterNode.highlightlist
            this.fdg_nodes = this.SelectNodesByID_BFS();
            this.fdg_links = SelectEdgesByNodes(this.fdg_nodes,this.links);
            this.drawFDG();
        })

        d3.select(fdg).on('HighlightNodes',()=>{
            this.highlight_fdg_nodes = fdg.HighlightNodes
        })
        this.fdg = fdg;
        this.prevFDG.selectAll('svg').style("border","solid 1px #2196f3");
    }

    update_nid(new_nid){
        this.nid = new_nid;
    }
    update_hop(new_hop){
        this.hop = new_hop;
    }
    update_fdgnodes(){
        this.fdg_nodes = this.SelectNodesByID_BFS();
        this.fdg_links = SelectEdgesByNodes(this.fdg_nodes,this.links);
    }

    

    }