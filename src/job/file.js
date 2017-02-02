(function(exports)
{
    exports.type = {
        type:'File',
        icon:'📄',
        '↻':function(j) {
            j.delegate(()=> tj.ajaxJob({     // delegate to ajax
                url:this.fileName.valueOf(),
                onData: (j, s, d)=> this.merge({ serialized:d })

            }))
        }
    }
})
(typeof exports === 'undefined' ? this['File']={} : exports)
