function getCmdSet(j, diff)
{
    app.mergePath('model.store.'+j.id, {})
    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: app.model.store[j.id.valueOf()]
    })

    j.delegate(()=> jf.remoteProxyJob({
        icon: 'Ⓟ',
        desc: 'delegating to server',
        node: network.connections[0],
        args: j.params,
        realJob: js=> {
            var workers = app.getNodesByCapability('POSIX64')
            var elements = 10
            js.updateJob({ state:{ type:'running' }, output:{ workerCount:workers.length }})
            js.delegate({
                type: 'pool',
                pool: workers,
                count: elements,
                desc: workers.length + ' worker, ' + elements + ' elements',
                job: (idx, node)=> jf.remoteProxyJob({
                    icon: '⛶',
                    desc: 'empty job',
                    node:node,
                    args:{},
                    realJob: jw=> jw.ret('ok', 'nothing to do')
                })
            })
        }
    }))
}

new Object({
    type: 'Project',    
    jobPrototype: {
        type: 'JobPrototype',
        icon: '🐁Ⓓ',
        desc: 'Process empty jobs',
        onCall: getCmdSet,
        args: {           
            timeout:25000,
            workerTimeout:12000
        },
    },    
    tests: []
})
