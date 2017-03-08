{
    type:'View',
    icon:'🌴',
    modelTypes:['object'],
    idx:4,
    ctor:function d3radialTreeView(model)
    {
        var view = d3View('d3tree', model)
            view.d3handler = objectd3tree(view, model)

            view.d3handler.layers.cells = view.d3handler.layers.zoom.append('g')
            view.d3handler.layers.links = view.d3handler.layers.zoom.append('g').style('pointer-events', 'none')
            view.d3handler.layers.nodes = view.d3handler.layers.zoom.append('g').style('pointer-events', 'none')

            view.animationDuration = 1000
            view.textAngle = d=> d.x<180 ? d.x-90 : d.x+90
            view.project = (x, y)=>
            {
                var a = (x - 90) / 180 * Math.PI
                return [y * Math.cos(a), y * Math.sin(a)]
            }
            view.d3handler.voronoi = d3.voronoi()
                .extent([[-4000, -4000], [4000, 4000]])

            view.updated3Layout = ()=> {

                update_Hierarchy_Tree(view)
                updateCells(view)
            }

        view.updated3Layout()
        model.on('commit', () => view.updated3Layout())

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.nodes.node(),
            onchangeBegin:()=> view.updated3Layout(view),
            itemDelegate:(v, k)=> radialTreeObject(v, view),
            filter:d3objFilter
        })

        d3compositeBinding({
            model:model,
            view:view,
            layer:view.d3handler.layers.links.node(),
            itemDelegate:(v, k)=> radialTreeLink(v, view),
            filter:d3objFilter
        })
        return view
    }
}
