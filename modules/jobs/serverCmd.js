function spawnCmd(j)
{
    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output:{ type:'CmdResult', stdout:'' }
    })

    j.delegateToOne({
        job: ()=> jf.remoteProxyJob({
            args: j.params,
            node: network.connections[0],
            realJob: js=> tj.spawn(js, {
                cmd: js.params.cmd,
                justStart:js.params.justStart,
                onStdOut: function onStdOut(jw, data)
                {
                    onStdOut.count = onStdOut.count || 1
                    jw.commitJob({ type:'running', progress:0.95 }, { stdout:data })
                }
            })
        })
    })
}

function cmdResultView(model)
{
    var view = document.createElement('div')
    view.className = 'stdout'
    view.style.margin = '20 10'
    view.style.fontFamily = 'monospace'
    view.style.fontSize = '8pt'
    view.style.whiteSpace = 'pre'
    view.draggable = true
    view.ondragstart = ev=> ev.preventDefault()

    function update() { view.innerText = model.stdout.valueOf() }
    update()
    model.stdout.on('change', update)
    return view
}


new Object({
    type: 'Project',
    icon: '💻',
    desc: 'Spawn process on server',
    service: {
        type: 'Service',
        src: spawnCmd,
        args: {
            cmd: 'ls ../.. -l',
            justStart:false,
            timeout:500
        },
    },
    tests: [],
    views: {
        cmdResult: {
            type: 'View',
            demoViewModel: {},
            ctor: m=> cmdResultView(m)
        }
    }
})

