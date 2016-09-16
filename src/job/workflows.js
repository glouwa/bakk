(function(exports)
{

    function every(o, p) {
        for (k in o)
            if (!p(o[k]))
                return false
        return true
    }

    function allHaveState(sjm, m, c) {
        return every(sjm, function(i) {
            console.assert(i.state[m])
            return i.state[m].valueOf() == c
        })
    }

    function resultState(parent) {
        if (allHaveState(parent.subjobs, 'detail', 'ok'))
            return 'ok'
        if (parent.state.detail.valueOf() == 'canceling')
            if (allHaveState(parent.subjobs, 'type', 'returned')) return 'canceled'
            // todo: if some are failed --> parent = failed
        return 'failed'
    }

    function countStateNot(sjm, state) {
        var jids = Object.keys(sjm)
        return jids.reduce((count, i)=> count + (sjm[i].state.type.valueOf() !== state ? 1:0), 0)
    }

    function avgProgress(parent, pAa, jobCount) {
        if (!parent.subjobs)
            return pAa

        var jids = Object.keys(parent.subjobs)
        jobCount = jobCount || jids.length

        var callProgress  = 0.05 //parent.params.config.callProgress
                          * countStateNot(parent.subjobs, 'idle')
                          / jobCount

        var avgSjProgress = jids.reduce((sum, k)=> sum + parent.subjobs[k].state.progress.valueOf(), 0)
                          / jobCount

        if (isNaN(pAa + avgSjProgress))
            throw new Error('avgSjProgress is NaN')

        return pAa
             //+ (callProgress
             + avgSjProgress * 0.9
    }

    //-----------------------------------------------------------------------------------------

    function configureSubjob(sj, parent, jidx, onSubjobReturn)
    {
        var wc = parent.workflow.count ? parent.workflow.count.valueOf() : undefined
        sj.onUpdate = (j, diff)=> onSubjobUpdate(j, diff, parent, parent.workflow.pAa.valueOf(), wc)
        sj.onReturn = j=> onSubjobReturn(j, jidx)
        parent.mergePath('subjobs.'+sj.id, sj)
        return parent.subjobs[sj.id] || app.model.jobs[sj.id.valueOf()]
    }

    function onSubjobUpdate(sj, diff, parent, pAa, jobCount)
    {
        q.logGroup( parent.workflow.type + '.onSjUpdate ' + parent.id, 'violet', ()=> {
            var pdiff = {
                state: { progress: avgProgress(parent, pAa, jobCount) },
                subjobs: { [sj.id.valueOf()]:diff },
                //output:  { [sj.id.valueOf()]:output }
            }

            parent.updateJob(pdiff)
        })
    }

    //-----------------------------------------------------------------------------------------

    exports.oneLogic = function(parent, args)
    {
        console.assert(args.count == 1)
        exports.sequenceLogic(parent, args)
    }

    exports.poolLogic = function(parent, args)
    {
        // terminate strategy
        var lastCreatedIdx = 0
        var jobNodeMap = {} // terminiert ein sj muss man wiessen welche node job braucht
        function onSubjobReturn(j, jidx) {            
            q.logGroup(args.type + ' onSjReturn ' + parent.id, 'violet', ()=> {
                if (lastCreatedIdx < args.count)
                    if (j.state.detail.valueOf() === 'ok') {
                        var node =  jobNodeMap[j.id.valueOf()]
                        var newSjInitDiff = args.job(lastCreatedIdx, node)
                        var newSj = configureSubjob(newSjInitDiff, parent, lastCreatedIdx, onSubjobReturn)
                        jobNodeMap[newSj.id.valueOf()] = node
                        newSj.call()
                        lastCreatedIdx++
                    }
                else if(j.state.detail.valueOf() !== 'canceled')
                    // hmmm. könnte sein das sync jobs den parent hier schon geschlossen haben
                    parent.ret('failed', 'failed', 'one subjob failed')

                if (parent.state.type != 'returned') // wenn newSj.call() sync dann ist parent schon zu, weil onr return die parents raus geht
                if (allHaveState(parent.subjobs, 'type', 'returned'))
                    parent.ret(resultState(parent), args.desc + ' ' + resultState(parent))
            })
        }

        // startstrategy
        while(lastCreatedIdx < args.pool.length) {
            // nur |pool| viele kommen sofort in die parent.subjob liste
            var node = args.pool[lastCreatedIdx]
            var newSjInitDiff = args.job(lastCreatedIdx, node)
            var newSj = configureSubjob(newSjInitDiff, parent, lastCreatedIdx, onSubjobReturn)
            console.log(newSj)
            jobNodeMap[newSj.id.valueOf()] = node
            newSj.call()
            lastCreatedIdx++
        }
    }

    //-----------------------------------------------------------------------------------------

    exports.parallelLogic = function(parent, args)     // by abort callback
    {
        // terminate strategy
        function onSubjobReturn() {
            q.logGroup(args.type + ' onSjReturn ' + parent.id, 'violet', ()=> {               
                if (parent.state.type != 'returned') // wenn newSj.call() sync dann ist parent schon zu, weil onr return die parents raus geht
                    //args.end(lastCreatedIdx))
                    if (allHaveState(parent.subjobs, 'type', 'returned'))
                        parent.ret(resultState(parent), args.desc + ' ' + resultState(parent))
            })
        }

        // startstrategy
        var lastCreatedIdx = 0
        while(args.end(lastCreatedIdx)) {
            // kommt sofort in die parent.subjob liste
            var newSjInitDiff = args.job(lastCreatedIdx)
            var newSj = configureSubjob(newSjInitDiff, parent, lastCreatedIdx, onSubjobReturn)
            //newSj.call()
            lastCreatedIdx++
        }

        parent.subjobs.forEach(v=>v.call())

        console.assert(lastCreatedIdx > 0, 'subjoblogic with 0 subjobs?')
    }

    //-----------------------------------------------------------------------------------------

    exports.sequenceLogic = function(parent, args) // by arraylenght
    {
        // terminate strategy
        function onSubjobReturn(j, jidx) {
            q.logGroup(args.type+'.onSjReturn {' + parent.id +','+ j.id +','+ jidx, 'violet', ()=> {

                if (jidx < args.job.length-1)
                    if (j.state.detail.valueOf() === 'ok') {
                        var nextIdx = jidx+1
                        var newSjInitDiff = args.job[nextIdx](nextIdx)
                        var newSj = configureSubjob(newSjInitDiff, parent, nextIdx, onSubjobReturn)
                        newSj.call()
                    }
                    else if(j.state.detail.valueOf() !== 'canceled')
                        parent.ret('failed', 'failed', 'one subjob failed')
                else
                    console.assert(allHaveState(parent.subjobs, 'type', 'returned'))

                if (parent.state.type != 'returned') // wenn newSj.call() sync dann ist parent schon zu, weil onr return die parents raus geht
                    if (allHaveState(parent.subjobs, 'type', 'returned'))
                        parent.ret(resultState(parent), parent.state.log)
            })
        }

        // startstrategy
        var newSjInitDiff = args.job[0](0)
        var newSj = configureSubjob(newSjInitDiff, parent, 0, onSubjobReturn)
        newSj.call()
    }
})
(typeof exports === 'undefined' ? this['jl']={} : exports)
