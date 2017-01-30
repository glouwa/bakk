{
    type:'View',
    icon:'÷',
    modelTypes:['Job'],
    idx:2,
    ctor:function jobPlot(jobModel)
    {
        var view = document.createElement('div')
            view.className = 'plot+split'            
            //var gv = app.core.views.a4v.query('Job', 3)(jobModel)
            var gv = app.core.views.a4v['job-d3gantView:js'].obj.ctor(jobModel)
            var aView = undefined           
            view.appendChild(gv)

        gv.d3handler.onFocus= function(e) {
            if (aView) {
                view.removeChild(aView)
                aView = undefined
            }
            if (e) {
                //aView = autoView(e.__data__)
                aView = app.core.views.a5h.query('object', 2)(e.__data__)
                aView.style.borderStyle = 'dashed none none none'
                aView.style.borderWidth = 1
                aView.style.borderColor = '#B0B0B0'
                view.appendChild(aView)
            }
        }
        return view
    }
}
