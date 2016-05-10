function serverOuput(j, diff)
{
    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: {}
    })

    j.delegateToOne({
        job: () => jf.remoteProxyJob({
            node: network.connections[0],
            args: j.params,
            realJob: (js, diff)=>
            {
                js.updateJob(
                    { state: { type: 'running', log: 'output at server', progress: 0.95 } },
                    { msg: js.params.text }
                )
                js.ret('ok', 'no exceptions')
            }
        })
    })
}

new Object({
    type:'Project',
    icon: '⤑🗩',
    desc: 'Generate some output at server',
    service:
    {
        type: 'Service',
        src: serverOuput,
        args: {
            text: 'this text will appear in output',            
            timeout: 500
        },
    },
    tests: []
})
