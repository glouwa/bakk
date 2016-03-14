function networkType()
{
    var obj = {
        type:'Network',
        '++client':function(j)
        {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open('./view.html', '_blank') called")
        },
        '++worker':function(j)
        {
            j.params.amount = 4
            j.delegateToSequence(
                ()=> jf.job({ onCall:sj=> app.model.projects['⤑🖥']['↻'](sj) }),
                ()=> jf.job({ onCall:sj=> app.model.projects['⤑🖥'].service.src(sj), params:j.params })
            )
        },
        '↻ worker':function(j)
        {
            j.delegateToOne({ job:()=> jf.remoteProxyJob({
                args: j.params,
                node: network.server,
                realJob: js=> {
                    var nodes = app.filterNodes('POSIX64')
                    js.delegateToFactory({
                        desc: 'shutting down worker',
                        end: idx=> idx < nodes.length,
                        job: idx=> jf.remoteProxyJob({
                            node: nodes[idx],
                            realJob: jw=> {
                                jw.ret('ok', 'will exit now')
                                process.exit(0)
                            }
                        })
                    })
                }
            })})
        },
        '↻ server':function(j)
        {
            j.delegateToOne({ job:()=> jf.remoteProxyJob({
                args: j.params,
                node: network.server,
                realJob: js=> {
                    js.ret('ok', 'will exit now')
                    process.exit(0)
                }
            })})
        },
        '↻ clients':function(j)
        {
            var msg = messages.reloadMsg()
            var channelMsg = messages.channelMsg('Ws', msg)
            network.server.send(channelMsg)
            j.ret('ok', 'reload message sent')
        }
    }
    return obj
}
