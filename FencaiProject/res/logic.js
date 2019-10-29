var svg = d3.select("svg");
var svg_width = parseInt(getComputedStyle(document.querySelector(".svg-viewer")).width,10);
var svg_height = parseInt(getComputedStyle(document.querySelector(".svg-viewer")).height,10);
//var d3ColorScale20 = d3.scaleOrdinal(d3.schemeCategory20);
var d3ColorScale20 = d3.scaleOrdinal().range(["orange", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "red", "gold"])
var radius = 15;
var nodes_data = null;
var links_data = null;
var lastClickedNode = null;


document.getElementById("fileInput-json-graph").onchange = function () {
    
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    if(event.target.files.length == 0){
        alert("No file is elected!");
        return;
    }

    var file = event.target.files[0]; // FileList object
    var reader = new FileReader();

    reader.onload = function(event) {
        inputFileURL = event.target.result;
        PreprocessInputFile();
        RenderInputFile();
        SetAllContollersDisabled(false);
    };

    reader.readAsDataURL(file); // return a URL representing encoded file's path
}

function InitialSliderRangeWithLinksWeights(graphLinks) {
    // Among ALL links, find min/max Wcousage to setup slider
    var min = 99999, max = 0;
    for (var i = 0; i < graphLinks.length; i++) {
        /////////
        if (graphLinks[i]["weight"] < min)
            min = graphLinks[i]["weight"];
        if (graphLinks[i]["weight"] > max)
            max = graphLinks[i]["weight"];
    }
    
    document.getElementById("slider_min_label").innerHTML = min;
    document.getElementById("slider_max_label").innerHTML = max;
    var slider_element = document.getElementById("slider_id");
    slider_element.min = min;
    slider_element.max = max;
    slider_element.value = min;
    var newStep = (max-min)/10;
    slider_element.step = newStep;
    UpdateSliderLabel();
}

function InitialListOfNodeTypes(graphNodes) {
    function AddNewItemToCombobox(classname) {
        var newOption = document.createElement("option");
        newOption.text = classname;
        nodeTypes_cb.add(newOption, nodeTypes_cb[nodeTypes_cb.options.length]);
    }

    for (i = nodeTypes_cb.options.length - 1; i >= 0; i--) { // Clear combobox
        nodeTypes_cb.remove(i);
    }

    AddNewItemToCombobox("All");

    if(graphNodes.length >0 && typeof(graphNodes[0]["type"]) == 'undefined')
        return;
    
    allClasses = new Set();
    for (var i = 0; i < graphNodes.length; i++) {
        allClasses.add(graphNodes[i]["type"])
    }  
}

function PreprocessInputFile() {
    d3.json(inputFileURL, function (error, graph) {
        if (error) {
            alert("Json file has error:\n\n" + error);
            throw error;
        }
        StandardizeGraphObjects(graph);
        InitialListOfNodeTypes(graph.nodes);
        InitialSliderRangeWithLinksWeights(graph.links);
    });
}

function RenderInputFile() {
    if(typeof inputFileURL !== "undefined")
        d3.json(inputFileURL, RenderJsonGraph);
    else
        document.getElementById("fileInput-json-graph").click();
}


