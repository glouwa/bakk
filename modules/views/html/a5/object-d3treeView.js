{
    type:'View',
    icon:'🌲',
    modelTypes:['object'],
    idx:2,
    ctor:function d3treeView(model)
    {
        var view = d3View('d3tree', model)
            view.d3handler = objectd3tree(view, model, 750, 900)
            view.d3handler.layers.cells = view.d3handler.layers.zoom.append('g')
            view.d3handler.layers.links = view.d3handler.layers.zoom.append('g').style('pointer-events', 'none')
            view.d3handler.layers.nodes = view.d3handler.layers.zoom.append('g').style('pointer-events', 'none')

            view.d3handler.voronoi = d3.voronoi()
                .extent([[-4000, -4000], [4000, 4000]])

            view.updated3Layout = ()=> {

                update_Hierarchy_Tree(view)
                updateCells(view)
            }
            view.animationDuration = 1000
            view.textAngle = d=> 90
            view.project = (x, y) => [x, y]

        view.updated3Layout()
        model.on('commit', () => view.updated3Layout())

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
        return view
    }
}
