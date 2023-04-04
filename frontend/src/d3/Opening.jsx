import { ForceGraph } from "./FDGDirected";
import Histogram from "./Histogram"

var d3 = require("d3");

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
    }={}
)
{
    const graph = {nodes,links}
    console.log(graph)

    // const fdg = ForceGraph(prevFDG,graph,{
    //     nodeFill:'#2196f3',
    //     linkTypes:[1,2,3,4],
    //     // edgemask: d=>d.edgemasks[method],
    //     width:700,
    //     linktype : d=>d.type
    // })

    const hist = Histogram(nodes,prevHis,{
        value: d=>d.features[nfeature],
        thresholds: bins,
        label: hist_label,
        color:'#2196f3',
        width:700
    })

    //When histogram is selected, update fdg
    // d3.select(hist).on('highlightRange',()=>{
    //     fdg.updateEdge(hist.highlightRange)
    //   })

}