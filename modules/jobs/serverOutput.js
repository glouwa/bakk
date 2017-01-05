function serverOuput(j, diff)
{
    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: {}
    })

    j.delegate(() => jf.remoteProxyJob({
        icon: '🗩',
        node: app.network.connections[0],
        args: j.params,
        desc: 'Generate output',
        realJob: (js, diff)=>
        {
            js.updateJob({
                state:{
                    type: 'running',
                    log: 'output at server',
                    progress: 0.95
                },
                output:{
                    msg: js.params.text
                }
            })
            js.ret('ok', 'no exceptions')
        }
    }))
}

new Object({
    type:'Project',    
    jobPrototype:
    {
        type: 'JobPrototype',
        icon: '⤑🗩',
        desc: 'Generate some output at server',
        onCall: serverOuput,
        args: {
            text: 'this text will appear in output',            
           // timeout: 1500
        },
    },
    tests: []
})
