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

export default function OpeningGraphs(
    prevHis,
    prevFDG, // the d3 selection where to append the graph
    {
        nodes, // an iterable of node objects (typically [{id}, …])
        links // an iterable of link objects (typically [{source, target}, …])
    },
    {
        nfeature, // method to display in his
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
    const graph = {nodes,links}
    let fdg_nodes = nodes;
    let fdg_links = links;
    var fdg,hist;
    let nid = nodeID;
    let hop = Hop;
    let highlight_fdg_nodes = [];
    

    if (nid !== undefined) {
        fdg_nodes = SelectNodesByID_BFS();
        fdg_links = SelectEdgesByNodes(fdg_nodes,links);
    }
    if (Display_label !== undefined) {
        fdg_nodes = fdg_nodes.filter(function(node){return node.features[Display_label]})
        fdg_links = SelectEdgesByNodes(fdg_nodes,links)
    }

    // console.log(fdg_nodes,fdg_links)

    function SelectNodesByID_BFS(){
        // console.log('nid',nid);
        // console.log('hop',hop);
        let list = [{node:nodes[nid],hop:0}],selected_list = [];
        let current,current_hop=0;
        while (list.length!==0){
            current = list.pop();
            selected_list.push(current.node);
            current_hop = current.hop;
            for(let k in links){
                if (links[k].source === current.node.id && !selected_list.includes(nodes[links[k].target])){
                    
                    if (current_hop>=hop) continue;
                    list.push({
                        node:nodes[links[k].target],
                        hop:current_hop+1
                    });
                }
            }
        }
        console.log('selected_list',selected_list);
        return selected_list;
    }

    function SelectNodesByNFeature(nmin,nmax){
        fdg_nodes = nodes.filter(function(node){return node.features[nfeature]>=nmin && node.features[nfeature]<=nmax})
        fdg_links = SelectEdgesByNodes(fdg_nodes,links)
        return {
            nodes: fdg_nodes,
            links: fdg_links
        }
    }
    
    function drawGraph(){
        drawFDG()
    
        hist = Histogram(nodes,prevHis,{
            value: d=>d.features[nfeature],
            thresholds: bins,
            label: hist_label,
            color:'#2196f3',
            width:width,
            height:height/3
        })

        //When histogram is selected, update fdg
        d3.select(hist).on('highlightRange',()=>{
            console.log(hist.highlightRange);
            let g = SelectNodesByNFeature(hist.highlightRange.low,hist.highlightRange.high);
            drawFDG();
            // fdg.updateEdge(hist.highlightRange)
        })

        prevHis.selectAll('svg').style("border","solid 1px #2196f3")
    }

    function cleanFDG(){
        prevFDG.selectAll("svg").remove();
    }

    function drawFDG(){
        cleanFDG();
        fdg = ForceGraph(prevFDG,{nodes:fdg_nodes,links:fdg_links},{
            nodeFill:'#2196f3',
            linkTypes:[1,2,3,4],
            // edgemask: d=>d.edgemasks[method],
            width:width,
            height:height/2,
            HighlightNodes:highlight_fdg_nodes,
            linktype: d=>1
        })

        // When FDG is selected, update fdg
        d3.select(fdg).on('CenterNode',()=>{
            nid = fdg.CenterNode.centernode;
            highlight_fdg_nodes = fdg.CenterNode.highlightlist
            fdg_nodes = SelectNodesByID_BFS();
            console.log('bfs nodes',fdg_nodes)
            fdg_links = SelectEdgesByNodes(fdg_nodes,links);
            drawFDG();
        })

        d3.select(fdg).on('HighlightNodes',()=>{
            console.log('highligh nodes',fdg.HighlightNodes)
            highlight_fdg_nodes = fdg.HighlightNodes
        })
        prevFDG.selectAll('svg').style("border","solid 1px #2196f3");
    }

    function update_nid(new_nid){
        nid = new_nid;
    }
    function update_hop(new_hop){
        hop = new_hop;
    }
    function update_fdgnodes(){
        fdg_nodes = SelectNodesByID_BFS();
        fdg_links = SelectEdgesByNodes(fdg_nodes,links);
    }

    

    return Object.create({
        drawGraph : drawGraph,
        cleanFDG : cleanFDG,
        update_hop: update_hop,
        update_nid : update_nid,
        update_fdgnodes : update_fdgnodes,
        drawFDG : drawFDG
    })

}