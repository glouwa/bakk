function radialTreeObject(model, view)
{
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        svg.setAttribute('class', 'radial-tree-node')
        var d = view.d3Objects2treeMap[model.path]
        svg.setAttribute('transform', 'translate(' + view.project(d.parent.x, d.parent.y) + ')')

        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            circle.setAttribute('r', 5)
            circle.onclick = e=> view.setFocus(model)
            circle.style.fill = 'lightgray'
            circle.style.stroke = 'gray'

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.onclick = e=> view.setFocus(model)
            text.setAttribute('dy', '.31em')
            text.setAttribute('transform', 'rotate(' + view.textAngle(d) + ')')
            text.setAttribute('clip-path', 'url(#clip-'+path2html(model.path)+')')

    svg.appendChild(text)
    svg.appendChild(circle)

    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]; if (!d) return
        var x = d.x
        var y = d.y
        d3.select(svg)
            .transition()
            .duration(view.animationDuration)
            .attr('transform', 'translate(' + view.project(x, y) + ')')

        d3.select(text)
            .transition()
            .duration(view.animationDuration)
            .attr('transform',    'rotate(' + view.textAngle(d) + ')')
            .attr('x',            d.x < 180 === !d.children ? 9:-9)
            .style('text-anchor', d.x < 180 === !d.children ? 'start' : 'end')
            .text(                d.x < 180 === !d.children
                               ? (d.data.obj.icon?d.data.obj.icon+' ':'') + (d.data.name)
                               : (d.data.name) + (d.data.obj.icon?' '+d.data.obj.icon:''))
    }

    var d = view.d3Objects2treeMap[model.path]
    if (d.depth < 3) {

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.nodes.node(),
            onchangeBegin:()=> view.updated3Layout(view),
            itemDelegate:(v, k)=> radialTreeObject(v, view),
            filter:filter
        })

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.links.node(),
            itemDelegate:(v, k)=> radialTreeLink(v, view),
            filter:filter
        })
    }
    svg.relayoutD3()
    return svg
}

function radialTreeLink(model, view)
{
    var curveLine = (s, e, p)=> 'M' + p(s.x, s.y)
                              + 'C' + p(s.x, (s.y + e.y) / 2)
                              + ' ' + p(e.x, (s.y + e.y) / 2)
                              + ' ' + p(e.x, e.y)

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        svg.setAttribute('class', 'link')
        svg.style.fill = 'none'
        svg.style.stroke = '#999'
        var d = view.d3Objects2treeMap[model.path]
        svg.setAttribute('d', curveLine(d.parent, d.parent, view.project))

    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]; if (!d) return
        d3.select(svg)
            .transition()
            .duration(view.animationDuration)
            .attr('d', curveLine(d, d.parent, view.project))
    }
    svg.relayoutD3()
    return svg
}

// --------------------------------------------------------------------------------------------

function graphObject(model, view)
{
    var svgSel = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'g'))

        .attr("class", "node")
        .call(d3.drag()
            .on("start", function dragstarted(d) {
                if (!d3.event.active)
                    view.d3handler.simulation.alphaTarget(0.3).restart()
                var d = view.d3Objects2treeMap[model.path]; if (!d) return
                d.fx = d.x
                d.fy = d.y
            })
            .on("drag", function dragged(d) {
                var d = view.d3Objects2treeMap[model.path]; if (!d) return
                d.fx = d3.event.x
                d.fy = d3.event.y
            })
            .on("end", function dragended(d) {
                if (!d3.event.active)
                    view.d3handler.simulation.alphaTarget(0)
                var d = view.d3Objects2treeMap[model.path]; if (!d) return
                d.fx = null
                d.fy = null
            }))

    var sizeMap = [12, 10, 8, 6, 4, 2]
    var nodeColor = 'lightgray' //'#00cc66'
    svgSel.append("circle")
        .attr('r', sizeMap[view.d3Objects2treeMap[model.path].depth])
        .attr('fill', nodeColor)
        .attr('stroke', d3.color(nodeColor).darker())
        .attr('stroke-width', 1.2)
        .attr('opacity', 1)
        .on('click', d=> view.setFocus(model))
        .append("title")
            .text(d=> model.path)

    svgSel.append("text")
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .text(d=> model.icon)
        .style('font-size', '10px')

    var svg = svgSel.node()
    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]; if (!d) return
        d3.select(svg)
            .attr('transform', 'translate(' + view.project(d.x, d.y) + ')')
    }

    var d = view.d3Objects2treeMap[model.path]
    if (d.depth < 3) {

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.nodes.node(),
            onchangeBegin:()=> view.updated3Layout(view),
            itemDelegate:(v, k)=> graphObject(v, view),
            filter:filter
        })

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.links.node(),
            itemDelegate:(v, k)=> graphLink(v, view),
            filter:filter
        })
    }
    svg.relayoutD3()
    return svg
}

function graphLink(model, view)
{
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        svg.style.stroke = '#999'
        svg.style.strokeWidth = 1.5

    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]; if (!d) return
        var p1 = view.project(d.x, d.y)
        var p2 = view.project(d.parent.x, d.parent.y)
        d3.select(svg)
            .attr('x1', p1[0])
            .attr('y1', p1[1])
            .attr('x2', p2[0])
            .attr('y2', p2[1])
    }
    svg.relayoutD3()
    return svg
}




