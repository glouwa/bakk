(function(exports)
{
    exports.type = {
        type:'File',
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
})
(typeof exports === 'undefined' ? this['File']={} : exports)
