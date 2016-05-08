(function(exports)
{

    function every(o, p)
    {
        for (k in o)
            if (!p(o[k]))
                return false
        return true
    }

    function allHaveState(sjm, m, c)
    {
        return every(sjm, function(i)
        {
            console.assert(i.state[m])
            return i.state[m].valueOf() == c
        })
    }

    function resultState(parent)
    {
        if (allHaveState(parent.subjobs, 'detail', 'ok')) return 'ok'

        if (parent.state.detail.valueOf() == 'canceling')
            if (allHaveState(parent.subjobs, 'type', 'returned')) return 'canceled'
            // todo: if some are failed --> parent = failed

        return 'failed'
    }

    function wrap(name, j)
    {
        var sjmdiff = {}
        sjmdiff[name] = j
        return sjmdiff
    }

    function countStateNot(sjm, state)
    {
        var jids = Object.keys(sjm)
        return jids.reduce((count, i)=> count + (sjm[i].state.type.valueOf() !== state ? 1:0), 0)
    }

    function avgProgress(parent, pAa, jobCount)
    {
        if (!parent.subjobs)
            return pAa

        var jids = Object.keys(parent.subjobs)
        jobCount = jobCount || jids.length

        var callProgress = 0.05 //parent.params.config.callProgress
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

    exports.oneLogic = function(parent, args)
    {
        args.end = jidx=> jidx < 1
        exports.factoryLogic(parent, args)
    }

    function logic(parent, onReturn, starter)
    {
        var pAa = parent.state.progress.valueOf()

        parent.onCancel = function(j)
        {
            // if not aleary done
            parent.subjobs.forEach(sj=> sj.cancel())
        }

        function configureSubjob(sj, jidx)
        {
            sj.onUpdate = function(j, diff, outputDiff)
            {
                var pdiff = {
                    state: { progress: avgProgress(parent, pAa) },
                    subjobs: { [sj.id.valueOf()]:diff }
                }

                if (pdiff.state.progress == 1)
                    delete pdiff.state.progress // wtf?

                parent.updateJob(pdiff, outputDiff)
            }
            sj.onReturn =(j)=> onReturn(j, jidx)
            return sj
        }

        starter(configureSubjob)
    }

    exports.poolLogic = function(parent, args)
    {
        var lastCreatedIdx = 0
        var pAa = parent.state.progress.valueOf()
        var jobNodeMap = {}

        parent.onCancel = j=> parent.subjobs.forEach(sj=> {
            if(sj.state.type.valueOf() != 'returned')
                sj.cancel()
        })

        function onReturn(j, jidx)
        {
            if (lastCreatedIdx < args.count)
                if (j.state.detail.valueOf() === 'ok')
                    createSubJob(lastCreatedIdx++, jobNodeMap[j.id.valueOf()]).call()

                else if(j.state.detail.valueOf() !== 'canceled')
                    parent.ret('failed', 'failed', 'one subjob failed')

            if (allHaveState(parent.subjobs, 'type', 'returned'))
                parent.ret(resultState(parent), args.desc + ' ' + resultState(parent))
        }

        function createSubJob(jidx, node)
        {
            var sj = args.job(jidx, node)
            jobNodeMap[sj.id.valueOf()] = node

            sj.onUpdate = function(j, diff, outputDiff)
            {
                var pdiff = {
                    state: { progress: avgProgress(parent, pAa, args.count) },
                    subjobs: { [sj.id.valueOf()]:diff }
                }

                if (pdiff.state.progress == 1)
                    delete pdiff.state.progress

                parent.updateJob(pdiff, outputDiff)
            }
            sj.onReturn = j=> onReturn(j, jidx)
            parent.update('subjobs.'+sj.id, sj)
            return parent.subjobs[sj.id] || app.model.jobs[sj.id.valueOf()]
        }

        var newSubJobs = []
        while(lastCreatedIdx < args.pool.length)
        {
            newSubJobs.push(createSubJob(lastCreatedIdx, args.pool[lastCreatedIdx]))
            lastCreatedIdx++
        }

        parent.updateJob({ state:{ type:'running', detail:'delegating', log:args.desc }})
        newSubJobs.forEach(sj=> sj.call())
    }

    exports.factoryLogic = function(parent, args)
    {
        var newSubJobs = []
        logic(
            parent,
            (j, jidx)=> // onReturn
            {
                if (allHaveState(parent.subjobs, 'type', 'returned'))
                    parent.ret(resultState(parent), args.desc + ' ' + resultState(parent))
            },
            sjf=> // onCall
            {
                var lastCreatedIdx = 0
                while(args.end(lastCreatedIdx))
                {
                    var newSj = sjf(args.job(lastCreatedIdx++), lastCreatedIdx)
                    parent.update('subjobs.'+newSj.id, newSj)
                    newSubJobs.push(parent.subjobs[newSj.id] || app.model.jobs[newSj.id.valueOf()])
                }

                console.assert(lastCreatedIdx > 0, 'subjoblogic with 0 subjobs?')

                parent.updateJob({ state:{ type:'running', detail:'delegating', log:args.desc }})
                newSubJobs.forEach(sj=> sj.call())
            }
        )
    }

    exports.sequenceLogic = function(parent, subjobFactorys)
    {
        var newSubJobs = []
        logic(parent,
            (j, jidx)=> // onReturn
            {
                if (jidx < subjobFactorys.length)
                    if (j.state.detail.valueOf() === 'ok')
                        newSubJobs[jidx].call()

                    else if(j.state.detail.valueOf() !== 'canceled')
                        parent.ret('failed', 'failed', 'one subjob failed')
                else
                    console.assert(allHaveState(parent.subjobs, 'type', 'returned'))

                if (allHaveState(parent.subjobs, 'type', 'returned'))
                    parent.ret(resultState(parent), 'todo: sequenceLogic.desc')
            },
            sjf=> // onCall
            {
                var lastCreatedIdx = 0
                while(lastCreatedIdx < subjobFactorys.length)
                {
                    var newSj = sjf(subjobFactorys[lastCreatedIdx](lastCreatedIdx++), lastCreatedIdx)
                    parent.update('subjobs.'+newSj.id, newSj)
                    newSubJobs.push(parent.subjobs[newSj.id] || app.model.jobs[newSj.id.valueOf()])
                }

                parent.updateJob({ state:{ type:'running', detail:'delegating', log:'todo: sequenceLogic.desc' }})
                newSubJobs[0].call()
            }
        )
    }
})
(typeof exports === 'undefined' ? this['jl']={} : exports)
