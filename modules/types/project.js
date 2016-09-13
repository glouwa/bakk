function project(url, noView)
{
    // PROJECT PART ----------------------------------------------------

    function projectJob(p, args)
    {     
        return jf.job({
            desc:   p.desc,
            params: args?args:p.service.args,
            onCall: (j, params)=> p.service.src(j, params),
        })
    }

    // LAZYOBJECT PART -------------------------------------------------

    function ajaxLoadJob(project)
    {
        return tj.ajaxJob({
            url: url,
            onData: (j, s, d)=>
            {
                if (!project['↻'])
                    return

                var projectDiff = eval(d)

                if (projectDiff.types)
                    app.model.registry.types.merge(projectDiff.types)

                if (projectDiff.views && !noView)
                    app.model.registry.views.merge(projectDiff.views)

                project.merge(Object.assign(projectDiff, {
                    '↻':'deadbeef',
                    '✕': function(j) {},
                    '▸': function(j, diff, args)
                    {
                        j.delegate(()=> projectJob(project, args))  //instantiateAndRun(j, project),
                    },
                    '↕': function(j) //⥯…
                    {
                        j.ret('failed', 'not imlpemented')
                    },                    
                    '⎇': function(j) //…
                    {
                        //new job = projectJob(project)
                        //$('#jobTab')[0].add(project.icon, { content:a3View(newJob) }/*, 'inBg'*/)
                        j.ret('ok', '+1 idle job, +1 view')         // done
                    },
                    '⋯': function(j)
                    {
                        $('#modelTab')[0].add(project.icon, { content:a3View(project) }/*, 'inBg'*/)
                        j.ret('ok', '+1 project view')
                    }
                }))
            }
        })
    }

    return {
        type: 'Project',
        '▸': function(j, diff, args)
        {
            j.delegate(
                ()=> ajaxLoadJob(this),
                ()=> projectJob(this, args)
            )
        },
        '↻': function(j)
        {
            j.delegate(()=> ajaxLoadJob(this))
        }
    }
}
