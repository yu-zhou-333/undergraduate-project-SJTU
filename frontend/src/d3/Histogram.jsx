// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/histogram
const d3 = require("d3");
function Histogram(data,prev, {
    value = d => d, // convenience alias for x
    domain, // convenience alias for xDomain
    label, // convenience alias for xLabel
    format, // convenience alias for xFormat
    type = d3.scaleLinear, // convenience alias for xType
    x = value, // given d in data, returns the (quantitative) x-value
    y = () => 1, // given d in data, returns the (quantitative) weight
    thresholds = 40, // approximate number of bins to generate, or threshold function
    normalize, // whether to normalize values to a total of 100%
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width of chart, in pixels
    height = 400, // outer height of chart, in pixels
    insetLeft = 0.5, // inset left edge of bar
    insetRight = 0.5, // inset right edge of bar
    xType = type, // type of x-scale
    xDomain = domain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    xLabel = label, // a label for the x-axis
    xFormat = format, // a format specifier string for the x-axis
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yLabel = "↑ Frequency", // a label for the y-axis
    yFormat = normalize ? "%" : undefined, // a format specifier string for the y-axis
    color = "currentColor" // bar fill color
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y0 = d3.map(data, y);
    const I = d3.range(X.length);
  
    // Compute bins.
    const bins = d3.bin().thresholds(thresholds).value(i => X[i])(I);
    const Y = Array.from(bins, I => d3.sum(I, i => Y0[i]));
    if (normalize) {
      const total = d3.sum(Y);
      for (let i = 0; i < Y.length; ++i) Y[i] /= total;
    }
  
    // Compute default domains.
    if (xDomain === undefined) xDomain = [bins[0].x0, bins[bins.length - 1].x1];
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];

    let antinorm = d3.scaleLinear().domain([xRange[0],xRange[1]]).range([xDomain[0],xDomain[1]])
  
    // Construct scales and axes.
    let xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    let xAxis = g => g
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
    yFormat = yScale.tickFormat(100, yFormat);
    const defaultSelection = []
  

    const svg = prev.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .property('IsSingleRect',1) // initial property
        .property('highlightRange',0)
        ;
  

    
    
    
    const gb = svg.append("g")
  
    svg.append("g")
      .attr('class','bars')
      .attr("fill", color)
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => xScale(d.x0) + insetLeft)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight))
      .attr("y", (d, i) => Math.min(yScale(Y[i]),yScale(yDomain[1]/50)))
      .attr("height", (d, i) => yScale(0) - yScale(Y[i]) ? Math.max(yScale(0) - yScale(Y[i]),yScale(0)-yScale(yDomain[1]/50)) : 0)
          .on('mouseenter',function(e,d){
            if (svg.property('highlightRange')===0 || svg.property('highlightRange').low===undefined)
            {
            d3.select(this).attr("fill",'#009688');
            svg.property('highlightRange',{low:d.x0,
            high:d.x1}).dispatch('highlightRange');
            svg.property('IsSingleRect',1);
            }
          })
          .on('mouseleave',function(e,d){
            if (svg.property('IsSingleRect')){
            d3.select(this).attr("fill",color);
            svg.property('highlightRange',0);
            svg.property('IsSingleRect',0);
          }
          })
        .append("title")
          .text((d, i) => [`${d.x0} ≤ x < ${d.x1}`, yFormat(Y[i])].join("\n"));

      const brush = d3.brushX()
      .extent([[marginLeft, 0.5], [width - marginRight, height - marginBottom + 0.5]])
      .on("brush", brushed)
      .on("end", brushended);
  
      gb
      .call(brush)
      .call(brush.move, defaultSelection);
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .attr('class','x-axis')
        .call(xAxis)
        .call(g => g.append("text")
            .attr("x", width - marginRight)
            .attr("y", 27)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(xLabel));

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));


    function zoom(svg) {
      const extent = [[marginLeft, marginTop], [width - marginRight, height - marginTop]];
    
      svg.call(d3.zoom()
          .scaleExtent([1, 100])
          .translateExtent(extent)
          .extent(extent)
          .on("zoom", zoomed));

      // deactivate pan 
      svg.on("mousedown.zoom", null)
    
      function zoomed(event) {
        xRange = [marginLeft, width - marginRight].map(d => event.transform.applyX(d));
        antinorm = d3.scaleLinear().domain([xRange[0],xRange[1]]).range([xDomain[0],xDomain[1]])
        xScale = xType(xDomain, xRange);
        svg.selectAll(".bars rect").attr("x", d =>xScale(d.x0) + insetLeft).attr("width", 
        d => Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight));
        svg.selectAll(".x-axis").call(xAxis);
      }
    }
    zoom(svg);
    
  
    function brushed({selection}) {

      
      if (selection) {
        svg.property('highlightRange',{low:antinorm(selection[0]),
        high:antinorm(selection[1])}).dispatch('highlightRange');
      }
    }
  
    function brushended({selection}) {

      if (!selection) {
        // rects.style('pointer-events', null)
        gb.call(brush.move, defaultSelection);
        svg.property('highlightRange',0).dispatch('highlightRange');
      }
    }

    // add pan event button
    

    return svg.node();
  }

export default Histogram