(function(exports, inBrowser)
{  
    if (!inBrowser)
        XMLHttpRequest = require('xhr2')

   //exports.jm = undefined

    //-----------------------------------------------------------------------------------------

    exports.ajaxJob = function(args)
    {
        var xmlhttp = new XMLHttpRequest()
        var canceled = false

        return jf.job({
            icon: '🔃', //⇌🔃🔄🔁
            desc: 'xhr: ' + args.url,
            params: args,
            onCancel: function() {
                canceled = true
                xmlhttp.abort()
            },
            onCall: function(j) {
                xmlhttp.onreadystatechange = ()=> q.addJob('Message From Ajax ' + xmlhttp.readyState, j, ()=> {
                    if (canceled) { // TODO: or not running
                        j.ret('canceled', 'xhr aborted')
                    }
                    else {
                        var diff = {
                            state: {
                                progress: 0.15 + xmlhttp.readyState / 5,
                                type:'running',
                                log:'readyState ' + xmlhttp.readyState + '/' + xmlhttp.status
                            }
                        }

                        if (xmlhttp.readyState === 1)
                            j.updateJob(diff)

                        else if (xmlhttp.readyState < 4 && xmlhttp.status == 200) {
                            //    j.updateJob(diff)
                        }

                        else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                            args.onData(j, diff.state, xmlhttp.responseText)
                            j.ret('ok', 'xhr ok')
                        }

                        else
                            j.ret('fatal', 'error at xhr ' + xmlhttp.status)
                    }
                })
                var prefix = inBrowser
                           ?''
                           :'http://'+app.core.config.server.wshost+':'
                                     +app.core.config.server.httpport+'/'
                xmlhttp.open("GET",prefix+args.url, true)
                xmlhttp.send()
            }
        })
    }

    //-----------------------------------------------------------------------------------------

    exports.readfileObject = function(path, args, onPipeStdOut, startProgress)
    {

    }

    //-----------------------------------------------------------------------------------------

    exports.spawnJob = function(args)
    {
        return jf.job({
            icon: '⚙',
            desc: args.path?args.path.valueOf() + args.args:args.cmd.valueOf(),
            onCall:j=> exports.spawn(j, args)
        })
    }

    //-----------------------------------------------------------------------------------------

    exports.spawn = function(j, args)
    {
        var cp = require('child_process')
        var js = require("JSONStream")
        var process = undefined
        var canceled = false

        j.onCancel = j=> {
            canceled = true
            process.kill()
        }

        if (args.path)
            process = cp.spawn(args.path.valueOf(), args.args)
        else if (args.cmd)
            process = cp.exec(args.cmd.valueOf(), args.options)

        j.updateJob({
            state: {
                type:'running',
                progress: args.startProgress ? args.startProgress : 0.05,
                log:'process '+ process.pid +' started ' + (args.args?args.args:args.cmd)
            }
        })

        if (args.justStart && args.justStart.valueOf()) {
            j.ret('ok', process.pid + ' no exception') //  at spawn/exec, register on error makes no senes since we want to return asap')
        }
        else {
            function dataHandler(data, eventEmitter) {
                j.exception2localError('Message from Process', ()=> {
                    if (!canceled)
                        eventEmitter(j, data)
                })
            }

            function exitHandler(code, sig, eventEmitter) {
                j.exception2localError('Message from Process', ()=> {
                    if (!canceled) {
                        if (j.flush)
                            j.flush('process exit')

                        if (code === 0 || code === 1)
                            j.ret('ok', 'exit code 0')
                        else
                            j.ret('fatal', process.pid + ' ec: ' + code + ' sig: ' + sig)
                    }
                    else {
                        j.ret('canceled', process.pid + ' ec: ' + code + ' sig: ' + sig)
                    }
                })
            }

            if (args.onJsonStdOut) {
                process.stdout
                    .pipe(js.parse())
                    .on('data',  data=> dataHandler(data, args.onJsonStdOut))
                    .on('error', err=> {})
                    .on('end',   ()=>  {})
                process.stderr
                    .pipe(js.parse())
                    .on('data',  data=> dataHandler(data, args.onJsonStdOut))
                    .on('error', err=> {})
                    .on('end',   ()=>  {})
            }

            if (args.onStdOut) {
                process.stdout
                    .on('data',  data=> dataHandler(data, args.onStdOut))
                    .on('error', err=> {})
                    .on('end',   ()=>  {})
                process.stderr
                    .on('data',  data=> dataHandler(data, args.onStdOut))
                    .on('error', err=> {})
                    .on('end',   ()=>  {})
            }

            process.on('exit', (code, sig)=> setTimeout(()=> exitHandler(code, sig), 50))
            process.on('error', err=> j.exception2localError('Message from Process', ()=> {
                j.ret('fatal', 'spawn: ' + args.path + '(' + err.code + ') ' + err.errno)
            }))
        }
    }
})
(typeof exports === 'undefined' ? this['tj']={} : exports, typeof exports === 'undefined')

