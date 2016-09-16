function fragmentFolderSet()
{
    return {
        type:'Set<FragmentFolder>',
        '↻':function(j) {
            j.merge({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.dir = this.dir

            j.delegate(()=> jf.remoteProxyJob({
                icon: '💢',
                node: network.connections[0],
                args: j.params,
                realJob: js=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.dir.valueOf()

                    fs.readdir(dir, (err, files)=> js.exception2localError('Message from FS', ()=> {

                        if (err) throw new Error(err)

                        var folderDiff = {}

                        files.forEach((v, k, idx)=> {
                            var subdir = path.join(dir, v)
                            if (fs.statSync(subdir).isDirectory())
                                folderDiff[v] = { type:'FragmentFolder', dir:subdir }
                        })

                        js.updateJob({ state:{ type:'running', log:'dir', progress:0.33 }, output:folderDiff })
                        js.updateJob({ state:{ type:'running', log:'dir', progress:0.95 }, output:{ '↻':'deadbeef' }})

                        js.ret('ok', 'listed ' + dir)
                    }))
                }
            })
        )},
        '⚙':function(j) {},
        '☠ off':function(j) {},
        '☠ obj':function(j) {},
        'off → obj':function(j) {},
        'obj → off':function(j) {}
    }
}

function fragmentFolder()
{
    return {
        type:'FragmentFolder',
        '↻':function(j) {
            j.merge({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.dir = this.dir

            j.delegate(()=> jf.remoteProxyJob({                
                node: network.connections[0],
                args: j.params,
                realJob: js=> {
                    var fs = require('fs')
                    var path = require('path')
                    var dir = js.params.dir.valueOf()

                    fs.readdir(dir, (err, files)=> js.exception2localError('Message from FS', ()=> {
                        if (err) throw new Error(err)
                        var cmd = 'Preprocessing'

                        files.forEach((v, k, idx)=>
                        {
                            var subdir = path.join(dir, v)
                            if (!fs.statSync(subdir).isDirectory())
                                if (path.extname(v) == '.off' && v != 'output.off')
                                    cmd += ' ' + v
                        })

                        js.updateJob({
                            state:{
                                type:'running',
                                log:'dir',
                                progress:0.95
                            },
                            output:{
                                '↻':'deadbeef',
                                 cmd:cmd + ' output.off',
                                 '⚙':function(j) {} // todo: wir sind hier am server!
                            }
                        })
                        js.ret('ok', 'cmd generated: ' + cmd)
                    }))
                }
            })
        )}
    }
}

function insertFolder(j, diff)
{
    app.mergePath(
        'model.store.'+j.id,
        { type:'Set<FragmentFolder>', dir:j.params.dir.valueOf() }
    )

    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output:app.model.store[j.id.valueOf()]
    })

    j.delegate(()=> jf.job({ icon:'↻', onCall:lj=> app.model.store[j.id.valueOf()]['↻'](lj), params:{} }))
}

new Object({
    type: 'Project',
    icon: '💢',
    desc: 'Show fragment folder',
    service: {
        type: 'Service',
        src: insertFolder,
        args: {
            dir: 'data/fragmented/',
            timeout:500
        },
    },
    types: {
        fragmentFolderSet: fragmentFolderSet(),
        fragmentFolder: fragmentFolder()
    },
    tests: []
})
