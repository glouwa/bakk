function project(url, noView)
{
    // PROJECT PART ----------------------------------------------------

    function pepRootJob(project)
    {
        return rootJob({
            desc:project.desc, // create job inst
            params: project.service.args,
            onCall: (j, params)=> project.service.src(j, params),
        })
    }

    function visiblePepRootJob(project)
    {
        var job = pepRootJob(project)
        if (!noView) $('#jobTab')[0].add(job.id, { content:jobAllView(job) }/*, 'inBg'*/) // show
        //j.delegateToOne({ job:()=> job })                        // start
        return job
    }

    // LAZYOBJECT PART -------------------------------------------------

    function ajaxLoadJob(project)
    {
        return tj.ajaxJob({
            url: url,
            onData: (j, s, d)=>
            {
                var projectDiff = eval(d)

                if (projectDiff.types)
                    app.model.registry.types.update(projectDiff.types)

                if (projectDiff.views && !noView)
                    app.model.registry.views.update(projectDiff.views)

                project.update(Object.assign(projectDiff, {
                    '↻':'deadbeef',
                    '✕': function(j) {},
                    '▸': function(j)
                    {
                        j.delegateToOne({ job:()=> visiblePepRootJob(project) })  //instantiateAndRun(j, project),
                    },
                    '⇱': function(j) //⥯…
                    {
                        j.ret('failed', 'not imlpemented')
                    },
                    '✎': function(j)
                    {
                        $('#modelTab')[0].add(project.icon, { content:a3View(project) }/*, 'inBg'*/)
                        j.ret('ok', '+1 project view')
                    },
                    '⇨': function(j) //…
                    {
                        var job = pepRootJob(project)
                        job.update({ isRoot:true })
                        $('#jobTab')[0].add(job.id, { content:jobAllView(job) }) // show
                        j.ret('ok', '+1 idle job, +1 view')         // done
                    }
                }))
            }
        })
    }

    return {
        type: 'Project',
        '▸': function(j)
        {
            j.delegateToSequence(
                ()=> ajaxLoadJob(this),
                ()=> jf.job({ onCall:j=> j.delegateToOne({ job:()=> visiblePepRootJob(this) }) })
                //()=> visiblePepRootJob(this) // todo: fix the sync bug to use this line
            )
        },
        '↻': function(j)
        {
            j.delegateToOne({
                job: ()=> ajaxLoadJob(this)
            })
        }
    }
}
