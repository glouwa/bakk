function killServerOverlordsAndWorkers(j)
{
    j.delegateToOne({ job:()=> jf.remoteProxyJob({
        desc:'kill on server ' + network.connections[0].id,
        args: j.params,
        node: network.connections[0],
        realJob: js=> js.delegateToSequence(

            ()=> jf.job({ desc:'kill all workers paralell', onCall: kwj=> {
                try {
                    var nodes = app.getNodesByType(js.params.nodeType)                    
                    kwj.delegateToFactory({
                        end: idx=> idx < nodes.length,
                        job: idx=> jf.remoteProxyJob({
                            desc:'kill on worker ' + nodes[idx].id,
                            node: nodes[idx],
                            args: js.params,
                            realJob: jw=> {
                                jw.ret('ok', jf.workerId.valueOf() + ' will exit in ½s')
                                setTimeout(()=>process.exit(0), 500)
                            }
                        })
                    })
                }
                catch(e){
                    kwj.ret('ok', 'no workers to kill')
                }
            }}),
            ()=> jf.job({ desc:'kill server', onCall: ksj=>
            {
                setTimeout(()=> { // todo: if last job in sequence is sync -> double return
                   var serverkill = js.params.nodeType.some(i=> i.valueOf() == 'Server')
                   ksj.ret('ok', serverkill?'S₀ will exit in ½s':' S₀ does nothing')
                   if (serverkill) setTimeout(()=>process.exit(0), 500)
                }, 10)
            }})
        )
    })})
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
