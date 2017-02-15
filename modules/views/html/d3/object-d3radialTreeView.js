function objectd3tree(view, model)
{
    var d3g = d3base(view)
        d3g.mw = { name:'root', obj:model, depth:0 }
        d3g.d3tree = d3.tree()
            .size([360, 300])
            .separation((a, b)=> (a.parent == b.parent ? 0.7 : 2) / a.depth)

    return d3g
}

function filter(v, k)
{
    return !v.isLeafType
        && v.on
      //&& model.viewfilter(v, k)
        && k != 'io'
        && k != 'modelTypes'
}

function update_Hierarchy_Tree()
{
    console.log('update_Hierarchy_Tree')

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
            .filter(c=> filter(c.obj, c.name))
    }

    var d3hirarchy = d3.hierarchy(this.d3handler.mw, model2d3Hirarchy)
    this.d3tree = this.d3handler.d3tree(d3hirarchy) // update layout (x, y)
    this.d3Objects2treeMap = {}
    this.d3tree.descendants().forEach((v,k,idx)=> {
        this.d3Objects2treeMap[v.data.obj.path] = v
    })

    this.d3handler.layers.zoom.selectAll('path').each(function (d, i, nodes) {
        this.relayoutD3()
    })

    this.d3handler.layers.zoom.selectAll('g').each(function (d, i, nodes) {
        this.relayoutD3()
    })
}

function project(x, y)
{
    var a = (x - 90) / 180 * Math.PI
    return [y * Math.cos(a), y * Math.sin(a)];
}

var animationDuration = 1000

function radialTreeObject(model, view)
{
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        svg.setAttribute('class', 'radial-tree-node')
        var d = view.d3Objects2treeMap[model.path]
        svg.setAttribute('transform', 'translate(' + project(d.parent.x, d.parent.y) + ')')

        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            circle.setAttribute('r', 5)
            circle.onclick = e=> view.d3handler.onFocus({ __data__:model })
            circle.style.fill = 'lightgray'
            circle.style.stroke = 'gray'

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.onclick = e=> view.d3handler.onFocus({ __data__:model } )
            text.setAttribute('dy', '.31em')

    svg.appendChild(text)
    svg.appendChild(circle)

    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]
        var x = d.x
        var y = d.y
        d3.select(svg)
            .transition()
            .duration(animationDuration)
            .attr('transform', 'translate(' + project(x, y) + ')')

        d3.select(text)
            .transition()
            .duration(animationDuration)
            .attr('transform',    'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')')
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
            layer:view.d3handler.layers.zoom.node(),
            onchangeBegin:()=> view.update_Hierarchy_Tree(),
            itemDelegate:(v, k)=> radialTreeObject(v, view),
            filter:filter
        })

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.zoom.node(),
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
        svg.style.stroke = 'lightgray'
        var d = view.d3Objects2treeMap[model.path]
        svg.setAttribute('d', curveLine(d.parent, d.parent, project))

    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]
        d3.select(svg)
            .transition()
            .duration(animationDuration)
            .attr('d', curveLine(d, d.parent, project))
    }
    svg.relayoutD3()
    return svg
}

function d3radialTreeView(model)
{
    var view = d3View('d3tree', objectd3tree, model)
        view.update_Hierarchy_Tree = update_Hierarchy_Tree

    d3compositeBinding({
        model:model,
        view:view,
        layer:view.d3handler.layers.zoom.node(),
        onchangeBegin:()=> view.update_Hierarchy_Tree(),
        itemDelegate:(v, k)=> radialTreeObject(v, view)
    })

    d3compositeBinding({
        model:model,
        view:view,
        layer:view.d3handler.layers.zoom.node(),
        itemDelegate:(v, k)=> radialTreeLink(v, view)
    })
    return view
}

