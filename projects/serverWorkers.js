function runWorkers(j, diff)
{
    j.delegateToOne({ job:()=> jf.remoteProxyJob({
        args: j.params,
        node: network.connections[0],
        realJob: js=>
        {
            var nodes = app.getNodesByType(['Overlord'], 'emptyResultIsOk')
            js.delegateToFactory({
                end: idx=> idx < nodes.length + 1,
                job: idx=>
                {
                    if (idx < nodes.length) return jf.remoteProxyJob({
                        desc:'sending multicast to ' + nodes[idx].id,
                        node: nodes[idx],
                        args: js.params,
                        realJob: jw=> jw.delegateToFactory({
                            end: idx=> idx < jw.params.amount,
                            job: idx=> tj.spawnJob({
                                path:'node',
                                args:['worker.js'],
                                justStart:jw.params.justStart
                            })
                        })
                    })

                    else return jf.job({ desc:'apply on server', onCall:ssj=>
                        ssj.delegateToFactory({
                            end: idx=> idx < js.params.amount,
                            job: idx=> tj.spawnJob({
                                path:'node',
                                args:['worker.js'],
                                startProgress:0.5,
                                justStart:js.params.justStart
                            })
                        })
                    })
                }
            })
        }
    })})
}

new Object({
    type:'Project',
    icon: '🖥',
    desc: 'Run some workers on server',
    service:
    {
        type: 'Service',
        src: runWorkers,
        args: { amount: 3, justStart:true },
    },
    tests: []
})
