{
    type: 'View',
    modelTypes: 'Job',
    ctor: function(model)
    {
        var view = document.createElement('div')
            view.className = 'jobLineView'
            view.style.marginRight = '5'
         //   view.style.float = 'right'
            var icon = document.createElement('div')
                icon.className = 'textView'
                icon.style.float = 'left'
                icon.style.marginLeft = 16
                icon.style.maxWidth = 100
                icon.style.whiteSpace = 'nowrap'
                icon.style.overflow = 'hidden'
                icon.innerText = model.icon?model.icon.toString():'undef'
            var desc = document.createElement('div')
                desc.className = 'textView'
                desc.style.float = 'right'
                desc.style.marginLeft = 10
                desc.style.maxWidth = 100
                desc.style.whiteSpace = 'nowrap'
                desc.style.overflow = 'hidden'
            var sig = document.createElement('div')
                sig.className = 'textView'
                sig.style.float = 'right'
                sig.style.minWidth = 220
                sig.style.marginLeft = 15
            var time = document.createElement('div')
                time.className = 'textView'
                time.style.float = 'right'
                time.style.textAlign = 'right'
                time.style.minWidth = 50
            var state = document.createElement('div')
                state.className = 'textView'
                state.style.float = 'right'
                state.style.textAlign = 'right'
                state.style.minWidth = 40
            var jobControlingButton = app.core.views.primitive.query('jobfunctions')(model)
            jobControlingButton.style.height = 15
            jobControlingButton.style.margin = '-1 0 -1 10'
            view.appendChild(jobControlingButton)
            view.appendChild(state)
            view.appendChild(time)
            view.appendChild(sig)
            view.appendChild(desc)
            view.appendChild(icon)

            view.update = ()=>
            {
                var workTimeMs = jf.jobTime(model)

                if (workTimeMs > 1000*60*60)
                    time.innerText = ~~(workTimeMs/(1000*60*60)) + 'h'
                else if (workTimeMs > 1000*60)
                    time.innerText = ~~(workTimeMs/(1000*60)) + 'm'
                else if (workTimeMs > 1000)
                    time.innerText = ~~(workTimeMs/1000) + 's'
                else
                    time.innerText = workTimeMs + 'ms'

                desc.innerText = model.desc + ':'//🠒🠆➞➡→
                sig.innerText =  '(…) → ' + model.state.log

                if (model.state.type == 'returned')
                    state.innerText = ''//config.getIcon(model.state)
                else
                    state.innerText = (model.state.progress.valueOf()*100).toFixed(0) + '%'
            }
            view.update()

        model.on('change', view.update)
        return view
    }
}
