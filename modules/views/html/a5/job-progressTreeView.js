{
    type:'View',
    icon:'∇',
    modelTypes:['Job'],
    idx:2,
    ctor:function jobStateTreeView(jobModel)
    {
        //var jobAndSubjobsView2 =(l)=> jobAndSubjobsView(jobModel, l)

        function jobAndSubjobsView(jobModel, l)
        {
            var view = document.createElement('div')
                view.className = 'jobAndSubjobs'
                var header = jobProgressWithLogView(
                    jobModel,
                    jpViewFactory({ caption:true, log:true, width:'130' /*, level:l*/ })
                )
                var subjobs = undefined

            view.update = function(changes)
            {
                if (l < 2)
                    if (changes.newMembers.subjobs)
                    {
                        console.assert(!subjobs)
                        subjobs = listView(
                            jobModel.subjobs,
                            (v, k)=> jobAndSubjobsView(v, l+1),
                            'subjobs'
                        ) // RECURSION
                        view.appendChild(subjobs)
                    }
            }

            view.update({ newMembers:jobModel })
            jobModel.on('change', view.update)
            view.appendChild(header)
            return view
        }

        var view = document.createElement('div')
            view.className = 'jobStateTreeView'
            var treeRoot = jobAndSubjobsView(jobModel, 0)
                treeRoot.style.margin = '20 0'
                treeRoot.style.padding = '0 0 1 0'
                //treeRoot.style.maxHeight = '200'
                //treeRoot.style.overflowY = 'auto'
                //treeRoot.style.overflow = 'auto'

        view.appendChild(treeRoot)
        return view
    }

}
