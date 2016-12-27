var Folder = {
    type:'Folder',
    '↻':function(j) {
        j.params.directory = this.directory
        j.delegate(()=> jf.remoteProxyJob({
            icon: '📂',
            desc: 'delegate to server and list files',
            node: network.connections[0],
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
                            fileDiff[v] = { type:'File', fileName:directory }
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
