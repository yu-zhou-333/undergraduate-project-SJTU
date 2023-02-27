import { ForceGraph } from "./FDGDirected";
import Histogram from "./Histogram"

var d3 = require("d3");

export default function ExplainGraphs(
    prevHis,
    prevFDG, // the d3 selection where to append the graph
    {
        nodes, // an iterable of node objects (typically [{id}, …])
        links // an iterable of link objects (typically [{source, target}, …])
    },
    {
        method, // method to display in his
        bins // approximate number of bins
    }={}
)
{
    const graph = {nodes,links}

    const fdg = ForceGraph(prevFDG,graph,{
        nodeFill:'#2196f3',
        linkTypes:[1,2,3,4],
        edgemask: d=>d.edgemasks[method],
        width:700,
        linktype : d=>d.type
    })

    const hist = Histogram(links,prevHis,{
        value: d=>d.edgemasks[method],
        thresholds: bins,
        label: 'explaination result of each edge',
        color:'#2196f3',
        width:700
    })

    //When histogram is selected, update fdg
    d3.select(hist).on('highlightRange',()=>{
        fdg.updateEdge(hist.highlightRange)
      })

}