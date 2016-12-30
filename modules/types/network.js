function networkType()
{
    return {
        type:'Network',
        '+1 client': j=> {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open(...) called")
        },
        '+4 worker': j=> app.model.mods.services['🖥 Start workers']['▸'](j),
        '☠ worker': j=> app.model.mods.services['☠ Kill all']['▸'](j, {}, { nodeType:['Worker']}),
        '☠ all': j=> app.model.mods.services['☠ Kill all']['▸'](j, {}, { nodeType:['Server', 'Overlord', 'Worker']}),
        '↻ clients': j=> {
            var reloadmsg = messages.reloadMsg()
            var channelMsg = messages.channelMsg('Ws', reloadmsg)
            network.connections[0].send(channelMsg)
            j.ret('ok', 'reload message sent')
        }
    }
}
