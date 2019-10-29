function StandardizeGraphObjects(graph)
{
    StandardizeGraphObjects_Nodes(graph.nodes);
    StandardizeGraphObjects_Links(graph.links);
}

function StandardizeGraphObjects_Nodes(graphNodes)
{
    if(graphNodes.length>0 && typeof(graphNodes[0]["size"]) == 'undefined') {
        for (var i = 0; i < graphNodes.length; i++)
        {
            graphNodes[i]["size"] = 1;
        }
    }

    if(graphNodes.length>0 && typeof(graphNodes[0]["title"]) == 'undefined') {
        for (var i = 0; i < graphNodes.length; i++)
        {
            graphNodes[i]["title"] = graphNodes[i]["methodName"]+"\n----\n"+graphNodes[i]["methodBody"]
        }
    }
}
function StandardizeGraphObjects_Links(graphLinks)
{
    if(graphLinks.length>0 && typeof(graphLinks[0]["weight"]) == 'undefined') {
        for (var i = 0; i < graphLinks.length; i++)
        {
            graphLinks[i]["weight"] = graphLinks[i]["Similarity"];
        }
    }

    if(graphLinks.length>0 && typeof(graphLinks[0]["title"]) == 'undefined') {
        for (var i = 0; i < graphLinks.length; i++)
        {
            graphLinks[i]["title"] = "Similarity: "+graphLinks[i]["Similarity"]+"\n---\nAndroid:"+graphLinks[i]["android_similarity"]+"\nTextual:"+graphLinks[i]["text_similarity"];
        }
    }
}