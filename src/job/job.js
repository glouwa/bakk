(function(exports)
{
    exports.jm = function()
    {
        var jm = {}
        jm.nextFreeId = 0
        jm.workerId = undefined
        jm.jl = undefined

        function jobProto()
        {
            var jp = {}

            Object.defineProperty(jp, 'timer', { writable:true, value:null })
            Object.defineProperty(jp, 'call', { value:function()
            {
                var j = this
                j.exception2localError(function call_()
                {
                    //console.trace('j-' + j.id + ' call')
                    if (j.params && j.params.timeout)
                    {
                        j.timer = setTimeout(()=> {
                            j.cancel()
                            j.ret('failed', 'timeout ' + j.params.timeout)

                        }, j.params.timeout.valueOf())
                    }

                    var diff = {
                        id: j.id,
                        state: {
                            progress: 0.05,
                            type: 'calling',
                            detail: 'calling',
                            log: 'calling function',
                            lastWorker: jm.workerId
                        }
                    }
                    j.merge(diff, !j.isRoot)
                    j.onUpdate(j, diff)
                    j.onCall(j, diff)
                })
            }})

            Object.defineProperty(jp, 'cancel', { value:function()
            {
                var j = this
                j.exception2localError(function cancel_()
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
                        }
                    }
                    j.merge(diff, !j.isRoot)
                    j.onUpdate(j, diff)
                    j.onCancel(j)
                })
            }})

            Object.defineProperty(jp, 'updateJob', { value:function(diff/*stateDiff*/, outputDiff)
            {
                var j = this
                j.exception2localError(function update_()
                {
                    //console.trace('j-' + j.id + ' updateJob')
                    console.assert(!diff.output)

                    if (diff.state.progress && diff.state.progress.valueOf() == 1)
                    {
                        console.assert(!outputDiff)
                        j.ret(diff.state.detail, diff.state.log + ' (auto)')
                    }
                    else
                    {                        
                        if (j.output && outputDiff)
                        {
                            j.output.update(outputDiff)
                            outputDiff = undefined
                        }

                        j.merge(diff, !j.isRoot)
                        j.onUpdate(j, diff, outputDiff)
                    }
                })
            }})

            Object.defineProperty(jp, 'ret', { value:function(detail, log)
            {
                var j = this
                j.exception2localError(function ret_()
                {
                    //console.trace('j-' + j.id + ' ret')
                    console.assert(j.state.type != 'returned', 'double return')

                    clearTimeout(j.timer)

                    var diff = {
                        state: {
                            progress: 1,
                            type:'returned',
                            detail:detail,
                            log:log,
                            lastWorker: jm.workerId
                        }
                    }
                    j.merge(diff, !j.isRoot)
                    j.onUpdate(j, diff)
                    j.onReturn(j, diff)
                })
            }})

            Object.defineProperty(jp, 'delegateToOne', { value:function(a) { jm.jl.oneLogic(this, a) } } )
            Object.defineProperty(jp, 'delegateToPool', { value:function(a) { jm.jl.poolLogic(this, a) } } )
            Object.defineProperty(jp, 'delegateToFactory', { value:function(a) { jm.jl.factoryLogic(this, a) } } )
            Object.defineProperty(jp, 'delegateToSequence', { value:function() { jm.jl.sequenceLogic(this, arguments) } } )

            //-------------------------------------------------------------------------------------

            Object.defineProperty(jp, 'onLocalError', { value: function (detail, log)
            {
                try
                {
                    // same as ret, but without exception2localError
                    // to avoid endless recursionif theres a error at return
                    console.error(this.state.type != 'returned', 'double return')

                    clearTimeout(this.timer)

                    var diff = {
                        state: {
                            progress: 1,
                            type: 'returned',
                            detail: detail,
                            log:log
                        }
                    }
                    this.merge(diff, !this.isRoot)
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

            Object.defineProperty(jp, 'exception2localError', { value:function(action)
            {
                try
                {
                    action()
                }
                catch(e)
                {
                    console.error('local error: ' + e.stack)
                    this.onLocalError(e.message === 'recoverable' ? 'recoverable' : 'fatal', e.stack)
                }
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
                    this.updateJob({ state: this.lastState }, this.bunch)

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

            if (!diff.id)     diff.id = jm.workerId + '\u208B' + ljnr.toSubscript()            
            if (!diff.state)  diff.state =
            {
                progress: 0,
                type: 'idle',   // idle, running, canceling, returned
                detail: 'idle', // (idle), (userdefined), (canceling), (recoverable, fatal, timeout)
                log: 'created',
                lastWorker: jm.workerId
            }
            if (!diff.onCancel) diff.onCancel = j=> j.ret('canceled', 'default cancel')
            if (!diff.onUpdate) diff.onUpdate = j=> { /*gui update | parent updaet */ }
            if (!diff.onReturn) diff.onReturn = j=> { /*subjoblogic */ }

            return diff
        }

        //-----------------------------------------------------------------------------------------

        jobMsg = function(type, id, diff, odiff)
        {
            var channelMsg = function(type, msg)
            {
                var net = {}
                net.type = type
                net.payload = msg
                return net
            }

            var msg = {}
            msg.type = type
            msg.id = id
            msg.diff = diff
            msg.odiff = odiff
            return channelMsg('Job', msg)
        }

        jm.remoteJobs = {}
        jm.remoteProxyJob = function(args)
        {
            var c = args.node
            // transfered, unpacket and called remotely
            // j is a valid variable bcause this functions are evaluated remotly in
            // a context where j exists. c is the connection on remoteside
            var realJob = jm.job({
                params: args.args,
                onCall: args.realJob                
            })

            // locally called
            var proxyJob = jm.job({
                id: realJob.id,
                isProxy: true,
                params: args.args,
                onCall:   ()=> c.send(jobMsg('call', realJob.id, realJob.pack())),
                onCancel: ()=> c.send(jobMsg('cancel', realJob.id, realJob.pack()))
            })

            // is jetzt in mvj ... jm.remoteJobs[proxyJob.id] = proxyJob
            // todo: unregister on return (on('return',...))

            return proxyJob
        }

        jm.onReceive = function(c, parsed, evalInAppContext, app)
        {
            try
            {
                var job = jm.remoteJobs[parsed.id]
                if (!job)
                {
                    var jd = jm.job(parsed.diff.unpack(evalInAppContext))
                    jd.onUpdate = function(j, diff, o) { c.send(jobMsg('updateJob', jd.id, diff, o)) }
                    jd.isRemote = true

                    app.update('model.jobs.'+jd.id, jd)
                    job = app.model.jobs[jd.id]

                    // job.onReturn => unregister
                    jm.remoteJobs[jd.id] = job
                }

                job[parsed.type](parsed.diff, parsed.odiff) // call / cancel / update / return
            }
            catch(e)
            {
                console.error(e.stack)
            }
        }

        return jm
    }
})
(typeof exports === 'undefined' ? this['jobFactory']={} : exports)
