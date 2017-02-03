(function(exports)
{


    exports.io = {
        icon:'⇌',
        '↻₁':function(j) {
            j.params.directory = this.addr
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
                                    io:{
                                        type:'IO<Folder>',
                                        addr:directory
                                    }
                                }

                            else if (directory.endsWith('View.js')) {

                                function file2ViewName(fn){
                                    function firstCharUpper(name){
                                        var nameStr = name.toString()
                                        return nameStr.charAt(0).toUpperCase() + nameStr.slice(1)
                                    }
                                    var ff = fn.slice(fn.lastIndexOf('/')+1, fn.lastIndexOf('.'))
                                    var viewName1 = ff.slice(0, ff.lastIndexOf('-'))
                                    var viewName2 = ff.slice(ff.lastIndexOf('-')+1)
                                    return viewName1 + firstCharUpper(viewName2)
                                }

                                fileDiff[file2ViewName(directory)] = {
                                    type:'View',
                                    io:{
                                        type:'IO<Ajax>',
                                        contentType:'Mod',
                                        addr:directory
                                    }
                                }
                            }
                            else
                                fileDiff[internFileName] = {
                                    type:'File',
                                    io:{
                                        type:'IO<Ajax>',
                                        contentType:path.extname(directory),
                                        addr:directory
                                    }
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

    exports.type = {
        type:'Folder',
        icon:'📂',
        '↻':function(j) { this.io['↻₁'](j) }
    }
})
(typeof exports === 'undefined' ? this['Folder']={} : exports)
