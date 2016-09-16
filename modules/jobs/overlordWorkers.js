function runWorkers(j, diff)
{
    j.delegate(()=> jf.remoteProxyJob({
        icon: '4w+',
        desc: 'delegating to server',
        args: j.params,
        node: network.connections[0],
        realJob: js=> {

            var nodes = app.getNodesByType(['Overlord'], 'emptyResultIsOk')
            var devCount = js.params.devCount
                         ? Number(js.params.devCount.valueOf())
                         : nodes.length

            js.delegate({
                type: 'parallel',
                desc: 'do stuff parallel on workers',
                end: idx=> idx < devCount /*+ 1*/,
                job: idx=> {

                    if (idx < nodes.length) return jf.remoteProxyJob({
                        icon: '⚙w*',
                        desc:'spawing workers',
                        node: nodes[idx],
                        args: js.params,
                        realJob: jw=> jw.delegate({
                            type: 'parallel',
                            end: idx=> idx < jw.params.workerCount,
                            job: idx=> tj.spawnJob({
                                icon: '⚙w',
                                path:'node',
                                args:['worker.js'],
                                justStart:jw.params.justStart
                            })
                        })
                    })

                    /*else return jf.job({ desc:'spawing workers', onCall:ssj=> // server füllt auf
                        ssj.delegateToFactory({
                            end: idx=> idx < js.params.workerCount,
                            job: idx=> tj.spawnJob({
                                path:'node',
                                args:['worker.js'],
                                startProgress:0.5,
                                justStart:js.params.justStart
                            })
                        })
                    })*/
                }
            })
        }
    }))
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