var RenderJsonGraph = function (error, graph) {
    if (error) throw error;
    StandardizeGraphObjects(graph);

    var selectedTypeNodes = new Set();
    for (var i = 0; i < graph.nodes.length; i++)
        if (nodeTypes_cb.value === "All")
            selectedTypeNodes.add(graph.nodes[i]["id"]);
        else if (graph.nodes[i]["type"] === nodeTypes_cb.value)
            selectedTypeNodes.add(graph.nodes[i]["id"]);

    // 1. Filter out nodes with not selected type
    // nodes_data is an "json object". For each graph node it stores a sub-object with the "id" of that node as the key to this sub-object.
    nodes_data = graph.nodes.filter(function (d) {
        return selectedTypeNodes.has(d["id"]);
    });

    // 2. Filter out links don't meet min threshold
    var nodesInRelatioshipWithOtherNodes = new Set();
    var slider_value = document.getElementById("slider_id").value;
    links_data = graph.links.filter(function (link) {
        var passThreshold = link["weight"] >= slider_value;
        if(passThreshold)
        {
            nodesInRelatioshipWithOtherNodes.add(link["source"]);
            nodesInRelatioshipWithOtherNodes.add(link["target"]);
        }
        var bothSideBelongsToSelectedClass = selectedTypeNodes.has(link.source) && selectedTypeNodes.has(link.target);
        return passThreshold && bothSideBelongsToSelectedClass;
    });

    // 3. Shall we keep lonely nodes?
    var checkbox = document.getElementById("HidelonelyNodesCheckbox");
    if (checkbox.checked)
        nodes_data = nodes_data.filter(function (node) { return nodesInRelatioshipWithOtherNodes.has(node["id"]); });
    else
        nodes_data = nodes_data;

    
    linkedByIndex = {};
    links_data.forEach((d3_node) => {
        linkedByIndex[`${d3_node.source},${d3_node.target}`] = true;
    });
    document.getElementById("nNodesOnDisplay").innerHTML = nodes_data.length;


    SetupSimulator();
}

function SetupSimulator() {
    svg.selectAll("*").remove();

    simulation = d3.forceSimulation()
                   .nodes(nodes_data);

    var link_force = d3.forceLink(links_data)
                       .id(function (d) { return d["id"]; });

    var charge_force = d3.forceManyBody().strength(-5);
    var center_force = d3.forceCenter(svg_width / 2, svg_height / 2);
    simulation.force("charge_force", charge_force)
              .force("center_force", center_force)
              .force("links", link_force);

    //add encompassing group for the zoom 
    g = svg.append("g").attr("class", "everything");

    /********** draw links
     * The variable "link" passed to functions is the actual input-json objects.
     *********/
    d3_links = g.append("g")
        .attr("class", "d3_links_style") // See ".d3_links_default_style line {..}"
        .selectAll("line")
        .data(links_data)
        .enter().append("line")
        .attr("stroke-width", function (link) { return link["weight"]; })
        .style("stroke", function(link) { return d3ColorScale20(link["type"])});

    /********** draw nodes
     * The variable "link" passed to functions is the actual input-json objects.
     *********/
    d3_nodes = g.append("g")
        .attr("class", "d3_nodes_default_style") // See ".d3_nodes_default_style circle {..}"
        .selectAll("circle")
        .data(nodes_data)
        .enter()
        .append("circle")
        .attr("r", function (node) { return GetNodeSize(node); })
        .attr("fill", function(node){return GetNodeColor(node);})
        .style("stroke-width", 0.5)
        .style("stroke", "black");

    /*********************************
     * Emad Note:
     * You can have different set of nodes, each caustomized differently. For that:
     * 1. Use .data(nodes_data.filter(...)) to make sure nodes have no overlap
     * 2. Select the shape and understand its attributes
     *  - circle ==> has "r"                  ==> has "cx" and "cy" in tick() function
     *  - rect   ==> has "width" and "height" ==> has "x" and "y" in tick() function
     *  - More at https://www.dashingd3js.com/svg-basic-shapes-and-d3js
     * 3. Follow #AddingSecondTypeOfNodes (3 steps) for an example of doing this w/ "rect" shape.
     */
    // #AddingSecondTypeOfNodes: Step 1/3
    // d3_nodes_rect = g.append("g")
    //     .attr("class", "d3_nodes_default_style") // See ".d3_nodes_default_style circle {..}"
    //     .selectAll("rect")
    //     .data(nodes_data.filter(function (node) { return node.size == 1; }))
    //     .enter()
    //     .append("rect")
    //     .attr("width", 4)
    //     .attr("height", 4)
    //     .attr("fill", "red");
    /*
    ***************************************/


    d3_nodes.append("title").text(function (node) { return node["title"]; });
    d3_links.append("title").text(function (link) { return link["title"]; });
    

    // add drag capabilities
    var drag_handler = d3.drag()
        .on("start", drag_start)
        .on("drag", drag_drag)
        .on("end", drag_end);

    drag_handler(d3_nodes);
    // drag_handler(d3_nodes_rect); // #AddingSecondTypeOfNodes: Step 2/3

    // add zoom capabilities 
    var zoom_handler = d3.zoom().on("zoom", zoom_actions);
    zoom_handler(svg);


    // Node event handlers
    d3.selectAll("circle").on("click", mouseClickFunction); // Other event: "mouseover","mouseout"      
    
    simulation.on("tick", tickActions);
}

