{
    type: 'View',
    modelTypes: ['jobfunctions'],
    ctor: function(jobModel) // der bekommt ein model
    {
        var view = button('▸')

        var stateMap = {
            'idle':      { caption:'▸', disabled:false, onClick:() => jobModel.call() },
            'calling':   { caption:'■', disabled:false, onClick:() => jobModel.cancel() },
            'running':   { caption:'■', disabled:false, onClick:() => jobModel.cancel() },
            'canceling': { caption:'■', disabled:true,  onClick:undefined },
            'returned':  { caption:null,disabled:true,  onClick:undefined }
        }

        function unpdateButton()
        {
            view.state = stateMap[jobModel.state.type.valueOf()]

            view.caption.innerText = view.state.caption || config.getIcon(jobModel.state)
            view.onclick = view.state.onClick
            view.disable(view.state.disabled)
            view.setProgress(+jobModel.state.progress, config.getColor(jobModel.state))
        }

        unpdateButton()
        jobModel.state.on('change', unpdateButton)
        view.onclick = function() { view.state.onClick()/*; unpdateButton() aber ohne gibts double cancels? nein. */}
        view.style.fontSize = 12
        return view
    }
}
