{
    type:'View',
    icon:'🌲',
    modelTypes:['object'],
    idx:2,
    ctor:function objectd3treeView(model)
    {
        function objectd3tree(view, model)
        {
            var w = 820
            var h = 300
            var m = { top:30, right:10, bottom:30, left:80 }
            var data = { /*circles:[],*/ jobs:[]/*, clines:[] */}
            var t = 500//750

            var d3g = {}
            d3g.focus = null
            d3g.onFocus = ()=>{}
            d3g.init = function() {

                var mw = { name:'root', obj:model, depth:0 }

                // set the dimensions and margins of the diagram
                var margin = {top: 20, right: 100, bottom: 10, left: 40},
                    width = w - margin.left - margin.right,
                    height = h - margin.top - margin.bottom;

                // declares a tree layout and assigns the size
                var treemap = d3.tree()
                    .size([height, width-100]);

                //  assigns the data to a hierarchy using parent-child relationships
                var depth = 0
                var nodes = d3.hierarchy(mw, d=> {
                    if (d.depth>1 || !d.obj)
                        return undefined
                    return Object.keys(d.obj)
                        .map(k=> ({ name:k, obj:d.obj[k], depth:d.depth+1 }))
                        //.filter(c=> !c.obj.isLeafType)
                        .filter(c=> !c.obj.isLink)
                })

                // maps the node data to the tree layout
                nodes = treemap(nodes);

                // append the svg object to the body of the page
                // appends a 'group' element to 'svg'
                // moves the 'group' element to the top left margin
                var svg = d3.select(view).append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)

                var g = svg.append("g")
                      .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

                // adds the links between the nodes
                var link = g.selectAll(".link")
                    .data( nodes.descendants().slice(1))
                  .enter().append("path")
                    .attr("class", "link")
                    .style("fill", "none")
                    .style("stroke", 'lightgray')
                    .attr("d", d=> "M" + d.y + "," + d.x
                                 + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                                 + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                                 + " " + d.parent.y + "," + d.parent.x)

                // adds each node as a group
                var node = g.selectAll(".node")
                    .data(nodes.descendants())
                  .enter().append("g")
                    .attr("class", d=> "node" + (d.children ? " node--internal" : " node--leaf"))
                    .attr("transform", d=> "translate(" + d.y + "," + d.x + ")");

                // adds symbols as nodes
                node.append("path")
                  .style('stroke', 'grey')
                  .style("fill", 'lightgray')
                  .attr("d", d3.symbol()
                     .size(d=> 30)
                     .type(d=> d3.symbolCircle))

                // adds the text to the node
                node.append("text")
                  .attr("dy", ".35em")
                  //.attr("x", d=> d.children ? -10: 10)
                  .attr("x", d=> 10)
                  //.style("text-anchor", d=> (d.children ? "end" : "start"))
                  .style("text-anchor", 'start')
                  .text(d=> d.data.name);
            }

            d3g.updateDomain = function(){
            }

            //----------------------------------------------------------------------------------------

            d3g.appendCircle = function(v, m, r, c) {
            }

            d3g.addJob = function(jm) {
            }

            d3g.addUiUpdate = function(jm, changes) {
            }

            d3g.addCommit = function(j, s, e) {
            }

            d3g.redrawAll = function(t) {
            }

            d3g.init()
            return d3g
        }

        var view = document.createElement('div')
            view.className = 'd3tree'
            view.style.margin = '10'
            view.d3handler = objectd3tree(view, model)

        return view
    }
}
