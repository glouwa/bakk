function folderPrototype()
{
    return {
        type:'Folder',
        '↻':function(j) {
            j.update({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.directory = this.directory

            j.delegate(()=> jf.remoteProxyJob({
                node: network.connections[0],
                args: j.params,
                realJob: (js, diff)=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.directory.valueOf()

                    fs.readdir(
                        dir,
                        (err, files)=> js.exception2localError('Message from FS', ()=>
                        {
                            if (err) throw new Error(err)

                            var folderDiff = {}, fileDiff = {}

                            files.forEach((v, k, idx)=> {

                                var directory = path.join(dir, v)

                                if (fs.statSync(directory).isDirectory())
                                    folderDiff[v] = { type:'Folder', directory:directory }

                                else
                                    fileDiff[v] = { type:'File' }
                            })

                            js.updateJob({ state:{ type:'running', log:'dir', progress:0.33 } }, folderDiff)
                            js.updateJob({ state:{ type:'running', log:'dir', progress:0.66 } }, fileDiff)
                            js.updateJob({ state:{ type:'running', log:'dir', progress:0.95 } }, {'↻':'deadbeef'})

                            js.ret('ok', 'listed ' + dir)
                        })
                    )
                }
            })
        )}
    }
}

function insertFolder(j, diff)
{
    app.update('model.store.'+j.id, { type:'Folder', directory:j.params.directory.valueOf() })

    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: app.model.store[j.id.valueOf()]
    })

    j.delegate(()=> jf.job({ onCall:lj=> app.model.store[j.id.valueOf()]['↻'](lj), params:{} }))
}

new Object({
    type: 'Project',
    icon: '⤑📂',
    desc: 'Show folder',
    service: {
        type: 'Service',
        src: insertFolder,
        args: {
            directory: '../../..',
            timeout:500
        },
    },
    types: {
        folder: folderPrototype()
    },
    tests: []
})
