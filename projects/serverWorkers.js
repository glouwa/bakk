function runWorkers(j, diff)
{
    j.delegateToOne({
        job: () => jf.remoteProxyJob({
            args: j.params,
            node: network.connections[0],
            realJob: js=> js.delegateToFactory({
                end: idx=> idx < js.params.amount,
                job: idx=> tj.spawnJob('node', ['worker.js'], undefined, 0.5)
            })
        })
    })
}

new Object({
    type:'Project',
    icon: '⤑🖥',
    desc: 'Run some workers on server',
    service:
    {
        type: 'Service',
        src: runWorkers,
        args: {
            amount: 4
        },
    },
    tests: []
})
