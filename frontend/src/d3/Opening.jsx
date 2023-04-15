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
    {
        nidButton, // selection of nodeid button
        hopButton, // selection of hop button
    }={},
)
{
    var fdg_nodes = nodes;
    var fdg_links = links;
    var fdg,hist;
    var nid = nodeID;
    var hop = Hop;
    var highlight_fdg_nodes = [];
    

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
        console.log('niddd',nid);
        console.log('hoppp',hop);
        let list = [{node:nodes[nid],hop:0}],selected_list = [];
        let current,current_hop=0;
        while (list.length!==0){
            current = list.pop();
            if(!selected_list.includes(current.node))selected_list.push(current.node);
            current_hop = current.hop;
            for(let k in links){
                if (links[k].source === current.node.id){
                    if (current_hop>=hop) continue;
                    list.push({
                        node:nodes[links[k].target],
                        hop:current_hop+1
                    });
                }
            }
        }
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
        console.log('nid',nid);
        console.log('hop',hop);
        cleanFDG();
        fdg = ForceGraph(prevFDG,{nodes:fdg_nodes,links:fdg_links},{
            nodeFill:'#2196f3',
            linkTypes:[1,2,3,4],
            // edgemask: d=>d.edgemasks[method],
            width:width,
            height:height/2,
            HighlightNodes:highlight_fdg_nodes,
            CenterNodeId:nid,
            linktype: d=>1
        })

        // When FDG is selected, update fdg
        d3.select(fdg).on('CenterNode',()=>{
            nid = fdg.CenterNode.centernode;

            // update nid outside
            console.log('changeNodeID')
            nidButton.property("value",nid);
            highlight_fdg_nodes = fdg.CenterNode.highlightlist
            fdg_nodes = SelectNodesByID_BFS();
            fdg_links = SelectEdgesByNodes(fdg_nodes,links);
            drawFDG();
        })

        d3.select(fdg).on('HighlightNodes',()=>{
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