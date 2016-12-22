function objectd3graph(view)
{
    var w = 700
    var h = 500
    var m = { top:30, right:0, bottom:30, left:0 }
    var t = 500//750

    var pathNodeMap = {}
    var data = { nodes:[], links:[] }

    var linkPanel, nodePanel
    var linkSvg, nodeSvg
    var color = d3.scaleOrdinal(d3.schemeCategory20)
    var simulation = d3.forceSimulation()

    var d3g = {}
    d3g.focus = null
    d3g.onFocus = ()=>{}
    d3g.init = function() {

        var panel = d3.select(view).append('svg')
            .attr('width', w + m.left + m.right)
            .attr('height', h + m.top + m.bottom)
            .call(d3.zoom()
                  .scaleExtent([1/100, 8])
                  .on("zoom", ()=> panel.attr("transform", d3.event.transform)))
            .append('g')

        simulation
            //.force('link', d3.forceLink().id(d=> d.id))
            .force("link", d3.forceLink().distance(0.1).strength(1))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(w/2, h/2))

        linkPanel = panel.append('g')
        nodePanel = panel.append('g')
        this.update()
    }

    d3g.update = function()
    {
        linkSvg = linkPanel.selectAll(".link")
            .data(data.links)

        linkSvg.exit().remove();

        var linkEnter = linkSvg.enter()
            .append("line")
            .attr("class", "link")
            .attr('stroke-width', d=> Math.sqrt(d.value))
            .attr('stroke', '#888')

        linkSvg = linkEnter.merge(linkSvg)

        nodeSvg = nodePanel.selectAll(".node")
            .data(data.nodes)

        nodeSvg.exit().remove();

        var nodeEnter = nodeSvg.enter().append("g")
            .attr("class", "node")
           // .on("click", click)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        nodeEnter.append("circle")
            .attr('r', 5)
            .attr('fill', d=> color(d.group))
            .append("title")
                .text(d=> d.id)

        /*nodeEnter.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(d=> d.id)*/

        nodeSvg = nodeEnter.merge(nodeSvg)

        simulation.nodes(data.nodes)
            .on('tick', ticked)

        simulation.force('link')
                .links(data.links)
    }

    function ticked() {
        linkSvg.attr('x1', d=> d.source.x)
            .attr('y1', d=> d.source.y)
            .attr('x2', d=> d.target.x)
            .attr('y2', d=> d.target.y)

        nodeSvg.attr('transform', d=> 'translate('+d.x+','+d.y+')')
    }

    function dragstarted(d) {
        if (!d3.event.active)
            simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    function dragended(d) {
        if (!d3.event.active)
            simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
    }

    //----------------------------------------------------------------------------------------

    d3g.addNode = function(nm, pm) {

        var n = { id:nm.path, group:3 }
        pathNodeMap[nm.path] = n
        data.nodes.push(n)

        if (pm) {
            data.links.push({
                source:pathNodeMap[pm.path],
                target:n,
                value:1
            })
        }
        d3g.update()
    }

    d3g.updateNode = function(nm, changes) {}
    d3g.removeNode = function() {}
    d3g.redrawAll  = function() {}

    d3g.init()
    return d3g
}

function objectd3graphView(model)
{
    var view = document.createElement('div')
        view.className = 'd3graph'
        view.style.margin = '10'
        view.d3handler = objectd3graph(view)

    function addNode(m, p) {
        view.d3handler.addNode(m, p)

        m.forEach((v, k, idx)=> {
            if (!v.isLeafType && v.on)
                addNode(v, m)
        })

        m.on('change', changes=> {
            if (changes.newMembers)
                changes.newMembers.forEach((v, k, idx)=> {
                    if (!v.isLeafType && v.on)
                        addNode(v, changes.sender)
                })
        })
    }

    addNode(model)
    return view
}

