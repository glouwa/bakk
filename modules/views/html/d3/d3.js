function d3View(className, model)
{
    var view = document.createElement('div')
        view.className = className
        view.style.position = 'absolute'
        view.style.top = 0
        view.style.bottom = 0
        view.style.left = 0
        view.style.right = 0        
        view.setFocus = e=> bubbleUp(view, 'onFocus', e)
    return view
}

function d3base(view)
{
    var w = 820
    var h = 500
    var d3view = {}      
        d3view.layers = {}
        d3view.center = ()=> ({ x:w/2, y:h/2 })
        d3view.zoom = d3.zoom()
            .scaleExtent([1/100, 8])
            .on("zoom", ()=> d3view.layers.zoom.attr("transform", d3.event.transform))

        d3view.layers.svg = d3.select(view)
            .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                //.on("click", ()=> d3view.zoom.fit())
                .call(d3view.zoom)

        d3view.layers.zoom = d3view.layers.svg
            .append('g')

        d3view.zoom.fit = function()
        {
            var bbox = d3view.layers.zoom.node().getBBox()
            var scalew = view.clientWidth / bbox.width
            var scaleh = view.clientHeight / bbox.height
            var scale = Math.min(scalew, scaleh)
            var t = d3.zoomIdentity.translate(-bbox.x, -bbox.y).scale(scale)
            d3view.layers.svg.call(d3view.zoom.transform, t)
        }

    return d3view
}

function filter(v, k, idx, m)
{
    return !v.isLeafType
        && v.on
        && m.viewfilter(v, k)
        && modelType(m) != 'Job'
        && k != 'io'
        && k != 'modelTypes'
}

function model2d3Hirarchy(d)
{
    if (d.depth>2 || !d.obj)
        return undefined

    return Object.keys(d.obj)
        .map(k=> ({
            name:k,
            obj:d.obj[k],
            model:d.obj[k],
            depth:d.depth+1
        }))
        .filter(c=> filter(c.obj, c.name, 0, d.obj))
}

function update_Hierarchy_Tree(view)
{
    console.log('update_Hierarchy_Tree')

    var d3hirarchy = d3.hierarchy(view.d3handler.mw, model2d3Hirarchy)
    view.d3tree = view.d3handler.d3tree(d3hirarchy) // update layout (x, y)

    /*view.d3tree.descendants().forEach((v,k,idx)=> {
        var x = v.x, y = v.y
        var a = (x - 90) / 180 * Math.PI
        v.x = y * Math.cos(a)
        v.y = y * Math.sin(a)
    })*/

    // wirklich hier?

    view.d3Objects2treeMap = {}
    view.d3tree.descendants().forEach((v,k,idx)=> {
        view.d3Objects2treeMap[v.data.obj.path] = v
    })

    view.d3handler.layers.zoom.selectAll('path').each(function (d, i, nodes) {
        if (this.relayoutD3)
            this.relayoutD3()
    })

    view.d3handler.layers.zoom.selectAll('g').each(function (d, i, nodes) {
        if (this.relayoutD3)
            this.relayoutD3()
    })
}

function updateCells(view)
{
    var nodes = view.d3tree.descendants()
    var voroNodes = nodes.map(i=> view.project(i.x, i.y))
    var idx_ = 0
    view.d3handler.voronoiCells = view.d3handler.voronoi(voroNodes).polygons()
    view.d3handler.layers.cells.selectAll('*').remove()
    view.d3handler.voronoiCells.forEach((v, k, idx)=> {
        //view.d3Objects2voronoiPath[v.data.obj.path] = v
        var idx__ = idx_
        var d = v

        view.d3handler.layers.cells
            .append("path")
            .attr('class', 'voronoiCell')
            .style('fill', d3.schemeCategory20[idx__%d3.schemeCategory20.length])
            //.style('fill', 'rgba(0, 0, 0, '+Math.round(Math.random()*9)/9+')')
            .on('click', ()=> view.setFocus(nodes[idx__].data.model))
            .attr("d", "M" + d.join("L") + "Z")
        idx_++
    })
}


// --------------------------------------------------------------------------------------------


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

function treeObject(model, view)
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
        .attr("dx", '-0.35em')
        .attr("dy", '0.3em')
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
            itemDelegate:(v, k)=> treeObject(v, view),
            filter:filter
        })

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.links.node(),
            itemDelegate:(v, k)=> treeLink(v, view),
            filter:filter
        })
    }
    svg.relayoutD3()
    return svg
}

function treeLink(model, view)
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

function voronoiCell(model, view)
{
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        svg.style.stroke = 'lightgray'

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
