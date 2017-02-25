function fragmentFolderSet()
{
    return {
        type:'FragmentFolderSet',
        '↻':function(j) {
            j.merge({
                state:{ progress:0.1, type:'running', log:'setting output reference' },
                output:this
            })

            j.params.dir = this.dir

            j.delegate(()=> jf.remoteProxyJob({
                icon: '💢',
                node: app.ios.hcsw['S₀'],
                args: j.params,
                realJob: js=> {

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
                node: app.ios.hcsw['S₀'],
                args: j.params,
                realJob: js=> {

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
    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output:{ type:'FragmentFolderSet', dir:j.params.dir.valueOf() }
    })

    j.delegate(()=> jf.job({
        icon:'↻',
        params:{},
        onCall:lj=> j.output['↻'](lj)
    }))
}

new Object({
    type: 'Project',    
    jobPrototype: {
        type: 'JobPrototype',
        icon: '💢',
        desc: 'Show fragment folder',
        onCall: insertFolder,
        args: {
            dir: 'data/fragmented/',
            timeout:500
        },
    },
    types: {
        FragmentFolderSet: fragmentFolderSet(),
        FragmentFolder: fragmentFolder()
    },
    tests: []
})
