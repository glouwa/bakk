function d3View(className, d3, model)
{
    var view = document.createElement('div')
        view.className = className
        view.style.position = 'absolute'
        view.style.top = 0
        view.style.bottom = 0
        view.style.left = 0
        view.style.right = 0
        view.d3handler = d3(view, model)
        view.d3handler.onFocus = e=> bubbleUp(view, 'onFocus', e.__data__)
    return view
}

function d3base(view)
{
    var w = 820
    var h = 500
    var d3view = {}
        d3view.onFocus = ()=>{}
        d3view.center = ()=> ({ x:w/2, y:h/2 })
        d3view.layers = {}
        d3view.layers.zoom = d3.select(view).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .call(d3.zoom()
                 .scaleExtent([1/100, 8])
                 .on("zoom", ()=> d3view.layers.zoom.attr("transform", d3.event.transform)))
            .append('g')
    return d3view
}

function objectd3graph(view, model)
{
    var t = 500
    var pathNodeMap = {}
    var linkSvg, nodeSvg
    var color = d3.schemeCategory20

    var strengthMap = [-100, -75, -50, -10, -10]
    var lstrengthMap = [-100, -75, -50, -10, -10]
    var sizeMap = [12, 10, 8, 6, 4, 2]

    var d3g = d3base(view)
    d3g.data = { nodes:[], links:[] }
    d3g.linkPanel = d3g.layers.zoom.append('g')
    d3g.nodePanel = d3g.layers.zoom.append('g')
    d3g.simulation = d3.forceSimulation()
        .force("link",   d3.forceLink().strength(d=> d.strength))
        .force('charge', d3.forceManyBody().strength(d=> strengthMap[d.level]).distanceMax(150))
        .force("collide",d3.forceCollide(d=> 1.7*sizeMap[d.level]))
        //.force('center', d3.forceCenter(d3g.center().x, d3g.center().y))
        //.on('end', ()=> d3g.update())

    d3g.update = function()
    {
        // links -----------

        linkSvg = d3g.linkPanel.selectAll(".link")
            .data(d3g.data.links)

        linkSvg.exit().remove();

        var linkEnter = linkSvg.enter()
        .append("line")
            .attr("class", "link")
            .attr('stroke-width', d=> 1)
            .attr('stroke', '#999')

        linkSvg = linkEnter.merge(linkSvg)

        // nodes -----------

        nodeSvg = d3g.nodePanel.selectAll(".node")
            .data(d3g.data.nodes)

        nodeSvg.exit().remove()

        var nodeEnter = nodeSvg.enter().append("g")
            .attr("class", "node")
           // .on("click", click)
            .call(d3.drag()
                .on("start", function dragstarted(d) {
                    if (!d3.event.active)
                        d3g.simulation.alphaTarget(0.3).restart()
                    d.fx = d.x
                    d.fy = d.y
                })
                .on("drag", function dragged(d) {
                    d.fx = d3.event.x
                    d.fy = d3.event.y
                })
                .on("end", function dragended(d) {
                    if (!d3.event.active)
                        d3g.simulation.alphaTarget(0)
                    d.fx = null
                    d.fy = null
                }))

        nodeEnter.append("circle")
            .attr('r', d=> sizeMap[d.level])
            .attr('fill', d=> color[d.level])
            .attr('opacity', 0.3)
            .on('click', d=> d3g.onFocus({ __data__:d.model } ))
            .append("title")
                .text(d=> d.id)


        nodeEnter.append("text")
            .attr("dx", '-0.35em')
            .attr("dy", '0.3em')
            .text(d=> d.model.icon)
            .style('font-size', '10px')

        nodeSvg = nodeEnter.merge(nodeSvg)

        // force -----------

        d3g.simulation
            //.force('charge')
            .nodes(d3g.data.nodes)
            .on('tick', function() {
                linkSvg.attr('x1', d=> d.source.x)
                    .attr('y1', d=> d.source.y)
                    .attr('x2', d=> d.target.x)
                    .attr('y2', d=> d.target.y)

                nodeSvg.attr('transform', d=> 'translate('+d.x+','+d.y+')')
            })

        d3g.simulation
            .force('link')
            .links(d3g.data.links)
    }

    //----------------------------------------------------------------------------------------

    d3g.addVertexAndEdge = function(nm, pm, level) {

        if (pathNodeMap[nm.path])
            return

        // add vertex
        var n = { id:nm.path, model:nm, level:level }

        if (level == 0) {
            n.fx = d3g.center().x
            n.fy = d3g.center().y
        }
        if (level == 1) {
            //n.fx = d3g.center().x + 100 * Math.cos(a)
            //n.fy = d3g.center().y + 100 * Math.cos(a)
        }

        // add edge
        pathNodeMap[nm.path] = n
        d3g.data.nodes.push(n)

        if (pm)
            d3g.data.links.push({
                source:pathNodeMap[pm.path],
                target:n,
                strength:level>2?0.5:1,//(level+0.001)/5,
                value:1
            })

        d3g.update()
    }

    function filter(v, k, m) {
        return !v.isLeafType
             && v.on
             && m.viewfilter(v, k)
             && modelType(m) != 'Job'
             && k != 'io'
             && k != 'modelTypes'
    }

    /*
    componentBinding({
        filter:filter,
        model:model
        view:layer.vertices,
        onNew: app.viewTypes.d3.byType[typeOf(model)].ctor
        onDeleted:if (refcount--) delete
    })
    componentBinding({
        filter:filter
        model:relation(model,v,k,idx)
        view:layer.edges,
        onNew:app.viewTypes.d3.edge.ctor
    })

    */

    d3g.addNode = function(model, parentModel, level) {

        d3g.addVertexAndEdge(model, parentModel, level)

        model.forEach((v, k, idx)=> {
            if (filter(v, k, model))
                d3g.addNode(v, model, level+1)
        })

        model.on('change', changes=> {
            if (changes.newMembers)
                changes.newMembers.forEach((v, k, idx)=> {
                    if (filter(v, k, model))
                        d3g.addNode(v, changes.sender, level+1)
                })
        })
    }

    d3g.addNode(model, undefined, 0)
    return d3g
}

