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

function objectd3tree(view, model, w, h)
{
    var d3g = d3base(view)
        d3g.mw = { name:'root', obj:model, depth:0 }
        d3g.d3tree = d3.tree()
            .size([w||360, h||300])
            .separation((a, b)=> (a.parent == b.parent ? 0.7 : 2) / a.depth)

    return d3g
}


function d3objFilter(obj, objCtxName, objCtxIdx, parentObj)
{
    if (!parentObj)
        console.log('filter parent null' + obj.path)
    if (obj.ownedBy !== parentObj)
        console.log('skipping link '
                    + obj.path + ' > '
                    + parentObj.path + '--'
                    + (obj.ownedBy?obj.ownedBy.path:''))


    return !obj.isLeafType
           //(obj.ownedBy === parentObj || !parentObj)
        && obj.on
        && obj.viewfilter(obj, objCtxName)
        && modelType(obj) != 'Job'
        && objCtxName != 'io'
        && objCtxName != 'modelTypes'
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
        .filter(c=> d3objFilter(c.obj, c.name, 0, d.obj))
}

function update_Hierarchy_Tree(view)
{
    console.log('update_Hierarchy_Tree')

    var d3hirarchy = d3.hierarchy(view.d3handler.mw, model2d3Hirarchy)
    view.d3tree = view.d3handler.d3tree(d3hirarchy) // update layout (x, y)

    update_Tree_Layout(view)
}

function update_Tree_Layout(view)
{
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

        /*view.d3handler.layers.nodes
            .append('clipPath')
            .attr('id', 'clip-'+path2html(nodes[idx__].data.obj.path))
                .append("path")
                //.attr('fill', 'white')
                .attr("d", "M" + d.join("L") + "Z")*/

        view.d3handler.layers.cells
            .append("path")
            .attr('class', 'voronoiCell')
            .style('fill', d3.schemeCategory20[idx__%d3.schemeCategory20.length])
            //.style('fill', 'rgba(0, 0, 0, '+Math.round(Math.random()*9)/9+')')
            .on('click', ()=> view.setFocus(nodes[idx__].data.obj))
            .attr("d", "M" + d.join("L") + "Z")
        idx_++
    })
}

function path2html(p)
{
    return p.split('.').join('-')
}

// --------------------------------------------------------------------------------------------

/*
function voronoiCell(model, view)
{
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
        svg.id = 'clip-'+model.path
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path.style.stroke = 'lightgray'
        svp.appendChild(path)

    svg.relayoutD3 = function() {
        var d = view.d3Objects2treeMap[model.path]; if (!d) return
        var p1 = view.project(d.x, d.y)
        var p2 = view.project(d.parent.x, d.parent.y)
        d3.select(path)
            .attr('x1', p1[0])
            .attr('y1', p1[1])
            .attr('x2', p2[0])
            .attr('y2', p2[1])
    }
    svg.relayoutD3()
    return svg
}*/
