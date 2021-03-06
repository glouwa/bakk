/*var folderPrototype = {
    type:'Folder',
    '↻':function(j) {
        j.params.directory = this.directory
        j.delegate(()=> jf.remoteProxyJob({
            icon: '📂',
            desc: 'delegate to server and list files',
            node: app.ios.hcsw['S₀'],
            args: j.params,
            realJob: js=> {

                var fs = require('fs')
                var path = require('path')
                var dir = js.params.directory.valueOf()
                fs.readdir(dir, (err, files)=> js.exception2localError('Message from FS', ()=> {
                    if (err) throw new Error(err)
                    var folderDiff = {}, fileDiff = {}
                    files.forEach((v, k, idx)=> {
                        var directory = path.join(dir, v)
                        if (fs.statSync(directory).isDirectory())
                            folderDiff[v] = { type:'Folder', directory:directory }
                        else
                            fileDiff[v] = { type:'File' }
                    })
                    js.updateJob({ state:{ log:'dir', progress:0.33 }, output:folderDiff})
                    js.updateJob({ state:{ log:'dir', progress:0.66 }, output:fileDiff})
                    js.updateJob({ state:{ log:'dir', progress:0.95 }, output:{'↻':'deadbeef'}})
                    js.ret('ok', 'listed ' + dir)
                }))
            }
        })
    )}
}*/

var Folder = {
    type:'Folder',
    index:{},
    query:function(type){
        return parent[type].ctor
    },
    '↻':function(j) {
        j.params.directory = this.directory
        j.delegate(()=> jf.remoteProxyJob({            // delegate to remote
            icon: '📂',
            desc: 'delegate to server and list files',
            node: app.ios.hcsw['S₀'],
            args: j.params,
            realJob: js=> {

                var dir = js.params.directory.valueOf()
                fs.readdir(dir, (err, files)=> js.exception2localError('Message from FS', ()=> {
                    if (err) throw new Error(err)
                    var folderDiff = {}, fileDiff = {}
                    files.forEach((v, k, idx)=> {
                        var directory = path.join(dir, v)
                        var internFileName = v.replace('.',':')
                        var internFilePath = path.join(dir, internFileName)

                        if (fs.statSync(directory).isDirectory())
                            folderDiff[internFileName] = { type:'Folder', directory:directory }

                        else if (path.extname(directory) == '.js')
                            fileDiff[internFileName] = { type:'File<Mod>', fileName:directory }

                        else
                            fileDiff[internFileName] = { type:'File', fileName:internFilePath }
                    })
                    js.updateJob({ state:{ log:'dir', progress:0.33 }, output:folderDiff})
                    js.updateJob({ state:{ log:'dir', progress:0.66 }, output:fileDiff})
                    js.updateJob({ state:{ log:'dir', progress:0.95 }, output:{'↻':'deadbeef'}})
                    js.ret('ok', 'listed ' + dir)
                }))
            }
        })
    )}
}


function createAndLoadFolder(j)
{
    j.merge({
        state:{ progress:0.1, log:'setting output reference' },
        output: { type:'Folder', directory:j.params.directory.valueOf() }
    })

    j.delegate(()=> jf.job({
        icon: '↻',
        params:{},
        onCall:lj=> j.output['↻'](lj)
    }))
}

new Object({
    type: 'Project',    
    jobPrototype: {
        type: 'JobPrototype',
        icon: '📂',
        desc: 'Show folder',
        onCall: createAndLoadFolder,
        args: {
            directory: './',
            timeout:500
        },
    },
    types: {
        Folder:Folder
    },
    instances: {
        serverFs:{ type:'Folder', directory:'./' }
    },
    tests: []
})
