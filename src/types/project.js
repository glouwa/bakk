function project(url)
{
    // PROJECT PART ----------------------------------------------------

    function instantiate(j)
    {        
        var job = rootJob({
            params: this.service.args,
            onCall: (j, params)=> this.service.src(j, params),
        })

        job.update({ isRoot:true })
        $('#jobTab')[0].add(job.id, { content:jobAllView(job) })
        j.ret('ok', 'job instanciated and view created')
    }

    function instantiate$run(j)
    {
        var job = rootJob({
            params: this.service.args,
            onCall: (j, params)=> this.service.src(j, params),
        })

        $('#jobTab')[0].add(job.id, { content:jobAllView(job) })
        j.delegateToOne({ job:()=> job })
    }

    // LAZYOBJECT PART -------------------------------------------------

    return {
        type: 'Project',
        '↻': function(j) // muss ein service sein wegen timeout ! nein, params.config narchträglich setzen!
        {
            var project = this

            j.delegateToOne({
                job: ()=> tj.ajaxJob({
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
                            '👁 j.args': instantiate,
                            '▸ j.src': instantiate$run
                        }))

                        $('#modelTab')[0].add(project.icon, { content:a3View(project) }, 'inBg')
                    }
                })
            })
        }
    }
}
