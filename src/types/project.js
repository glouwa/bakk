function project(url)
{
    // PROJECT PART ----------------------------------------------------

    function createRootJob(project)
    {
        return rootJob({                                      // create job inst
            params: project.service.args,
            onCall: (j, params)=> project.service.src(j, params),
        })
    }

    function instantiateAndRun(j, project)
    {
        var job = createRootJob(project)
        $('#jobTab')[0].add(job.id, { content:jobAllView(job) }/*, 'inBg'*/) // show
        j.delegateToOne({ job:()=> job })                        // start
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

                if (projectDiff.views)
                    app.model.registry.views.update(projectDiff.views)

                project.update(Object.assign(projectDiff, {
                    '↻':'deadbeef',
                    '✕': function free(j) {},
                    '▸': j=> instantiateAndRun(j, project),
                    '⇱': function(j) //⥯…
                    {
                        j.ret('failed', 'not imlpemented')
                    },
                    '✎': function(j)
                    {
                        $('#modelTab')[0].add(project.icon, { content:a3View(project) }/*, 'inBg'*/)
                        j.ret('ok', 'project edit view in new tab opened')
                    },
                    '⇨': function(j) //…
                    {
                        var job = createRootJob(project)
                        job.update({ isRoot:true })
                        $('#jobTab')[0].add(job.id, { content:jobAllView(job) }) // show
                        j.ret('ok', 'job instanciated and view created')         // done
                    },

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
                ()=> jf.job({ onCall: ij=> instantiateAndRun(ij, this) })
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
