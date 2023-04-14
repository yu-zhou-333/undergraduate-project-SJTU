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
    HighlightNodeFill = '#ff1744', // Node color when selected
    HighlightNodes = [], // nodes to highlight
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels

    linkSource = ({source}) => source, // given d in links, returns a node identifier string
    linkTarget = ({target}) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.2, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkTypes=[1,2,3,4], // list of types of edge
    edgemask = d=>1, // function of edge mask
    linktype = d=>0, // given d , return the type of d where 1 means ground truth; set 1 to obtain link arrow
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
    // console.log('Ingraphnodes',nodes)
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
    const CenterNode = []
    var transform = d3.zoomIdentity;
    
    
    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
    links = d3.map(links, (v,i) =>  ({source: LS[i], target: LT[i],edgemask:edgemask(v),type:linktype(v)})); 

    // normalize function for link
    const EGM = links.map(d=>d.edgemask); //Array for edge mask
    const normalize_EGM = d3.scaleLinear().domain([d3.min(EGM),d3.max(EGM)]).range([0,1]);
    
  
    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);
  
    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
    const linkColor = d3.scaleOrdinal(linkTypes,colors);

  
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


    // add length
    // var data_legend = [
    //     {
    //         name:"Selected edge match Ground Truth",
    //         color:linkColor(linkTypes[3])
    //     },
    //     {
    //         name:"Selected edge mismatch Ground Truth",
    //         color:linkColor(linkTypes[2])
    //     },
    //     {
    //         name:"Ground Truth",
    //         color:linkColor(linkTypes[1])
    //     }
    // ];

    // var legend = svg.selectAll(".legend") 
    //     .data(data_legend)
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d, i) { return "translate(-350," + (i * 20 - 200) + ")"; }); 
    

    // legend.append("rect")
    //     .attr("x", width - 25)
    //     .attr("y", 8)
    //     .attr("width", 40)
    //     .attr("height", 3) 
    //     .attr("fill", d=>d.color);

    // legend.append("text")
    //     .attr("x", width - 30)
    //     .attr("y", 15)
    //     .style("text-anchor", "end") 
    //     .text(d=>d.name);
  

    
        // Per-type markers, as they don't inherit styles.
    const linkArrow = svg.append("defs").selectAll("marker")
                          .data(linkTypes)
                          .join("marker")
                            .attr("id", d => `arrow-${d}`)
                            .attr("viewBox", "0 -5 10 10")
                            .attr("refX", 20)
                            .attr("refY", -0.5)
                            .attr("markerWidth", 4)
                            .attr("markerHeight", 4)
                            .attr("orient", "auto")
                          .append("path")
                            .attr("fill", linkColor)
                            .attr("d", "M0,-5L10,0L0,5");
                     
    
     

    const link = svg.append("g")
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("id",d=>'link-'+d.index)
      .attr("stroke-opacity", d=>normalize_EGM(d.edgemask))   
      .attr("stroke", d=>d.type? linkColor(linkTypes[1]) : linkColor(linkTypes[0]))  
      .attr("marker-end", d =>  d.type ?`url(${new URL(`#arrow-${linkTypes[1]}`, location)})`: null);
  
    const node = svg.append("g")
        
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .property("CenterNode",CenterNode)
        .property("HighlightNodes",HighlightNodes)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("fill",d => HighlightNodes.includes(d.id) ? HighlightNodeFill : nodeFill)
        .attr("r",d => HighlightNodes.includes(d.id) ? nodeRadius*2 : nodeRadius)
        .call(drag(simulation))
        .on('mouseenter',function (e,d) {
          // set the current node to highlight and let others know
          d3.select(this).attr('r',nodeRadius*2)
                          .attr('fill',HighlightNodeFill)
                          .style('cursor', 'pointer')
        })
        .on('mouseleave',function (e,d) { 
          if (!HighlightNodes.includes(d.id))
          {// if the node is not in highlight list, dehighlight it
            d3.select(this).attr('r',nodeRadius)
                          .attr('fill',nodeFill)
                          .style('cursor','default')
                        }
        })
        .on('click',function (e,d){
          //single click to highlight/dehighlight the node
          if(HighlightNodes.includes(d.id)){
            HighlightNodes =  HighlightNodes.filter(e=>e!==d.id);
            d3.select(this).attr('r',nodeRadius)
                          .attr('fill',nodeFill)
            svg.property('HighlightNodes',HighlightNodes).dispatch('HighlightNodes');
          }
          else{
            HighlightNodes.push(d.id);
            d3.select(this).attr('r',nodeRadius*2)
                            .attr('fill',HighlightNodeFill)
            svg.property('HighlightNodes',HighlightNodes).dispatch('HighlightNodes');
          }
        })
        .on('dblclick',function(e,d){
          // double click to use the node as center node
          svg.property('CenterNode',{centernode : d.id,highlightlist : HighlightNodes})
          .dispatch('CenterNode')
        });
    
  
    if (W) link.attr("stroke-width", ({index: i}) => W[i]);
    if (L) link.attr("stroke", ({index: i}) => L[i]);
    if (G) node.attr("fill", ({index: i}) => color(G[i]));
    if (T) node.append("title").text(({index: i}) => T[i]);
    const nodesText = svg.selectAll("text.label")
                          .data(nodes)
                          .enter().append("text")
                          .attr("x", 8)
                          .attr("y", "0.31em")
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
        .attr("y2", d => d.target.y)
        .attr("d", linkArc);
  
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
      // linkD.attr("transform",event.transform);
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

    function judgeType (high,low,edgemask,type)
    {
        if( edgemask < high && edgemask >= low) // if it is selected
            {
                if (type) // if it is ground truth
                {
                 return  3
                }
                else
                {
                 return  2
                }
            }
        else if (type)
        {
          return 1
        }
        else {
          return 0
        }
    }

    function updateEdge(highlightRange)
    {
        let low = highlightRange.low
        let high = highlightRange.high
        link.attr("marker-end", d => {
            let ret = linkTypes[judgeType(high,low,d.edgemask,d.type)]
            return ret>1 ? `url(${new URL(`#arrow-${ret}`, location)})` : null; //only add arrow when the edge is selected or it is ground truth.
        })
        .attr("stroke",d=>{
            let ret = linkTypes[judgeType(high,low,d.edgemask,d.type)]
            return linkColor(ret)
        })
        .attr("stroke-opacity",d=>{
          let ret = judgeType(high,low,d.edgemask,d.type)
          return ret>1 ? 1 : normalize_EGM(d.edgemask)
        })
        .attr("stroke-width",d=>{
          let ret = judgeType(high,low,d.edgemask,d.type)
          return  typeof linkStrokeWidth !== "function" ? (ret===3 ? linkStrokeWidth*2 : linkStrokeWidth) :  null
        })
      
    }
    
    function linkArc(d) {
      const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
      return `
        M${d.source.x},${d.source.y}
        A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
      `;
    }

    return Object.assign(svg.node(), {scales: {color},updateNode:updateNode,updateEdge:updateEdge});
  }