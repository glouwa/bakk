function fragmentFolderSet()
{
    return {
        type:'Set<FragmentFolder>',
        '↻':function(j) {
            j.update({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.dir = this.dir

            j.delegateToOne({ job: ()=> jf.remoteProxyJob({
                node: network.server,
                args: j.params,
                realJob: js=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.dir.valueOf()

                    fs.readdir(dir, (err, files)=> js.exception2localError(()=> {

                        if (err) throw new Error(err)

                        var folderDiff = {}

                        files.forEach((v, k, idx)=> {
                            var subdir = path.join(dir, v)
                            if (fs.statSync(subdir).isDirectory())
                                folderDiff[v] = { type:'FragmentFolder', dir:subdir }
                        })

                        js.updateJob({ state:{ type:'running', log:'dir', progress:0.33 } }, folderDiff)
                        js.updateJob({ state:{ type:'running', log:'dir', progress:0.95 } }, { '↻':'deadbeef' })

                        js.ret('ok', 'listed ' + dir)
                    }))
                }
            })
        })},
        '⚙ all':function(j) {},
        '🗵 *.off':function(j) {},
        '🗵 *.obj':function(j) {},
        '*.off → *.obj':function(j) {},
        '*.obj → *.off':function(j) {}
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

            j.params.dir = this.dir

            j.delegateToOne({ job: ()=> jf.remoteProxyJob({
                node: network.server,
                args: j.params,
                realJob: js=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.dir.valueOf()

                    fs.readdir(dir, (err, files)=> js.exception2localError(()=> {
                        if (err) throw new Error(err)
                        var cmd = 'Preprocessing'

                        files.forEach((v, k, idx)=>
                        {
                            var subdir = path.join(dir, v)
                            if (!fs.statSync(subdir).isDirectory())
                                if (path.extname(v) == '.off' && v != 'output.off')
                                    cmd += ' ' + v
                        })

                        js.updateJob(
                            { state:{ type:'running', log:'dir', progress:0.95 } },
                            { cmd:cmd + ' output.off', '↻':'deadbeef' }
                        )
                        js.ret('ok', 'cmd generated: ' + cmd)
                    }))
                }
            })
        })},
        '⚙':function(j) {
            var job = rootJob({
                params: { dir:this.dir, cmd:this.cmd },
                onCall: j=> {

                    job.update({
                        state:{ progress:0.1, type:'running', log:'setting output reference' },
                        output:{}
                    })

                    j.updateJob(
                        { state:{ type:'running', log:'dir', progress:0.05 } },
                        j.params
                    )

                    j.delegateToOne({ job:()=> jf.remoteProxyJob({
                        node: network.server,
                        args: j.params,
                        realJob: js=> {
                            tj.exec(js,
                                js.params.cmd.valueOf(), //'shuf -i 0-0 -n 1 | xargs sleep',
                                (jw, data)=> jw.commitJob({ type:'running', progress:0.5, log:data }),
                                { cwd:js.params.dir.valueOf() }
                            )
                        }
                    })})
                }
            })

            $('#jobTab')[0].add(job.id, { content:jobAllView(job) })
            j.delegateToOne({ job:()=> job })
        }
    }
}

function insertFolder(j, diff)
{
    app.update(
        'model.store.'+j.id,
        { type:'Set<FragmentFolder>', dir:j.params.dir.valueOf() }
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
            dir: '../../data/fragmented/',
            config: { timeout:500 }
        },
    },
    types: {
        fragmentFolderSet: fragmentFolderSet(),
        fragmentFolder: fragmentFolder()
    },
    tests: []
})
