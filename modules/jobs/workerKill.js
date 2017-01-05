function killServerOverlordsAndWorkers(j)
{
    j.delegate(()=> jf.remoteProxyJob({
        icon: '☠',
        desc: 'delegating to server',
        args: j.params,
        node: app.network.connections[0],
        realJob: js=> js.delegate(
            ()=> jf.job({
                icon: '☠w*',
                desc:'send kill signal to workers',
                onCall: kwj=> {
                    var nodes = app.getNodesByType(js.params.nodeType, 'emptyResultIsOk')
                    if (nodes.length == 0)
                        kwj.ret('ok', 'no workers to kill')
                    else
                        kwj.delegate({
                            type: 'parallel',
                            end: idx=> idx < nodes.length,
                            job: idx=> jf.remoteProxyJob({
                                icon: '☠w',
                                desc:'suicide',
                                node: nodes[idx],
                                args: js.params,
                                realJob: jw=> {
                                    jw.ret('ok', app.workerId().valueOf() + ' will exit in ½s')
                                    setTimeout(()=>process.exit(0), 500)
                                }
                            })
                        })
                }
            }),
            ()=> jf.job({
                icon: '☠s',
                desc:'suicide',
                onCall: ksj=> {
                   var serverkill = js.params.nodeType.some(i=> i.valueOf() == 'Server')
                   ksj.ret('ok', serverkill ? 'S₀ will exit in ½s' : ' S₀ does nothing')
                   if (serverkill) setTimeout(()=>process.exit(0), 500)

                }
            })
        )
    }))
}

new Object({
    type:'Project',    
    jobPrototype:
    {
        type: 'JobPrototype',
        icon: '☠',
        desc: 'Kill server and overlords',
        onCall: killServerOverlordsAndWorkers,
        args: { nodeType: ['Server', 'Overlord', 'Worker'] },
    },
    tests: []
})
