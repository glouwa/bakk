(function(exports)
{
    function file2ViewName(fn){
        var ff = fn.slice(fn.lastIndexOf('/')+1, fn.lastIndexOf('.'))
        var viewName1 = ff.slice(0, ff.lastIndexOf('-'))
        var viewName2 = ff.slice(ff.lastIndexOf('-')+1)
        return viewName1 + firstCharUpper(viewName2)
    }

    exports.io = {
        icon:'⇌',
        '↻₁':function(j) {
            j.delegate(()=> tj.ajaxJob({     // delegate to ajax
                url:this.addr.valueOf(),
                onData: (j, s, d)=> {

                    var parentPath = this.path.slice(0, this.path.lastIndexOf('.'))
                    var parentParentPath = parentPath.slice(0, parentPath.lastIndexOf('.'))

                    if(this.contentType != 'Mod'){
                       app.mergePath(parentPath, { serialized:d })
                    }

                    else{
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
                }
            }))
        }
    }

    exports.type = {
        type:'File',
        icon:'📄',
        '↻':function(j) { this.io['↻₁'](j) }
    }
})
(typeof exports === 'undefined' ? this['File']={} : exports)
