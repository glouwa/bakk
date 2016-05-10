function networkType()
{
    function multiCastJob(j, nodeType)
    {
        j.params.update({ nodeType:nodeType })
        $('#jobTab')[0].add(j.id, { content:jobAllView(j) })
        j.delegateToOne({ job:()=> jf.remoteProxyJob({
            desc:'sending multicast to ' + network.connections[0].id,
            args: j.params,
            node: network.connections[0],
            realJob: js=> js.delegateToSequence(
                ()=> jf.job({ onCall: kwj=>
                {
                    try
                    {
                        var nodes = app.getNodesByType(js.params.nodeType)
                        kwj.delegateToFactory({
                            end: idx=> idx < nodes.length,
                            job: idx=> jf.remoteProxyJob({
                                desc:'sending multicast to ' + nodes[idx].id,
                                node: nodes[idx],
                                params: {},
                                realJob: jw=> {
                                    jw.ret('ok', 'will exit in ½s')
                                    setTimeout(()=>process.exit(0), 500)
                                }
                            })
                        })
                    }
                    catch(e)
                    {
                        kwj.ret('ok', 'no workers to kill')
                    }
                }}),
                ()=> jf.job({ desc:'apply on server', onCall: ksj=>
                {
                    setTimeout(()=>{ // todo: if last job in sequence is sync -> double return
                       var serverkill = js.params.nodeType.some(i=> i.valueOf() == 'Server')
                       ksj.ret('ok', serverkill?'will exit in ½s':'do nothing')
                       if (serverkill) setTimeout(()=>process.exit(0), 500)
                    }, 0)
                }})
            )
        })})
    }

    var obj = {
        type:'Network',
        '+1 client':j=> {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open(...) called")
        },
        '+4 worker':j=> {
            j.params.update({ amount:4 })
            app.model.projects['🖥 Run some workers on server']['▸'](j)
        },
        '☠ worker': j=> multiCastJob(j, ['Worker']),
        '☠ all':    j=> multiCastJob(j, ['Server', 'Overlord', 'Worker']),
        '↻ clients':j=> {
            var msg = messages.reloadMsg()
            var channelMsg = messages.channelMsg('Ws', msg)
            node: network.connections[0].send(channelMsg)
            j.ret('ok', 'reload message sent')
        }
    }
    return obj
}
