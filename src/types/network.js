function networkType()
{
    return {
        type:'Network',
        '+1 client': j=> {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open(...) called")
        },
        '+4 worker': j=> {
            j.params.update({ amount:4 })
            app.model.projects['🖥 Run some workers on server']['▸'](j)
        },
        '☠ worker': j=> {
            app.model.projects['☠ Kill sys']['▸'](j, {}, { nodeType:['Worker']})
        },
        '☠ all': j=> {
            app.model.projects['☠ Kill sys']['▸'](j, {}, { nodeType:['Server', 'Overlord', 'Worker']})
        },
        '↻ clients': j=> {
            var msg = messages.reloadMsg()
            var channelMsg = messages.channelMsg('Ws', msg)
            node: network.connections[0].send(channelMsg)
            j.ret('ok', 'reload message sent')
        }
    }
}
