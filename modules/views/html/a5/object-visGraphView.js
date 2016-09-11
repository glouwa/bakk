
function systemGraphView(networkModel)
{
    var modelGraphConfig = {
        autoResize: true,
        nodes: {
            shape:'dot',
            scaling: {
                customScalingFunction: function(min, max, total, value) { return value },
                min:5,
                max:15
            }
        },
        edges: {
            hoverWidth: 15,
        },
        interaction: {
            hover: true,
            navigationButtons: true
        },
        physics: {
            barnesHut: { gravitationalConstant: -3000 },
            stabilization: {
                enabled:true,
                iterations:500,
                updateInterval:15
            },
        },
        layout: {
            randomSeed:3
        },
        height: '360',
        width: '100%'
    }

    var linkEdge = { physics: false, color:'red', dashes:true }
    var data = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) }
    data.nodes.add(Object.assign({ id:'model', model:networkModel }, graphConfig(networkModel)))

    function update(changes)
    {
        if (changes.newMembers)
            changes.newMembers.forEach(function(v, k, idx)
            {
                if (!v.isLeafType)
                {
                    var parentPathStrong = v.path.substr(0, v.path.lastIndexOf('.'))
                    var parentPath = changes.sender.path
                    var isLink = parentPath != parentPathStrong
                    var gc = graphConfig(v)
                    var sendergc = graphConfig(changes.sender)
                    //console.log('add: ' + parentPath + ' --> ' + v.path + (isLink ? '(link)' : ''))

                    if (!sendergc.showOnly ||
                        (sendergc.showOnly && sendergc.showOnly.indexOf(k) !== -1))
                    {
                        if (isLink)
                        {
                            if (typeof v != 'function')
                                data.edges.add({
                                    from:parentPath,
                                    to:v.path,
                                    title:k, physics: false, color:'#FF9800'
                                })
                        }
                        else
                        {
                            var initPos = getInitPos(v.path)
                            data.nodes.add(Object.assign({
                                id:v.path,
                                model:v,
                                x:initPos.x,
                                y:initPos.y,
                                //label:k,
                                font: { size:'116', color:'rgba(0, 0, 0, 0.08)' }
                            },
                            gc))

                            data.edges.add({
                                id:parentPath + ' -to- ' + v.path,
                                from:parentPath,
                                to:v.path,
                                title:k
                            })
                        }

                        var allKidsVisible = !gc.showOnly
                        var someKidsVisible = gc.showOnly && gc.showOnly.length > 0
                        var noKidsVisible = gc.showOnly && gc.showOnly.length == 0

                        if (!isLink && (someKidsVisible || allKidsVisible))
                        {
                            var next = v.subjobs || v // todo: newMembers enthalten nie kinder
                            update({ newMembers:next, sender:next })
                            next.on('change', update)
                        }
                    }
                }
            })

        if (changes.deletedMembers)
            changes.deletedMembers.forEach(function(v, k, idx)
            {
data.nodes.remove({ id:v.path })
                e({ id:changes.sender.path + ' -to- ' + v.path })
            })
    }

    var view = document.createElement('div')
        view.classList.add('graphView')
            var gView = onlyGraphView(networkModel, data, modelGraphConfig)
            var aView = undefined
        view.appendChild(gView)

    gView.network.on("selectNode", function (params)
    {
        if (aView)
        {
            view.removeChild(aView)
            aView = undefined
        }

        if (params.nodes[0])
        {
            aView = a3View(data.nodes.get(params.nodes[0]).model)
            view.appendChild(aView)
        }
    })

    update({ newMembers:networkModel, sender:networkModel })
    networkModel.on('change', update)
    return view
}
