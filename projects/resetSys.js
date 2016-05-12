function killServerAndoverlordsWorkers(j, diff)
{    
    j.delegateToOne({ job:()=> jf.remoteProxyJob({
        desc:'sending multicast to ' + network.connections[0].id,
        args: j.params,
        node: network.connections[0],
        realJob: js=> js.delegateToSequence(
            ()=> jf.job({ onCall: kwj=> {
                try {
                    var nodes = app.getNodesByType(js.params.nodeType)
                    kwj.delegateToFactory({
                        end: idx=> idx < nodes.length,
                        job: idx=> jf.remoteProxyJob({
                            desc:'sending multicast to ' + nodes[idx].id,
                            node: nodes[idx],
                            args: js.params,
                            realJob: jw=> {
                                jw.ret('ok', 'will exit in ½s')
                                setTimeout(()=>process.exit(0), 500)
                            }
                        })
                    })
                }
                catch(e){
                    kwj.ret('ok', 'no workers to kill')
                }
            }}),
            ()=> jf.job({ desc:'apply on server', onCall: ksj=>
            {
                setTimeout(()=> { // todo: if last job in sequence is sync -> double return
                   var serverkill = js.params.nodeType.some(i=> i.valueOf() == 'Server')
                   ksj.ret('ok', serverkill?'will exit in ½s':'do nothing')
                   if (serverkill) setTimeout(()=>process.exit(0), 500)
                }, 0)
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
        src: killServerAndoverlordsWorkers,
        args: { nodeType: ['Server', 'Overlord', 'Worker'] },
    },
    tests: []
})
