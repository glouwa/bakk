{
    type: 'View',
    icon:'Jᵪ',
    modelTypes: ['Job'],
    ctor: function(model)
    {
        function progress(model)
        {
            function ms2str(ms)
            {
                if (ms > 1000*60*60)   return ~~(ms/(1000*60*60)) + 'h'
                else if (ms > 1000*60) return ~~(ms/(1000*60)) + 'm'
                else if (ms > 1000)    return ~~(ms/1000) + 's'
                else                   return ms + 'ms'
            }

            var view = htmlElement('div', 'progress-ex', model)
                var time = htmlElement('div', 'text', model)
                var state = htmlElement('div', 'text', model)
                var pv = jobProgressWithLogView(model, jpViewFactory({ caption:false, log:true, width:'100%' }))

            view.append(time)
            view.append(pv)
            view.append(state)

            transformBinding(model, htmlIt2View(time), m=> ms2str(jf.jobTime(m)))
            transformBinding(model, htmlIt2View(state), m=> {
                if (m.state.type == 'returned') return m.state.log
                else return (m.state.progress.valueOf()*100).toFixed(0) + '%'
            })
            return view
        }

        var view = document.createElement('div')
            view.className = 'jobLineView'
            view.style.marginRight = 5
            view.style.marginTop = 3            
            var desc = document.createElement('div')
                desc.className = 'textView'
                desc.style.float = 'left'
                desc.style.marginLeft = 10
                desc.style.maxWidth = 100
                desc.style.whiteSpace = 'nowrap'
                desc.style.overflow = 'hidden'
            var sig = document.createElement('div')
                sig.className = 'textView'
                sig.style.float = 'right'
                sig.style.minWidth = 'calc(50% - 50pt)'//250
                sig.style.marginLeft = 15
            var p = progress(model)
            var jobControlingButton = app.core.views.primitive.query('Job', 1)(model)
                jobControlingButton.style.height = 15
                jobControlingButton.style.margin = '-3 0 -1 10'

            view.appendChild(jobControlingButton)            
            view.appendChild(p)
            view.appendChild(sig)            
            view.appendChild(desc)

        transformBinding(model, htmlIt2View(desc), m=> m.desc + ':')
        transformBinding(model, htmlIt2View(sig),  m=> '(…) ⟼ ' + m.output.type)
        return view
    }
}
