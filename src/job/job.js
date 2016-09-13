(function(exports)
{
    exports.jm = function()
    {
        var jm = {}
        jm.nextFreeId = 0
        jm.workerId = undefined
        jm.host = undefined
        jm.jl = undefined

        function jobProto()
        {
            var jp = {}

            Object.defineProperty(jp, 'timer', { writable:true, value:null })
            //Object.defineProperty(jp, 'dasdaesc', { writable:true, enumerable:true, value:'unnamed job' })

            Object.defineProperty(jp, 'call', { value:function call(initDiff)
            {
                var j = this
                j.exception2localError('call', function call_()
                {
                    //console.trace('j-' + j.id + ' call')

                    // timeout zuerst
                    if (j.params && j.params.timeout)
                    {
                        Object.defineProperty(j, 'timer', { writable:true, value:null })
                        j.timer = setTimeout(()=> {
                            j.cancel()
                            // todo: state machine
                            j.ret('failed', 'timeout ' + j.params.timeout)
                            app.commit('timer')

                        }, j.params.timeout.valueOf())
                    }

                    // anderungen an job, muss leider zwischen remote und nicht unterscheiden
                    var diff = {
                        id: j.id,
                        state: {                            
                            type: 'calling',
                            progress: 0.051,
                            detail: 'calling',                        
                            log: 'calling function',
                            lastWorker: jm.workerId,
                        },
                        [j.isRemote?'debugRemote':'debug']:{
                            node:jm.workerId,
                            host:jm.host,
                            callTime:Date.now(),                            
                            lastModification: Date.now()
                        },
                        ///log:[3, 4, 6]
                    }

                    // apply                    
                    j.merge(diff) // model aktualisieren
                    j.onUpdate(j, diff)      // parent jobs ...
                    j.onCall(j, diff)        // user event
                })
            }})

            Object.defineProperty(jp, 'cancel', { value:function cancel()
            {
                var j = this
                j.exception2localError('cancel', function cancel_()
                {
                    //console.trace('j-' + j.id + ' cancel')
                    if (j.state.type == 'returned')
                        return

                    var diff = {
                        state: {
                            progress: 0.95,
                            type: 'canceling',
                            detail: 'canceling',
                            log: 'canceling',
                            lastWorker: jm.workerId
                        },
                        [j.isRemote?'debugRemote':'debug']:{
                            cancelTime:Date.now(),                            
                            lastModification: Date.now(),                            
                        }
                    }

                    console.log('Merging j ', j.path.valueOf(), diff)
                    j.merge(diff)
                    j.onUpdate(j, diff)
                    j.onCancel(j)
                })
            }})

            Object.defineProperty(jp, 'updateJob', { value:function updateJob(diff/*stateDiff*/, outputDiff)
            {
                var j = this
                j.exception2localError('update', function update_()
                {
                    //console.trace('j-' + j.id + ' updateJob')
                    console.assert(!diff.output)
                    //console.assert(j.state.type °= 'returned')
                    if (j.state.type == 'returned')
                        console.log('########## updating returned job' + j.state.type != 'returned')

                    diff[j.isRemote?'debugRemote':'debug'] = {
                        updateTime:Date.now(),                        
                        lastModification: Date.now()
                    }

                    //if (diff.state.progress && diff.state.progress.valueOf() == 1) {
                    if (diff.state.type == 'returned') {
                        console.assert(!outputDiff)
                        j.ret(diff.state.detail, diff.state.log + ' (update to return)')
                    }
                    else {
                        if (j.output && outputDiff) {
                            j.output.merge(outputDiff)
                            outputDiff = undefined
                            console.warn('got output', outputDiff)
                        }

                        j.merge(diff)
                        j.onUpdate(j, diff, outputDiff)
                    }
                })
            }})

            Object.defineProperty(jp, 'ret', { value:function ret(detail, log)
            {
                var j = this
                j.exception2localError('ret', function ret_() {
                    //console.trace('j-' + j.id + ' ret')
                    if (j.state.type != 'returned') {
                        clearTimeout(j.timer)
                        var diff = {
                            state: {
                                progress: 1,
                                type:'returned',
                                detail:detail,
                                log:log,
                                lastWorker: jm.workerId
                            },
                            [j.isRemote?'debugRemote':'debug']: {
                                returnTime:Date.now(),                                
                                lastModification: Date.now()
                            }
                        }
                        j.merge(diff)
                        j.onUpdate(j, diff)
                        j.onReturn(j, diff)
                    }
                    else {
                        console.assert(false, 'double return '
                                            + j.state.detail + '/' + + j.state.log
                                            + ' --> ' + detail + '/' + log)
                    }
                })
            }})


            Object.defineProperty(jp, 'delegate', { value:function delegate(a1)
            {                
                var args = a1
                if (arguments.length > 1) {
                    args = {
                        type: 'sequence',
                        desc: arguments.length + 'step(s)',
                        count: arguments.length,
                        job: arguments
                    }
                }

                if (arguments.length == 1 && typeof args == 'function') {
                    args = {
                        type: 'one',
                        desc: 'to one',
                        count: 1,
                        job: arguments,
                    }
                }

                q.logGroup(this.id + ' delegates to ' + args.type, 'violet', ()=> {

                    this.merge({ workflow:{
                            type: args.type,
                            pAa: this.state.progress.valueOf(),
                            count: args.count
                        }}
                    )

                    this.updateJob({ state:{
                        type:'running',
                        detail:'delegating',
                        log:args.desc
                    }})

                    this.onCancel = j=> this.subjobs.forEach(sj=> {
                        if(sj.state.type.valueOf() != 'returned')
                            sj.cancel()
                    })

                    jm.jl[args.type + 'Logic'](this, args)
                })
            }})

            //-------------------------------------------------------------------------------------

            Object.defineProperty(jp, 'onLocalError', { value: function (detail, log)
            {
                try
                {
                    // same as ret, but without exception2localError
                    // to avoid endless recursionif theres a error at return
                    console.assert(this.state.type != 'returned',
                                          'double return '
                                        + this.state.detail + '/' + + this.state.log
                                        + ' --> ' + detail + '/' + log)

                    clearTimeout(this.timer)

                    var diff = {
                        state: {
                            progress: 1,
                            type: 'returned',
                            detail: detail,
                            log:log
                        },
                        [this.isRemote?'debugRemote':'debug']: {
                            returnTime:Date.now(),
                            lastModification: Date.now()
                        }
                    }
                    this.merge(diff)
                    this.onUpdate(this, diff)
                    this.onReturn(this, detail)
                }
                catch(e)
                {
                    // TODO genauer unterscheiden zwischen console und net error report
                    // weil hier kanns auch exceptions geben die nocht durch eine kaputte verbindung verursacht werden
                    console.warn('error in error report - maybe broken connection?' + e.stack)
                }
            }})

            Object.defineProperty(jp, 'exception2localError', { value:function e2le(ttype, action)
            {
                q.addJob(ttype, this, action)
            }})

            //-------------------------------------------------------------------------------------

            Object.defineProperty(jp, 'bunch',      { writable:true, value:null })
            Object.defineProperty(jp, 'lastReport', { writable:true, value:null })
            Object.defineProperty(jp, 'lastState',  { writable:true, value:undefined })
            Object.defineProperty(jp, 'commitJob',  { writable:true, value:function(s, o)
            {
                if (s) this.lastState = s
                if (o) this.bunch = o

                var timeSinceLastReport = new Date() - this.lastReport
                var timeForReport = this.lastReport ? timeSinceLastReport > 200 : true

                if (timeForReport)
                    this.flush('timer')
            }})

            Object.defineProperty(jp, 'flush', { value:function(reason)
            {                
                if (this.lastState)
                    this.updateJob({ state:this.lastState }, this.bunch)

                this.bunch = null
                this.lastReport = new Date()
            }})
            return jp
        }

        jm.jobPrototype = jobProto()
        //-----------------------------------------------------------------------------------------

        jm.job = function(diff)
        {
            var ljnr = jm.nextFreeId++

            diff.type = 'Job'
            if (!diff.id) diff.id = jm.workerId + '\u208B' + ljnr.toSubscript()
            if (!diff.state) diff.state = {
                progress: 0,
                type: 'idle',   // idle, running, canceling, returned
                detail: 'idle', // (idle), (userdefined), (canceling), (recoverable, fatal, timeout)
                log: 'created'
            }
            if (!diff.debug) diff.debug = {
                node:jm.workerId,
                host:jm.host,

                lastModification: Date.now(),
                //lastModificationloc: jm.workerId
            }
            diff.debug.createTime = Date.now()

            if (!diff.onCancel) diff.onCancel = j=> j.ret('canceled', 'default cancel')
            if (!diff.onUpdate) diff.onUpdate = j=> { /*gui update | parent updaet */ }
            if (!diff.onReturn) diff.onReturn = j=> { /*subjoblogic */ }
            return diff
        }

        //-----------------------------------------------------------------------------------------

        jm.remoteJobs = {}
        jm.remoteProxyJob = function(args)
        {
            var c = args.node
            // transfered, unpacket and called remotely
            // j is a valid variable bcause this functions are evaluated remotly in
            // a context where j exists. c is the connection on remoteside
            var realJob = jm.job({
                desc: args.desc,
                params: args.args,
                onCall: args.realJob                
                // todo: onUpdate
                // vll onReturn
            })            

            // locally called
            var proxyJob = jm.job({
                id: realJob.id,
                desc: args.desc,
                isProxy: true,                
                params: args.args,
                //node: args.node,
                onCall:   pj=> {
                    //sim.log('job', 'log', '⟶', realJob)
                    console.info('%cjob', 'text-decoration:underline;', realJob.id, '⟶', realJob)
                    c.send(jobMsg('call', realJob.id, realJob.pack()))
                },
                onCancel: pj=> {
                    //sim.log('job', 'log', '⟶', realJob)
                    console.info('job', '⟶', realJob)
                    c.send(jobMsg('cancel', realJob.id, realJob.pack()))
                }
                //onUpdate: wird ganz normal von logic oder anwender definiert
                //onReturn: wird ganz normal von logic oder anwender definiert
            })

            // is jetzt in mvj ... jm.remoteJobs[proxyJob.id] = proxyJob
            // todo: unregister on return (on('return',...))

            return proxyJob
        }

        jobMsg = function(type, id, diff, odiff) { return {
            type: 'Job',
            payload: {
                type: type,
                id: id,
                diff: diff,
                odiff: odiff
            }
        }}

        /// TODO: begin, commit+send (mit one(e=>send(e)) vorm commit()?)
        // oder so lang er lebt? weil ander könntne ihn auch ändern

        jm.onReceive = function(c, parsed, evalInAppContext, app, pduSize)
        {
            var job = jm.remoteJobs[parsed.id] // jm.remoteJobs ?== app.model.jobs
            if (!job)
            {
                var jd = jm.job(parsed.diff.unpack(evalInAppContext))
                jd.isRemote = true
                //jd.isRoot = true // todo: causes double return
                jd.desc = '↷ ' + jd.desc
                console.assert(jd.state)
                console.assert(jd.debug)

                // jedes jd. kann auch in realjob gemacht werden
                jd.onUpdate = (j, diff, o)=> {} // brauch ma
                /*jd.onUpdate = (j, diff, o)=> {
                    //sim.log('job', 'log', '⟶', diff, o)
                    c.send(jobMsg('updateJob', jd.id, diff, o))
                }*/

                app.mergePath('model.jobs.'+jd.id, jd)
                job = app.model.jobs[jd.id]

                app.commit('flush workaround (dont send back)')

                app.on('commit', egal=> {
                    if (!job.changes) {
                        console.log('############### no changes!!!')
                        return
                    }
                    console.log('############### commiting', JSON.stringify(job.changes.diff,0,4))
                    var msg = jobMsg('updateJob', jd.id, job.changes.diff)
                    console.log('############### sending', JSON.stringify(msg,0,4))
                    c.send(msg)
                })

                // job.onReturn => unregister
                jm.remoteJobs[jd.id] = job
            }

            parsed.diff.state[parsed.type+'-InBytes'] = (job.state[parsed.type+'-InBytes']|0) + pduSize
            // call / cancel / update / return
            job[parsed.type](parsed.diff, parsed.odiff)


            //var msg = jobMsg('updateJob', job.id, job.changes.diff)
            //console.log('############### sending', JSON.stringify(msg,0,4))
            //c.send(msg)
        }

        jm.jobTime = function(j) {
            var debug = j.debug
            if (!debug.callTime)
                return 0
            return debug.lastModification.valueOf() - debug.callTime.valueOf()
        }

        return jm
    }
})
(typeof exports === 'undefined' ? this['jobFactory']={} : exports)
