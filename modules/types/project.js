(function(exports)
{

exports.projectType = {
    type:'Project',
    icon:'📦',
    loadJob:function()
    {
        return tj.ajaxJob({
            url:this.url,
            onData: (j, s, d)=>
            {
                //if (!this['↻'])
//                    return

                var projectDiff = eval(d)

                if (projectDiff.types)
                    app.core.types.merge(projectDiff.types)

                if (projectDiff.views)
                    app.core.views.merge(projectDiff.views)

                if (projectDiff.instances)
                    app.merge(projectDiff.instances)

                this.merge(Object.assign(projectDiff, {
                  //  '↻':'deadbeef',
                    '✕': function(j) {},
                   /* '▸': function(j, diff, args) {
                        j.delegate(()=> this.runJob(args))  //instantiateAndRun(j, project),
                    },*/
                    '↕': function(j) { //⥯…
                        j.ret('failed', 'not imlpemented')
                    },
                    '⎇': function(j) {
                        j.ret('ok', 'not imlpemented: +1 idle job, +1 view')         // done
                    },
                    '⋯': function(j) {
                        app.model.viewModel.left.merge({ [this.jobPrototype.icon]:this })
                        //app.model.viewModel.left.active.merge(project)
                        j.ret('ok', '+1 project view')
                    }
                }))
            }
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
(typeof exports === 'undefined' ? this['project']={} : exports)
