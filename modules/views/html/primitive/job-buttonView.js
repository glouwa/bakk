
function jobControlingButton(jobModel) // der bekommt ein model
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
        view.setProgress(jobModel.state.progress, config.getColor(jobModel.state))
    }

    unpdateButton()
    jobModel.state.on('change', unpdateButton)
    view.onclick = function() { view.state.onClick()/*; unpdateButton() aber ohne gibts double cancels? nein. */}
    view.style.fontSize = 12
    return view
}

function jobRootButon(args)// name, args, src, noIcons, obj)   // der erstellt ein model
{
    var job = 'will be set after job creation, but before job call'
    var cap = icon=>
        (args.noIcons?'':(icon+' ')) +
        (args.noName?'':(args.name+' '))

    var view = button(cap('▸'), true, args.className)
    var stateMap = {
        'idle':      { caption:cap('▸'), disabled:true,  onClick:undefined         },
        'calling':   { caption:cap('■'), disabled:false, onClick:()=> job.cancel() },
        'running':   { caption:cap('■'), disabled:false, onClick:()=> job.cancel() },
        'canceling': { caption:cap('■'), disabled:true,  onClick:undefined         },
        'returned':  { caption:cap('▸'), disabled:false, onClick:()=> attachJob()  }
    }

    function attachJob() {
        function updateView() {
            var state = stateMap[job.state.type.valueOf()]
            if (state) {
                view.state = state
                view.caption.innerText = view.state.caption
                view.onclick = e=> {
                    e.stopPropagation()
                    view.state.onClick()
                }
                view.disable(view.state.disabled)
            }
            else
                console.error(false)

            view.setProgress(job.state.progress.valueOf(), config.getColor(job.state))
        }


        function createRootJob() {
            var jd = jf.job({
                icon: '⎇',
                desc: 'button ' + args.name,
                isRoot: true,
                params: args.args,
                onCall: (j, params)=> {
                    if (args.obj) args.obj[args.name](j, params)   // model obj method?
                    else          args.src(j, params)              // project service?
                }
            })
            app.mergePath('model.jobs.'+jd.id, jd)
            job = app.model.jobs[jd.id.valueOf()]
            $('#jobTab')[0].add(job.id, { content:jobAllView(job) }/*, 'inBg'*/)
        }

        //if (jobModel)
        //    jobModel.state.off('change', unpdateButton) TODO

        q.addRoot('Message From UI ' + args.name, ()=>{
            createRootJob()
            updateView()
            job.state.on('change', updateView)
            view.onclick = e=> {
                e.stopPropagation()
                view.state.onClick() // ; unpdateButton() aber ohne gibts double cancels? nein.
            }
            job.call()
//job.commit('UI creates and calls job') // mach jetzt das ui update
            // ist es richtig das hier nur änderungen innerhalb von job entstehen können?
            // wie ist das bei project load?
        })
    }

    view.onclick = e=> { e.stopPropagation(); attachJob() }
    view.style.fontSize = 12
    view.title = args.name
    return view
}
