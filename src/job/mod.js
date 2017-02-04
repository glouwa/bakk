(function(exports)
{
    exports.ViewMod = {
        //icon:'💠',
        '↻':function(j) { this.io['↻₁'](j) }
    }

    exports.ViewModSet = {
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

    exports.ModSet = {
        '↻':function(j) { this.io['↻₁'](j) },
        '▸': function run(j) {
            // this =  tests
            //var projectMembers = this.filter(i=> i.type == 'project')

            var projectMembers = [
                this['Local - Ajax'],
                this['Local - Output'],
                this['Local - SetIteration'],
                this['Server - Cmd'],
                this['Server - Output'],
                //this['Server - Output2'],
                this['Worker - 3dModel Search'],
                this['Worker - Paralell Processes'],
                this['Worker - Pooled Processes'],
            ]

            j.updateJob({ state:{}}, projectMembers)

            var pjobs = projectMembers.map(i=> {
                //return ()=> jf.job({ params:i.jobPrototype.args, onCall:i.jobPrototype.src })
                return ()=> jf.job({
                    desc:i.desc,
                    //args:
                    onCall: j=> i['▸'](j),
                })
            })
            j.updateJob({ state:{}}, pjobs)
            j.delegate({ type:'sequence', job:pjobs })
            //j.delegateToSequence(projectMembers.map(i=> new Job(i))
        },
    }

    exports.Mod = {
        type:'Project',
        icon:'📦',
        loadJob:function()
        {
            return jf.job({
                icon:'aaa',
                desc:'glue',
                params:{},
                onCall: j=> this.io['↻₁'](j),
            })
        },
        runJob:function(args)
        {
            return jf.job({
                icon:   this.icon,
                desc:   this.desc,
                params: args ? args : this.jobPrototype.args,
                onCall: j=> this.jobPrototype.onCall(j),
            })
        },
        '▸':function(j, diff, args) {
            j.delegate(
                ()=> this.loadJob(),
                ()=> this.runJob(args)
            )
        },
        '↻':function(j) {
            j.delegate(()=> this.loadJob())
        }
    }
})
(typeof exports === 'undefined' ? this['Mod']={} : exports)
