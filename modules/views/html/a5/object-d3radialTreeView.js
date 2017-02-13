{
    type:'View',
    icon:'🌴',
    modelTypes:['object'],
    idx:4,
    ctor:function(model)
    {        
/*
        d3g.objects { points }
        d3g.d3Model { d3hirarchy }
        d3g.layout  { d3treeMap, radialTreeMap }
        d3g.layers  { ... }

        d3g.init()
        d3g.addObject()
        d3g.update_D3Model_d3layout() -> update svgs

*/
        /*
        wann muss ich neu zeichen (x,y updates machen)
            - wenn ein neues obj dazu kommt
            - wenns mehrere sind nur ein mal am ende
            - das sollte gleichbedeutetnd sein mit dem treemap update
        */

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
                //.filter(c=> !c.obj.isLeafType)
                //.filter(c=> !c.obj.isLink)
                .filter(c=> !c.obj.isLeafType
                            && c.obj.on
                            //&& model.viewfilter(v, k)
                            && c.name != 'io'
                            && c.name != 'modelTypes')
        }

        function objectd3tree(view, model)
        {
            // once
            var d3g = d3base(view)

            var mw = { name:'root', obj:model, depth:0 }
            var d3hirarchy = d3.hierarchy(mw, model2d3Hirarchy)
            var d3tree = d3.tree()
                .size([360, 300])
                .separation((a, b)=> (a.parent == b.parent ? 0.7 : 2) / a.depth)

            function project(x, y) {
                var a = (x - 90) / 180 * Math.PI
                return [y * Math.cos(a), y * Math.sin(a)];
            }

            // per nodes change

            var nodes = d3tree(d3hirarchy) // update layout (x, y)

            var link = d3g.layers.zoom.selectAll(".link") // update svg (x, y)
                .data(nodes.descendants().slice(1))
                .enter().append("path")
                    .attr("class", "link")
                    .style("fill", "none")
                    .style("stroke", 'lightgray')
                    .attr("d",          d=> "M" + project(d.x, d.y)
                                          + "C" + project(d.x, (d.y + d.parent.y) / 2)
                                          + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                                          + " " + project(d.parent.x, d.parent.y))

            var node = d3g.layers.zoom.selectAll(".node")
                .data(nodes.descendants().slice(1))
                .enter().append("g")
                    .attr("class",      d=> "node" + (d.children ? " node--internal" : " node--leaf"))
                    .attr("transform",  d=> "translate(" + project(d.x, d.y) + ")");

            node.append("circle")
                .attr("r", 5)
                .style("fill", "lightgray")
                .style("stroke", 'gray')
                .on('click',            d=> d3g.onFocus({ __data__:d.data.obj } ))

            node.append("text")
                .attr("dy", ".31em")
                .on('click',            d=> d3g.onFocus({ __data__:d.data.obj } ))
                .attr("x",              d=> d.x < 180 === !d.children ? 9:-9                        )
                .style("text-anchor",   d=> d.x < 180 === !d.children ? "start" : "end"             )
                .attr("transform",      d=> "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"     )
                .text(                  d=> d.x < 180 === !d.children
                                          ? (d.data.obj.icon?d.data.obj.icon+' ':'') + (d.data.name)
                                          : (d.data.name) + (d.data.obj.icon?' '+d.data.obj.icon:'') )
            return d3g
        }
        return d3View('d3tree', objectd3tree, model)
    }
}
