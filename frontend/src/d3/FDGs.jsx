var d3 = require("d3");


export function ForceGraph(prev,
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
  }, {
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels

    linkSource = ({source}) => source, // given d in links, returns a node identifier string
    linkTarget = ({target}) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation // when this promise resolves, stop the simulation
  } = {},
    {
      nodeStrength,
      linkStrength
    } = {}
  ) {
    // Compute values.
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
    const highlightNode = []
    var transform = d3.zoomIdentity;
  
    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
    links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));
  
    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);
  
    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
  
    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);
  
    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center",  d3.forceCenter())
        .on("tick", ticked);
  
    const svg = prev.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

                        
    const link = svg.append("g")
        .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
      .selectAll("line")
      .data(links)
      .join("line");
  
    const node = svg.append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .property("highlightNode",highlightNode)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", nodeRadius)
        .call(drag(simulation))
        .on('mouseenter',function (e,d) {

          // set the current node to highlight and let others know
          svg.property('highlightNode',[d.id]).dispatch('highlightNode')
        })
        .on('mouseleave',function (e,d) { 
          svg.property('highlightNode',highlightNode).dispatch('highlightNode')
        });
    
  
    if (W) link.attr("stroke-width", ({index: i}) => W[i]);
    if (L) link.attr("stroke", ({index: i}) => L[i]);
    if (G) node.attr("fill", ({index: i}) => color(G[i]));
    if (T) node.append("title").text(({index: i}) => T[i]);
    const nodesText = svg.selectAll("text.label")
                          .data(nodes)
                          .enter().append("text")
                          .attr('text-anchor', 'middle')
                          .attr("class", "label")
                          .attr("fill", "black")
                          .attr("stroke", "black")
                          .attr("stroke-width", 1)
                          .attr("visibility","hidden")
                          .style('pointer-events', 'none') // 禁止鼠标事件
                          .text(({index: i}) => T[i]);
    
    

    if (invalidation != null) invalidation.then(() => simulation.stop());
  
    function intern(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }
  
    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);  


      nodesText
        .attr("x", d => d.x)
        .attr("y", d => d.y);
      
    }
  
    function drag(simulation) {    
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }


    const zoom = d3.zoom()
    .scaleExtent([1/2, 64])
    .on("zoom", zoomed);

    svg.call(zoom)
    .call(zoom.translateTo, 0, 0);

    function zoomed(event) {
      transform = event.transform;
      node.attr("transform", event.transform);
      link.attr("transform", event.transform);
      nodesText.attr("transform", event.transform);
    }

    function updateNode(highlightId,IsInitial=0){
      if (IsInitial) {
        node.attr('r',5);
        nodesText.attr("visibility","hidden")
      }
      else{
      nodesText.attr('visibility',({id:i})=>{
        if (highlightId.includes(i)) return 'visible';
        else return 'hidden';
      })
      node.attr('r',({id:i})=>{
        if (highlightId.includes(i)) return 10;
        else return 5;
      })}
    }

    return Object.assign(svg.node(), {scales: {color},updateNode:updateNode});
  }



function ForceGraphs(prev1,prev2,prev3,
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
  }
  )
  {
    const graph = {nodes,links}
    const g1 = ForceGraph(prev1,graph,{nodeTitle:(d)=>d.features['x'][0],nodeFill:'#2196f3'})
    const g2 = ForceGraph(prev2,graph,{nodeTitle:d=>d.features['x1'],nodeFill:'#2196f3'})
    const g3 = ForceGraph(prev3,graph,{nodeTitle:d=>d.features['x2'],nodeFill:'#2196f3'})
    
    //When graph3 is selected,update g3,g2,g1
    d3.select(g3).on('highlightNode',()=>{
      let hg2 = getNot0Neighbor(g3.highlightNode,'x1'); //features needed to be highlighted in graph2
      let hg1 = getNot0Neighbor(hg2.Nid,'x');
      // console.log('hg2',hg2.Nid)
      // console.log('hg1',hg1.Nid)
      g3.updateNode(g3.highlightNode)
      g2.updateNode(hg2.Nid);
      g1.updateNode(hg1.Nid);
    })

    //When graph2 is selected, update g2,g1
    d3.select(g2).on('highlightNode',()=>{
      let hg1 = getNot0Neighbor(g2.highlightNode,'x')
      // console.log('hg1',hg1.Nid)
      g2.updateNode(g2.highlightNode)
      g1.updateNode(hg1.Nid);
    })

    //When graph1 is selected, update g1
    d3.select(g1).on('highlightNode',()=>{
      g1.updateNode(g1.highlightNode)
    })



    //given id, return neighbors that cotribute to this node
    function getNot0Neighbor(ids,feature_key){
      let Nid = ids.map((T)=>T)
      let Links = []
      for (let T of graph.links){
        if (ids.includes(T.target) && graph.nodes[T.source].features[feature_key] !== (0 && [0]))
        {
          Nid.push(T.source)
          Links.push({source:T.source,target:T.target})
          if (graph.nodes[T.target].features[feature_key] !== (0 && [0]))// If undirected
            Links.push({source:T.target,target:T.source}) 
        }
      }
      return {
        Nid : Nid,
        links : Links
      }
    }




    function showReadout(activate=0)
    {
      if (activate)
      {
        let hg3 = graph.nodes.filter(T=>T.features['x2']!==0)
        hg3 = hg3.map(T => T.id)
        let hg2 = getNot0Neighbor(hg3,'x1')
        let hg1 = getNot0Neighbor(hg2.Nid,'x')
        // console.log('hg3',hg3)
        // console.log('hg2',hg2.Nid)
        // console.log('hg1',hg1.Nid)
        g3.updateNode(hg3)
        g2.updateNode(hg2.Nid)
        g1.updateNode(hg1.Nid)
      }
      else{
        g3.updateNode([])
        g2.updateNode([])
        g1.updateNode([])
      }
    }
    return Object.assign( {showReadout:showReadout});
  }
  

  export default ForceGraphs;