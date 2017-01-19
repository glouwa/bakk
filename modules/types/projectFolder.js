(function(exports)
{

function project(url, noView)
{
    // PROJECT PART ----------------------------------------------------

    function projectJob(p, args)
    {
        return jf.job({
            icon:   p.icon,
            desc:   p.desc,
            params: args?args:p.jobPrototype.args,
            onCall: j=> p.jobPrototype.onCall(j),
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
                    app.core.types.merge(projectDiff.types)

                if (projectDiff.views && !noView)
                    app.core.views.merge(projectDiff.views)

                project.merge(Object.assign(projectDiff, {
                    '↻':'deadbeef',
                    '✕': function(j) {},
                    '▸': function(j, diff, args) {
                        j.delegate(()=> projectJob(project, args))  //instantiateAndRun(j, project),
                    },
                    '↕': function(j) { //⥯…
                        j.ret('failed', 'not imlpemented')
                    },
                    '⎇': function(j) { //…
                        //new job = projectJob(project)
                        //$('#jobTab')[0].add(project.icon, { content:a3View(newJob) }/*, 'inBg'*/)
                        j.ret('ok', '+1 idle job, +1 view')         // done
                    },
                    '⋯': function(j) {
                        $('#modelTab')[0].add(project.jobPrototype.icon, {
                            content:app.core.views.a4v.query('object')(project)
                        }/*, 'inBg'*/)
                        j.ret('ok', '+1 project view')
                    }
                }))
            }
        })
    }

    return {
        type: 'Project',
        '▸': function(j, diff, args) {
            j.delegate(
                ()=> ajaxLoadJob(this),
                ()=> projectJob(this, args)
            )
        },
        '↻': function(j) {
            j.delegate(()=> ajaxLoadJob(this))
        }
    }
}

exports.create = function projectFolder() { return {
    //type:'Set<Project>',
    '↻': function(j) {
        this.merge({
            '↻': 'deadbeef',
            'demos': {
                '🐼 Process fracturing folder on workers':    project('modules/jobs/workerBacc0.js'),
                '❄ Find similar 3d models on worker':        project('modules/jobs/workerModel3d.js'),
                'ℙ Find prime numbers with C++ on workers':  project('modules/jobs/workerPrimeCpp.js'),
                '💻 server cmd':                              project('modules/jobs/serverCmd.js'),
                '📂 server folder':                           project('modules/jobs/serverFolder.js'),
            },
            'lib': {
                //type:'Set<Project>',
                '✕': function free(j) {},
                '🖥 Start workers':                       project('modules/jobs/overlordWorkers.js'),
                '☠ Kill all':                            project('modules/jobs/workerKill.js'),
            },           
            'tests': {
                //type:'Set<Project>',
                // TODO: lazy(project(...))  : lazy wrapet alle members von project
                '🐼 Process fracturing folder on workers':    project('modules/jobs/workerBacc0.js'),
                '🐁 Process empty jobs on worker':            project('modules/jobs/workerBacc1.js'),
                '🦁 Find similar 3d models on worker':        project('modules/jobs/workerModel3d.js'),
                'ℙ Find prime numbers with C++ on workers':  project('modules/jobs/workerPrimeCpp.js'),
                '💢 server fragment folder':                  project('modules/jobs/serverFragmentFolder.js'),
                '💻 server cmd':                              project('modules/jobs/serverCmd.js'),
                '📂 server folder':                           project('modules/jobs/serverFolder.js'),
                '🗩 server output':                           project('modules/jobs/serverOutput.js'),
                '❄ local find 3d models':                    project('modules/jobs/localSetIteration.js'),
                '🔃 local paralell AJAX':                     project('modules/jobs/localAjax.js'),
                '🗩 local output':                            project('modules/jobs/localOutput.js'),
                '🗩 serevr output 2':                         project('modules/jobs/serverOutput2.js'),
                '✕': function free(j) {},
                '▸': function run(j) {
                    // this =  tests
                    //var projectMembers = this.filter(i=> i.type == 'project')

                    //$('#jobTab')[0].add(j.id, { content:jobAllView(j) } )

                    var projectMembers = [
                        this['💻 server cmd'],
                        this['📂 server folder'],
                        this['🗩 server output'],
                        this['🔃 local paralell AJAX'],
                        this['🗩 local output'],
                        this['🐼 Process fracturing folder on workers'],
                        this['🐁 Process empty jobs on worker'],
                        this['🦁 Find similar 3d models on worker'],
                        this['ℙ Find prime numbers with C++ on workers'],
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
            },
        })
        j.ret('ok', '+11 projects')
    }
}}


})
(typeof exports === 'undefined' ? this['projectFolder']={} : exports)
