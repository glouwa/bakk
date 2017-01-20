{
    type:'View',
    icon:'⛁',
    modelTypes:['Job'],
    idx:2,
    ctor:function jobPlot(jobModel)
    {
        var view = document.createElement('div')
            view.className = 'plot+split'
            var pv = jobStateWithLogView(jobModel, jpViewFactory({ caption:false, log:true, width:'100%' }))
                pv.style.width = '100%'
                pv.style.margin = '-1 0 0 0'
            var gv = app.core.views.a4v.query('Job', 3)(jobModel)
            var aView = undefined
            view.appendChild(pv)
            view.appendChild(gv)

        gv.d3handler.onFocus= function(e) {
            if (aView) {
                view.removeChild(aView)
                aView = undefined
            }
            if (e) {
                //aView = autoView(e.__data__)
                aView = objectd3treeView(e.__data__)
                aView.style.borderStyle = 'dashed none none none'
                aView.style.borderWidth = 1
                aView.style.borderColor = '#B0B0B0'
                view.appendChild(aView)
            }
        }
        return view
    }
}
