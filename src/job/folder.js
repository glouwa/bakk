var ViewSet = {
    type:'ViewSet',
    //index:{},//ViewIndex(Folder('./modules/views/html/primitive/'))
    query:function(type){
        return index[type].ctor
    }
}

var FileMod = {
    type:'File<Mod>',
    '↻':function(j){ j.delegate(()=> tj.ajaxJob({     // delegate to ajax
        url:this.fileName.valueOf(),
        onData: (j, s, d)=> {                         // eval ajaxdata and add to model
            var view = eval('('+d+')')
            this.merge({ obj:view })

            var boxed = this.obj

            // addto index
            app.registry.views.primitiveBound.index.merge({[view.modelTypes]:boxed})
        }
    }))}
}

var remoteFolderListToThisOutput = function(j, d) {
    j.params.directory = d//this.directory
    j.delegate(()=> jf.remoteProxyJob({            // delegate to remote
        icon: '📂',
        desc: 'delegate to server and list files',
        node: app.network['S₀'],
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
                    var internFileName = v.replace('.',':')
                    var internFilePath = path.join(dir, internFileName)

                    if (fs.statSync(directory).isDirectory())
                        folderDiff[internFileName] = { type:'Folder', directory:directory }

                    else if (path.extname(directory) == '.jso')
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

var ModuleFolder = {
    type:'Folder<Mod>',
    index:{},
    query:function(type){
        if (!this.index[type])
            return this.index['object'].ctor
        return this.index[type].ctor
    },
    '↻':function(j) { j.delegate(
        ()=> jf.job({
            icon:'≟',
            desc:'load file list',
            params:{},
            onCall:j1=>remoteFolderListToThisOutput(j1, this.directory)
        }),
        ()=> jf.job({
            icon:'≟',
            desc:'file contents',
            params:{},
            onCall:j1=>{
                //console.log('BINGO', j.output, j1)//j=> fetchAndIndexAllMods()
                var files = []
                var names = []
                j.output.forEach((v, k, idx)=> {
                    if (k.endsWith(':jso')) {
                        files.push(v)
                        names.push(k)
                    }
                })
                var fileCount = Object.keys(j.output).length
                //console.log(files)
                j1.delegate({
                    type: 'parallel',
                    end: idx=> idx < files.length,
                    job: idx=> jf.job({
                        icon: names[idx],
                        desc:'load and add to idx',
                        onCall:j2=> files[idx]['↻'](j2)
                        })
                    })
                }
            }
        )
    )}
}



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
            node: app.network['S₀'],
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
                        var internFileName = v.replace('.',':')
                        var internFilePath = path.join(dir, internFileName)

                        if (fs.statSync(directory).isDirectory())
                            folderDiff[internFileName] = { type:'Folder', directory:directory }

                        else if (path.extname(directory) == '.jso')
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
