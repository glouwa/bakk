function getCmdSet(j, diff)
{
    j.delegateToOne({
        desc: 'delegating to server',
        job: ()=> jf.remoteProxyJob({
            node: network.connections[0],
            args: j.params,
            realJob: js=> {
                var workers = app.getNodesByCapability('POSIX64')
                var elements = 5
                js.delegateToPool({
                    pool: workers,
                    count: elements,
                    desc: workers.length + ' worker, ' + elements + ' elements',
                    job: (idx, node)=> jf.remoteProxyJob({
                        node:node,
                        args:{},
                        realJob: jw=> jw.ret('ok', 'nothing to do')
                    })
                })
            }
        })
    })
}

new Object({
    type: 'Project',
    icon: '🐁',
    desc: 'Process empty job',
    service: {
        type: 'Service',
        src: getCmdSet,
        args: {           
            timeout:25000,
            workerTimeout:12000
        },
    },    
    tests: []
})
