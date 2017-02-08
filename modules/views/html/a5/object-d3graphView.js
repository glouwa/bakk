{
    type:'View',
    icon:'🕸️',
    modelTypes:['object'],
    idx:3,
    ctor:function objectd3graphView(model)
    {
        var edge = {

        }

        var node = {

        }

        function objectd3graph(view)
        {
            var w = 820
            var h = 500
            var m = { top:30, right:0, bottom:30, left:0 }
            var t = 500//750

            var pathNodeMap = {}


            //var linkPanel, nodePanel
            var linkSvg, nodeSvg
            var color = d3.schemeCategory20

            var d3g = {}
            d3g.data = { nodes:[], links:[] }
            d3g.simulation = d3.forceSimulation()
            d3g.linkPanel = null
            d3g.nodePanel = null
            d3g.onFocus = ()=>{}
            d3g.getCenter = ()=> ({ x:w/2, y:h/2 })
            d3g.init = function() {

                var panel = d3.select(view).append('svg')
                    .attr('width', w + m.left + m.right)
                    .attr('height', h + m.top + m.bottom)
                    .call(d3.zoom()
                          .scaleExtent([1/100, 8])
                          .on("zoom", ()=> panel.attr("transform", d3.event.transform)))
                    .append('g')

                d3g.simulation
                    .force("link", d3.forceLink().strength(3))
                    .force("collide",d3.forceCollide(7))
                    .force('charge', d3.forceManyBody().strength(-50).distanceMax(200))
                    .force('center', d3.forceCenter(w/2, h/2))

                d3g.linkPanel = panel.append('g')
                d3g.nodePanel = panel.append('g')
                d3g.simulation.on('end', ()=> this.update())
            }

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
                    .attr('fill', d=> color[d.level])
                    .attr('opacity', 0.3)
                    .on('click', d=> d3g.onFocus({ __data__:d.model } ))
                    .append("title")
                        .text(d=> d.id)

                nodeEnter.append("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .text(d=> d.icon)

                nodeSvg = nodeEnter.merge(nodeSvg)

                // force -----------
                d3g.simulation
                    //.force('charge')
                    .nodes(d3g.data.nodes)
                    .on('tick', ticked)

                d3g.simulation
                    .force('link')
                    .links(d3g.data.links)

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
                    d3g.simulation.alphaTarget(0.3).restart()
                d.fx = d.x
                d.fy = d.y
            }

            function dragged(d) {
                d.fx = d3.event.x
                d.fy = d3.event.y
            }

            function dragended(d) {
                if (!d3.event.active)
                    d3g.simulation.alphaTarget(0)
                d.fx = null
                d.fy = null
            }

            //----------------------------------------------------------------------------------------

            d3g.addNode = function(nm, pm, level) {
                if (pathNodeMap[nm.path])
                    return

                var n = { id:nm.path, model:nm, level:level }
                if (level == 0) {
                    n.fx = d3g.getCenter().x
                    n.fy = d3g.getCenter().y
                }

                pathNodeMap[nm.path] = n
                d3g.data.nodes.push(n)

                if (pm) {
                    d3g.data.links.push({
                        source:pathNodeMap[pm.path],
                        target:n,
                        value:1
                    })
                }
                //d3g.update()
            }

            d3g.updateNode = function(nm, changes) {}
            d3g.removeNode = function() {}
            d3g.redrawAll  = function() {}
            d3g.init()
            return d3g
        }

        var view = document.createElement('div')
            view.className = 'd3graph'
            view.d3handler = objectd3graph(view)
            view.d3handler.onFocus = e=> bubbleUp(view, 'onFocus', e.__data__)

        function addNode(model, parentModel, level) {

            view.d3handler.addNode(model, parentModel, level)

            model.forEach((v, k, idx)=> {
                if (!v.isLeafType
                    && v.on
                    && model.viewfilter(v, k)
                    && modelType(model) != 'Job'
                    && k != 'io'
                    && k != 'modelTypes')

                    addNode(v, model, level+1)
            })


            model.on('change', changes=> {
                if (changes.newMembers)
                    changes.newMembers.forEach((v, k, idx)=> {
                        if (!v.isLeafType && v.on)
                            addNode(v, changes.sender, level+1)
                    })
            })
        }

        addNode(model, undefined, 0)

        view.d3handler.update()
        return view
    }
}
