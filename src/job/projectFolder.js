(function(exports)
{
exports.stat = {
    'demos': {
        '🐼 Process fracturing folder on workers':    { type:'Project', url:'modules/jobs/workerBacc0.js' },
        '❄ Find similar 3d models on worker':        { type:'Project', url:'modules/jobs/workerModel3d.js'},
        'ℙ Find prime numbers with C++ on workers':  { type:'Project', url:'modules/jobs/workerPrimeCpp.js'},
        '💻 server cmd':                              { type:'Project', url:'modules/jobs/serverCmd.js'},
        '📂 server folder':                           { type:'Project', url:'modules/jobs/serverFolder.js'},
    },
    'lib': {
        //type:'Set<Project>',
        '✕': function free(j) {},
        '🖥 Start workers':                       { type:'Project', url:'modules/jobs/overlordWorkers.js'},
        '☠ Kill all':                            { type:'Project', url:'modules/jobs/workerKill.js'},
    },
    'tests': {
        //type:'Set<Project>',
        // TODO: lazy(project(...))  : lazy wrapet alle members von project
        '🐼 Process fracturing folder on workers':    { type:'Project', url:'modules/jobs/workerBacc0.js'},
        '🐁 Process empty jobs on worker':            { type:'Project', url:'modules/jobs/workerBacc1.js'},
        '🦁 Find similar 3d models on worker':        { type:'Project', url:'modules/jobs/workerModel3d.js'},
        'ℙ Find prime numbers with C++ on workers':  { type:'Project', url:'modules/jobs/workerPrimeCpp.js'},
        '💢 server fragment folder':                  { type:'Project', url:'modules/jobs/serverFragmentFolder.js'},
        '💻 server cmd':                              { type:'Project', url:'modules/jobs/serverCmd.js'},
        '📂 server folder':                           { type:'Project', url:'modules/jobs/serverFolder.js'},
        '🗩 server output':                           { type:'Project', url:'modules/jobs/serverOutput.js'},
        '🗩 serevr output 2':                         { type:'Project', url:'modules/jobs/serverOutput2.js'},
        '❄ local find 3d models':                    { type:'Project', url:'modules/jobs/localSetIteration.js'},
        '🔃 local paralell AJAX':                     { type:'Project', url:'modules/jobs/localAjax.js'},
        '🗩 local output':                            { type:'Project', url:'modules/jobs/localOutput.js'},
        '✕': function free(j) {},
        '▸': function run(j) {
            // this =  tests
            //var projectMembers = this.filter(i=> i.type == 'project')

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
    }
}

})
(typeof exports === 'undefined' ? this['projectFolder']={} : exports)