function GetNodeSize(n){
    /**
     * Emad Note: Why not inline method like below?
     *          .attr("r", function (node) { return SomeCalculation(n); })
     * Because we need the node size for other purposes as well. Like when
     * we want to enlarge node on mousehover and such things.
     */
    return Math.log2(n["size"])+1;
}

function GetNodeColor(n){
    /**
     * Emad Note: Why not inline method like below?
     *          .attr("r", function (node) { return SomeCalculation(n); })
     * Because we need the node size for other purposes as well. Like when
     * we want to enlarge node on mousehover and such things.
     */
    return d3ColorScale20(n["type"])
}

function mouseClickFunction(n)
{
    /*
    *** Just for later uses:
    *   n (parameter) ==same==  input json file data 
    *   n (parameter) ==same==  d3.select(this).node().__data__
    */
   const cur_node = d3.select(this);
   

   if(lastClickedNode!=null) {
        
        lastClickedNode.attr('r', () => GetNodeSize(lastClickedNode.node().__data__));
        lastClickedNode.attr('fill', GetNodeColor(lastClickedNode.node().__data__));
        lastClickedNode.node().__data__["isFocused"]=false;
        
        d3_nodes.style('opacity',1);
        d3_links.style('stroke-opacity',1);
    }
    
    lastClickedNode = cur_node;

    if(n["isFocused"]!=true){
       n["isFocused"] = true;
       
       cur_node.attr('r', () => 1.4 * GetNodeSize(n));
       cur_node.attr('fill', "pink");
        d3_nodes.style('opacity', o => {
                const isConnectedValue = isConnected(o, n);
                if (isConnectedValue) {
                    return 1.0;
                }
                return 0.2
            });
        d3_links.style('stroke-opacity', o => (o.source === n || o.target === n ? 1 : 0.2));
    }
    else
    {
        n["isFocused"] = false;
    }
}

function drag_start(d3_node) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3_node.fx = d3_node.x;
    d3_node.fy = d3_node.y;
}


function drag_drag(d3_node) {
    // make sure you can't drag the circle outside the box
    d3_node.fx = d3.event.x;
    d3_node.fy = d3.event.y;
}

function drag_end(d3_node) {
    if( document.getElementById("ReforceAfterDrag").checked) {
        if (!d3.event.active) 
            simulation.alphaTarget(0);
        d3_node.fx = null;
        d3_node.fy = null;
    }
}
 
function zoom_actions() {
    g.attr("transform", d3.event.transform)
}

function isConnected(a, b) {
    return  linkedByIndex[`${a.index},${b.index}`] 
            || linkedByIndex[`${b.index},${a.index}`] 
            || a.index === b.index;
  }

function tickActions() {
    var alpha = this.alpha();
    var chargeStrength;

    if (alpha > 0.2) {
        chargeStrength = (alpha - 0.2 / 0.8);
    }
    else {
        chargeStrength = 0;
    }

    this.force("charge", d3.forceManyBody().strength(-30 * chargeStrength))

    //update circle positions each tick of the simulation 
    d3_nodes.attr("cx", function (d3_node) { return d3_node.x; })
            .attr("cy", function (d3_node) { return d3_node.y; });

    // // #AddingSecondTypeOfNodes: Step 3/3
    // d3_nodes_rect.attr("x", function (d3_node) { return d3_node.x; })
    //              .attr("y", function (d3_node) { return d3_node.y; });


    //update link positions 
    d3_links.attr("x1", function (d3_link) { return d3_link["source"].x; })
            .attr("y1", function (d3_link) { return d3_link["source"].y; })
            .attr("x2", function (d3_link) { return d3_link["target"].x; })
            .attr("y2", function (d3_link) { return d3_link["target"].y; });
}