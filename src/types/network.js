function networkType()
{
    function killOneConditional(j, nodeType)
    {
        jw.ret('ok', 'will exit now')
        process.exit(0)
    }

    function multiCastJob(j, nodeType, action)
    {
        j.delegateToOne({ job:()=> jf.remoteProxyJob({
            args: j.params,
            node: network.connections[0],
            realJob: js=> {

                // sequence
                    var nodes = app.filterNodes('POSIX64')
                    js.delegateToFactory({
                        desc: 'shutting down worker',
                        end: idx=> idx < nodes.length,
                        job: idx=> jf.remoteProxyJob({
                            node: nodes[idx],
                            realJob: jw=> action(jw, nodeType)
                        })
                    })

                    // apply action
            }
        })})
    }

    var obj = {
        type:'Network',
        '+1 client':function(j)
        {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open(...) called")
        },
        '+4 worker':function(j)
        {
            j.params.amount = 4
            if (!app.model.projects['🖥 Run some workers on server']['↻'])
                j.delegateToSequence(
                    ()=> jf.job({ onCall:sj=> app.model.projects['🖥 Run some workers on server'].service.src(sj), params:j.params })
                )
            else
                j.delegateToSequence(
                    ()=> jf.job({ onCall:sj=> app.model.projects['🖥 Run some workers on server']['↻'](sj) }),
                    ()=> jf.job({ onCall:sj=> app.model.projects['🖥 Run some workers on server'].service.src(sj), params:j.params })
                )
        },
        '☠ worker':function(j) //multiCastJob(j, 'W', killOneConditional)
        {
            j.delegateToOne({ job:()=> jf.remoteProxyJob({
                args: j.params,
                node: network.connections[0],
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
        '☠ server':function(j) //multiCastJob(j, 'M', killOneConditional)
        {
            j.delegateToOne({ job:()=> jf.remoteProxyJob({
                args: j.params,
                node: network.connections[0],
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
            node: network.connections[0].send(channelMsg)
            j.ret('ok', 'reload message sent')
        }
    }
    return obj
}
