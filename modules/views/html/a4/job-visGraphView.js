{
    type:'View',
    icon:'⛁',
    modelTypes:['Job'],
    idx:1,
    ctor: function jobStateGraphView(jobModel)
    {
        var jobStateGraphConfig = {
            //autoResize: true,
            nodes: {
                shape:'dot',
                //size:25
            },
            layout: {
                hierarchical: {
                    sortMethod: 'directed',
                    direction: 'UD',
                    blockShifting: false,
                    edgeMinimization: false,
                    levelSeparation:150
                    //nodeSpacing:500
                }
            },
            physics: false,
            interaction: {
                hover: true,
                navigationButtons: true
            },
            height: '300',
            width: '100%'
        }

        var deviceColorMap = {
            'C':'rgba(241, 241, 7, 0.95)',
            'W':'rgba(176, 141, 130, 0.7)',
            'S':'rgba(123,225,65,0.7)'
        }

        var data = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) }
        data.nodes.add({
            id:jobModel.path.valueOf(),
            //label:jobModel.id.valueOf(),
            model:jobModel,
            font: {size:'32'},
            //borderWidth:2
        })
        jobModel.state.on('change', function(changes)
        {
            data.nodes.update({
                id:jobModel.path.valueOf(),
                color:config.getColor(jobModel.state),
                /*color:{
                    background:config.getColor(jobModel.state),
                    border:deviceColorMap[jobModel.state.lastWorker.valueOf().charAt(0)]
                }*/
            })
            gView.network.fit()
        })

        function updateSubjobs(changes)
        {
            if (changes.newMembers)
                changes.newMembers.forEach(function(v, k, idx)
                {
                    var pp1 = v.path.substr(0, v.path.lastIndexOf('.'))
                    var parentPath = pp1.substr(0, pp1.lastIndexOf('.'))

                    data.nodes.update({ // use add to assert no double add
                        id:v.path.valueOf(),
                        model:v,
                        font: {size:'32'},
                        color:config.getColor(v.state),
                        //borderWidth:2,
                        /*color:{
                            background:config.getColor(v.state),
                            border:deviceColorMap[v.state.lastWorker.valueOf().charAt(0)]
                        }*/
                    })
                    data.edges.add({
                        from:parentPath.valueOf(),
                        to:v.path.valueOf(),
                        color:'#848484'
                    })

                    v.state.on('change', function(changes)
                    {
                        data.nodes.update({
                            id:v.path.valueOf(),
                            color:config.getColor(v.state),
                            /*color:{
                                background:config.getColor(v.state),
                                border:deviceColorMap[v.state.lastWorker.valueOf().charAt(0)]
                            }*/
                        })
                        gView.network.fit()
                    })

                    if (!v.isLeafType)
                    {
                        updateJob({ newMembers:v }, v.path)
                        v.on('change', updateJob)
                    }
                    gView.network.fit()
                })
        }

        function updateJob(changes, nodeId)
        {
            if (changes.newMembers)
                if (changes.newMembers.subjobs)
                {
                    updateSubjobs({ newMembers:changes.newMembers.subjobs })
                    changes.newMembers.subjobs.on('change', updateSubjobs)
                }
        }

        var view = document.createElement('div')
            view.classList.add('graphView')
            //var progressTree = jobStateTreeView(jobModel)
            var gView = onlyGraphView(jobModel, data, jobStateGraphConfig)
                gView.style.margin = '20 0'
            var aView = undefined

        //view.appendChild(progressTree)
        view.appendChild(gView)

        gView.network.on("select", function (params)
        {
            if (aView)
            {
                view.removeChild(aView)
                aView = undefined
            }

            if (params.nodes[0])
            {
                aView = autoView(data.nodes.get(params.nodes[0]).model)
                aView.style.borderStyle = 'dashed none none none'
                aView.style.borderWidth = 1;
                aView.style.borderColor = '#B0B0B0'
                view.appendChild(aView)
            }
        })

        updateJob({ newMembers:jobModel }, jobModel.path)
        jobModel.on('change', updateJob)
        return view
    }
}

