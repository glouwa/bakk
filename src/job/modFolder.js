var ViewMod = {
    //icon:'💠',
    '↻':function(j) { this.io['↻₁'](j) }
}

var ModuleFolder = {
    type:'ViewSet',
    icon:'💠',
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
            onCall:j1=> this.io['↻₁'](j1)
        }),
        ()=> jf.job({
            icon:'📄',
            desc:'file contents',
            params:{},
            onCall:j1=>{
                //console.log('BINGO', j.output, j1)//j=> fetchAndIndexAllMods()
                var files = []
                var names = []
                      //io.
                j.output.forEach((v, k, idx)=> {
                    if (k.endsWith('View')) {
                        files.push(v)
                        names.push(k)
                    }
                })                               //.io
                var fileCount = files.length
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




