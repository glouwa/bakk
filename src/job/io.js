(function(exports)
{
    function file2ViewName(fn){
        var ff = fn.slice(fn.lastIndexOf('/')+1, fn.lastIndexOf('.'))
        var viewName1 = ff.slice(0, ff.lastIndexOf('-'))
        var viewName2 = ff.slice(ff.lastIndexOf('-')+1)
        return viewName1 + firstCharUpper(viewName2)
    }


    function registerType(){

    }

    function registerJob(){

    }

    function registerView(){

    }

    exports.File = {
        icon:'⇌',
        '↻₁':function(j) {
            j.delegate(()=> tj.ajaxJob({     // delegate to ajax
                url:this.addr.valueOf(),
                onData: (j, s, d)=> {

                    var parentPath = this.path.slice(0, this.path.lastIndexOf('.'))
                    var parentParentPath = parentPath.slice(0, parentPath.lastIndexOf('.'))

                    if(this.contentType == 'Mod'){
                        var view = eval('('+d+')')
                        var viewName = file2ViewName(this.addr.valueOf())
                        app.mergePath(parentPath, view)
                        var boxedView = mvj.traverse(parentPath, app)
                        view.modelTypes.forEach((v, k, idx)=>
                            app.mergePath(parentParentPath, {
                                    index:{
                                        [v]:{
                                            [view.idx|0]:boxedView
                                        }
                                    }
                                }
                            )
                        )
                    }

                    else if(this.contentType == 'JobMod'){
                        var projectDiff = eval(d)

                        if (projectDiff.types)
                            app.types.merge(projectDiff.types)

                        if (projectDiff.views)
                            app.viewTypes.merge(projectDiff.views)

                        if (projectDiff.instances)
                            app.merge(projectDiff.instances)

                        app.mergePath(parentPath, Object.assign(projectDiff, {
                            //  '↻':'deadbeef',
                            '✕': function(j) {},
                           /* '▸': function(j, diff, args) {
                                j.delegate(()=> this.runJob(args))  //instantiateAndRun(j, project),
                            },*/
                            '↕': function(j) { j.ret('failed', 'not imlpemented') },
                            '⎇': function(j) { j.ret('ok', 'not imlpemented: +1 idle job, +1 view') },
                            '⋯': function(j) {
                                app.viewModel.left.merge({ [this.jobPrototype.icon]:this })
                                //app.viewModel.left.active.merge(project)
                                j.ret('ok', '+1 project view')
                            }
                        }))
                    }

                    else
                        app.mergePath(parentPath, { serialized:d })
                }
            }))
        }
    }

    exports.Folder = {
        icon:'⇌',
        '↻₁':function(j) {
            j.params.directory = this.addr
            j.params.jsFormat = this.contentType
            j.delegate(()=> jf.remoteProxyJob({            // delegate to remote
                icon: '📂',
                desc: 'delegate to server and list files',
                node: app.ios.hcsw['S₀'],
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

                            else if (js.params.jsFormat == 'JobMod' && directory.endsWith('.js')){
                                var jobName = path.basename(directory).slice(0, -3)
                                fileDiff[jobName] = {
                                    type:'Project',
                                    io:{
                                        type:'IO<Ajax>',
                                        contentType:'JobMod',
                                        addr:directory
                                    }
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
})
(typeof exports === 'undefined' ? this['IO']={} : exports)
