(function(exports)
{
    exports.type = {
        type:'Folder',
        icon:'📂',
        '↻':function(j) {
            j.params.directory = this.directory
            j.delegate(()=> jf.remoteProxyJob({            // delegate to remote
                icon: '📂',
                desc: 'delegate to server and list files',
                node: app.network['S₀'],
                args: j.params,
                realJob: js=> {

                    var dir = js.params.directory.valueOf()
                    fs.readdir(dir, (err, files)=> js.exception2localError('Message from FS', ()=> {
                        if (err)
                            throw new Error(err)
                        var folderDiff = {}, fileDiff = {}
                        files.forEach((v, k, idx)=> {
                            var directory = path.join(dir, v)
                            var internFileName = v.replace('.',':')
                            var internFilePath = path.join(dir, internFileName)

                            if (fs.statSync(directory).isDirectory())
                                folderDiff[internFileName] = {
                                    type:'Folder',
                                    directory:directory
                                }

                            else if (path.extname(directory) == '.js')
                                fileDiff[internFileName] = {
                                    type:'File<Mod>',
                                    contentType:'Mod',
                                    fileName:directory
                                }

                            else
                                fileDiff[internFileName] = {
                                    type:'File',
                                    contentType:path.extname(directory),
                                    fileName:directory
                                }
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
})
(typeof exports === 'undefined' ? this['Folder']={} : exports)
