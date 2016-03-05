function fragmentFolderSet()
{
    return {
        type:'Set<FragmentFolder>',
        '↻':function(j) {
            j.update({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.directory = this.directory

            j.delegateToOne({ job: ()=> jf.remoteProxyJob({
                node: network.server,
                args: j.params,
                realJob: (js, diff)=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.directory.valueOf()

                    fs.readdir(dir, (err, files)=> js.exception2localError(()=> {
                        if (err) throw new Error(err)
                        var folderDiff = {}

                        files.forEach((v, k, idx)=> {
                            var directory = path.join(dir, v)
                            if (fs.statSync(directory).isDirectory())
                                folderDiff[v] = { type:'FragmentFolder', directory:directory }
                        })

                        js.updateJob({ state:{ type:'running', log:'dir', progress:0.33 } }, folderDiff)
                        js.updateJob({ state:{ type:'running', log:'dir', progress:0.95 } }, {'↻':'deadbeef'})

                        js.ret('ok', 'listed ' + dir)
                    }))
                }
            })
        })},
        '⛁':function(j) {
            j.ret('ok', 'gerneated output')
        }
    }
}

function fragmentFolder()
{
    return {
        type:'FragmentFolder',
        '↻':function(j) {
            j.update({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.directory = this.directory

            j.delegateToOne({ job: ()=> jf.remoteProxyJob({
                node: network.server,
                args: j.params,
                realJob: (js, diff)=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.directory.valueOf()

                    fs.readdir(dir, (err, files)=> js.exception2localError(()=> {
                        if (err) throw new Error(err)
                        var cmd = 'anycommand'

                        files.forEach((v, k, idx)=> {
                            var directory = path.join(dir, v)
                            if (!fs.statSync(directory).isDirectory())
                                if (v != 'output.off')
                                    cmd += ' ' + v
                        })

                        js.updateJob(
                            { state:{ type:'running', log:'dir', progress:0.95 } },
                            { cmd:cmd, '↻':'deadbeef' }
                        )
                        js.ret('ok', 'cmd generated: ' + cmd)
                    }))
                }
            })
        })},
        '⛁':function(j) { //   ⟪ sdfs ⟫
            j.ret('ok', 'gerneated output')
        }
    }
}

function insertFolder(j, diff)
{
    app.update(
        'model.store.'+j.id,
        { type:'Set<FragmentFolder>', directory:j.params.directory.valueOf() }
    )

    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output:app.model.store[j.id.valueOf()]
    })

    j.delegateToOne({
        job:()=> jf.job({ onCall:lj=> app.model.store[j.id.valueOf()]['↻'](lj), params:{} })
    })
}

new Object({
    type: 'Project',
    icon: '⤑💢',
    desc: 'Show fragment folder',
    service: {
        type: 'Service',
        src: insertFolder,
        args: {
            directory: '../../data/fragmented/',
            config: { timeout:500 }
        },
    },
    types: {
        fragmentFolderSet: fragmentFolderSet(),
        fragmentFolder: fragmentFolder()
    },
    tests: []
})
