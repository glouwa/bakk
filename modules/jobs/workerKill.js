function killServerOverlordsAndWorkers(j)
{
    j.delegate(()=> jf.remoteProxyJob({
        desc: 'delegating to server',
        args: j.params,
        node: network.connections[0],
        realJob: js=> js.delegate(

            ()=> jf.job({ desc:'send kill signal to workers', onCall: kwj=> {
                var nodes = app.getNodesByType(js.params.nodeType, 'emptyResultIsOk')
                if (nodes.length == 0)
                    kwj.ret('ok', 'no workers to kill')
                else
                    kwj.delegate({
                        type: 'parallel',
                        end: idx=> idx < nodes.length,
                        job: idx=> jf.remoteProxyJob({
                            desc:'suicide',
                            node: nodes[idx],
                            args: js.params,
                            realJob: jw=> {
                                jw.ret('ok', jf.workerId.valueOf() + ' will exit in ½s')
                                setTimeout(()=>process.exit(0), 500)
                            }
                        })
                    })

            }}),
            ()=> jf.job({ desc:'suicide', onCall: ksj=> {
                //setTimeout(()=> { // todo: if last job in sequence is sync -> double return (swaped)
                   var serverkill = js.params.nodeType.some(i=> i.valueOf() == 'Server')
                   ksj.ret('ok', serverkill ? 'S₀ will exit in ½s' : ' S₀ does nothing')
                   if (serverkill) setTimeout(()=>process.exit(0), 500)
                //}, 10)
            }})
        )
    }))
}

new Object({
    type:'Project',
    icon: '☠',
    desc: 'Kill server and overlords',
    service:
    {
        type: 'Service',
        src: killServerOverlordsAndWorkers,
        args: { nodeType: ['Server', 'Overlord', 'Worker'] },
    },
    tests: []
})
