var d3 = require("d3");


export function NodesNavigator(prev,{
    nodes,
    id = d=>d.id,
    height,
    width,
}={}){
    const svg = prev.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
    
}