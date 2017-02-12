{
    type:'View',
    icon:'🌴',
    modelTypes:['object'],
    idx:4,
    ctor:function(model)
    {
        function objectd3tree(view, model)
        {
            var w = 820
            var h = 900
            var data = { /*circles:[],*/ jobs:[]/*, clines:[] */}
            var t = 500//750

            var d3g = d3base(view)

            var mw = { name:'root', obj:model, depth:0 }

            // set the dimensions and margins of the diagram
            var margin = {top: 20, right: 100, bottom: 10, left: 40},
                width = w - margin.left - margin.right,
                height = h - margin.top - margin.bottom;


            //  assigns the data to a hierarchy using parent-child relationships
            var depth = 0
            var nodes = d3.hierarchy(mw, d=> {

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
            })

            // declares a tree layout and assigns the size
            var treemap = d3.tree()
                .size([360, 300])
                .separation(function(a, b) { return (a.parent == b.parent ? 0.7 : 2) / a.depth; });

            // maps the node data to the tree layout
            nodes = treemap(nodes);

            var link = d3g.layers.zoom.selectAll(".link")
                .data(nodes.descendants().slice(1))
                .enter().append("path")
                  .attr("class", "link")
                  .style("fill", "none")
                  .style("stroke", 'lightgray')
                  .attr("d", function(d) {
                    return "M" + project(d.x, d.y)
                        + "C" + project(d.x, (d.y + d.parent.y) / 2)
                        + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                        + " " + project(d.parent.x, d.parent.y);
                  });

              var node = d3g.layers.zoom.selectAll(".node")
                .data(nodes.descendants())
                .enter().append("g")
                  .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                  .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });

              node.append("circle")
                  .attr("r", 5)
                  .style("fill", "lightgray")
                  .style("stroke", 'gray')
                  .on('click', d=> d3g.onFocus({ __data__:d.data.obj } ))

              node.append("text")
                  .attr("dy", ".31em")
                  .on('click', d=> d3g.onFocus({ __data__:d.data.obj } ))
                  //.style("stroke", 'gray')
                  .attr("x", function(d) { return d.x < 180 === !d.children ? 9 : -9; })
                  .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
                  .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
                  .text(function(d) { return (d.data.obj.icon?d.data.obj.icon+' ':'') + d.data.name });

            function project(x, y) {
              var angle = (x - 90) / 180 * Math.PI, radius = y;
              return [radius * Math.cos(angle), radius * Math.sin(angle)];
            }

            d3g.updateDomain = function(){}

            //----------------------------------------------------------------------------------------

            d3g.appendCircle = function(v, m, r, c) {}
            d3g.addJob = function(jm) {}
            d3g.addUiUpdate = function(jm, changes) {}
            d3g.addCommit = function(j, s, e) {}
            d3g.redrawAll = function(t) {}

            return d3g
        }

        return d3View('d3tree', objectd3tree, model)
    }
}
