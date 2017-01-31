var FileMod = {
    type:'File<Mod>',
    icon:'📄',
    '↻':function(j) { j.delegate(()=> tj.ajaxJob({     // delegate to ajax
        url:this.fileName.valueOf(),
        onData: (j, s, d)=> {                         // eval ajaxdata and add to model
            var view = eval('('+d+')')

            this.merge({ obj:view })
            var boxed = this.obj

            var f = this.fileName.valueOf()
            var ff = f.slice(f.lastIndexOf('/')+1, f.lastIndexOf('.'))
            var viewName1 = ff.slice(0, ff.lastIndexOf('-'))
            var viewName2 = ff.slice(ff.lastIndexOf('-')+1)
            var viewName = viewName1 + firstCharUpper(viewName2)

            var parent = this.path.slice(0, this.path.lastIndexOf('.'))
                parent = parent.slice(0, parent.lastIndexOf('.'))
            view.modelTypes.forEach((v, k, idx)=> {
                var idx = boxed.idx | 0
                app.mergePath(parent+'.index', { [v]: { [idx]:boxed } })
                app.mergePath(parent+'.'+viewName, boxed)
            })
        }
    }))}
}

var ModuleFolder = {
    type:'Folder<Mod>',
    icon:'📂',
    queryAll:function(type, idx){

        result = []
        if (!this.index[type] || type == 'object')
            return result

        this.index[type].forEach((v,k,i)=> result.push(v))
        return result
    },
    queryByType:function(type, idx){

        if (!this.index[type])
            type = 'object'

        return this.index[type][idx|0]
    },
    query:function(type, idx){

        if (!this.index[type])
            type = 'object'

        return this.index[type][idx|0].ctor
    },
    '↻':function(j) { j.delegate(
        ()=> jf.job({
            icon:'☰',
            desc:'load file list',
            params:{},
            onCall:j1=>{
                j1.params.directory = this.directory
                j1.delegate(()=> jf.remoteProxyJob({            // delegate to remote
                    icon: '📂',
                    desc: 'delegate to server and list files',
                    node: app.network['S₀'],
                    args: j1.params,
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
                            js.updateJob({ state:{ log:'dirs',  progress:0.33 }, output:{ io:folderDiff}})
                            js.updateJob({ state:{ log:'files', progress:0.66 }, output:{ io:fileDiff}})
                            js.updateJob({ state:{ log:'hmm',   progress:0.95 }, output:{'↻':'deadbeef'}})
                            js.ret('ok', 'listed ' + dir)
                        }))
                    }
                })
            )}
        }),
        ()=> jf.job({
            icon:'📄',
            desc:'file contents',
            params:{},
            onCall:j1=>{
                //console.log('BINGO', j.output, j1)//j=> fetchAndIndexAllMods()
                var files = []
                var names = []
                j.output.io.forEach((v, k, idx)=> {
                    if (k.endsWith(':js')) {
                        files.push(v)
                        names.push(k)
                    }
                })
                var fileCount = Object.keys(j.output.io).length
                //console.log(files)
                j1.delegate({
                    type: 'parallel',
                    end: idx=> idx < files.length,
                    job: idx=> jf.job({
                        icon:'+',
                        desc:names[idx]+'load and add to idx',
                        onCall:j2=> files[idx]['↻'](j2)
                        })
                    })
                }
            }
        )
    )}
}




