{
    type:'View',
    icon:'🛰️',
    modelTypes:['object'],
    idx:3,
    ctor:function d3graphView(model)
    {
        var view = d3View('d3graph', model)
            view.d3handler = objectd3tree(view, model)
            view.d3handler.layers.cells = view.d3handler.layers.zoom.append('g')
            view.d3handler.layers.links = view.d3handler.layers.zoom.append('g').style('pointer-events', 'none')
            view.d3handler.layers.nodes = view.d3handler.layers.zoom.append('g')//.style('pointer-events', 'none')
            view.project = (x, y)=> [x, y]
            var strengthMap = [-200, -100, -100, -50, -10]
            var sizeMap = [12, 10, 8, 6, 4, 2]
            view.d3handler.simulation = d3.forceSimulation()
                .force('link',   d3.forceLink().strength(d=> d.source.depth>2?0.5:1))
                .force('charge', d3.forceManyBody().strength(d=> strengthMap[d.depth]).distanceMax(200))
                .force('collide',d3.forceCollide(d=> 1.7*sizeMap[d.depth]))
                //.on('end', ()=> view.d3handler.zoom.fit())

            view.d3handler.voronoi = d3.voronoi()
                .extent([[-4000, -4000], [4000, 4000]])

            view.updated3Layout = ()=> {

                update_Hierarchy_Tree(view)

                var nodes = view.d3tree.descendants()
                nodes.forEach((v, k, idx)=> {
                    v.data.strength = 1

                    var x = v.x, y = v.y
                    var a = (x - 90) / 180 * Math.PI
                    v.x = y * Math.cos(a)
                    v.y = y * Math.sin(a)

                    if (v.depth < 2) {
                        v.fx = y * Math.cos(a)
                        v.fy = y * Math.sin(a)
                    }
                })

                view.d3handler.simulation
                    .force('link')
                    .links(view.d3tree.links())

                view.d3handler.simulation
                    .nodes(nodes)
                    .on('tick', ()=> {

                        var nodes = view.d3tree.descendants()
                        updateCells(view)

                        view.d3handler.layers.zoom.selectAll('line').each(function (d, i, nodes) {
                            if (this.relayoutD3)
                                this.relayoutD3()
                        })

                        view.d3handler.layers.zoom.selectAll('g').each(function (d, i, nodes) {
                            if (this.relayoutD3)
                                this.relayoutD3()
                        })
                    })
            }

        view.updated3Layout()
        model.on('commit', () => view.updated3Layout())

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
        return view
    }
}
