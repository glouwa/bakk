function runWorkers(j, diff)
{
    j.delegateToOne({ job:()=> jf.remoteProxyJob({
        args: j.params,
        node: network.connections[0],
        realJob: js=>
        {
            var nodes = app.getNodesByType(['Overlord'], 'emptyResultIsOk')
            var devCount = js.params.devCount?Number(js.params.devCount.valueOf())-1:nodes.length

            js.delegateToFactory({
                end: idx=> idx < devCount + 1,
                job: idx=>
                {
                    if (idx < devCount) return jf.remoteProxyJob({
                        desc:'sending multicast to ' + nodes[idx].id,
                        node: nodes[idx],
                        args: js.params,
                        realJob: jw=> jw.delegateToFactory({
                            end: idx=> idx < jw.params.workerCount,
                            job: idx=> tj.spawnJob({
                                path:'node',
                                args:['worker.js'],
                                justStart:jw.params.justStart
                            })
                        })
                    })

                    else return jf.job({ desc:'apply on server', onCall:ssj=>
                        ssj.delegateToFactory({
                            end: idx=> idx < js.params.workerCount,
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
        args: { workerCount: 3, justStart:true },
    },
    tests: []
})
