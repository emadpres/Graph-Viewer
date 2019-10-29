function StandardizeGraphObjects(graph)
{
	// Standardize your input JSON here (according to the sample below)
}


/******************************************************************************
****************************** Sample Code ************************************
*******************************************************************************
function StandardizeGraphObjects(graph)
{
    StandardizeGraphObjects_Nodes(graph.nodes);
    StandardizeGraphObjects_Links(graph.links);
}

function StandardizeGraphObjects_Nodes(graphNodes)
{
	// Sample: Adding missing "size" attribute to nodes
    if(graphNodes.length>0 && typeof(graphNodes[0]["size"]) == 'undefined') {
        for (var i = 0; i < graphNodes.length; i++)
        {
            graphNodes[i]["size"] = 1;
        }
    }
}
function StandardizeGraphObjects_Links(graphLinks)
{
	// Sample: Adding missing "weight" attribute to links
    if(graphLinks.length>0 && typeof(graphLinks[0]["weight"]) == 'undefined') {
        for (var i = 0; i < graphLinks.length; i++)
        {
            graphLinks[i]["weight"] = graphLinks[i]["Similarity"];
        }
    }
}
*******************************************************************************
******************************************************************************/