(function(exports, inBrowser)
{  
    if (!inBrowser)
        XMLHttpRequest = require('xhr2')

    exports.jm = undefined

    /*
    exports.wrap = function(k, o)
    {
        var wrap = {}
        wrap[k] = o
        return wrap
    }*/

    //-----------------------------------------------------------------------------------------

    exports.ajaxJob = function(args)
    {
        var xmlhttp = new XMLHttpRequest()
        var canceled = false

        return exports.jm.job({
            params: args,
            onCancel: function()
            {
                canceled = true
                xmlhttp.abort()
            },
            onCall: function(j)
            {
                xmlhttp.onreadystatechange = function() { j.exception2localError(function()
                {
                    if (canceled)
                    {
                        j.ret('canceled', 'xhr borted')
                    }
                    else
                    {
                        var diff = {
                            state: {
                                progress: 0.15 + xmlhttp.readyState / 5,
                                type:'running',
                                log:'readyState ' + xmlhttp.readyState + '/' + xmlhttp.status
                            }
                        }

                        if (xmlhttp.readyState === 1)
                            j.updateJob(diff)

                        else if (xmlhttp.readyState < 4 && xmlhttp.status == 200)
                            j.updateJob(diff)

                        else if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
                        {
                            args.onData(j, diff.state, xmlhttp.responseText)
                            j.ret('ok', 'xhr ok')
                        }

                        else
                            j.ret('fatal', 'error at xhr ' + xmlhttp.status)
                    }
                })}

                xmlhttp.open("GET", (inBrowser ? '':'http://'+config.server.ws+':1337/---/---/') + args.url, true)
                xmlhttp.send()
            }
        })
    }

    //-----------------------------------------------------------------------------------------

    exports.readfileObject = function(path, args, onPipeStdOut, startProgress)
    {

    }

    //-----------------------------------------------------------------------------------------

    exports.spawnJob = function(path, args, onPipeStdOut, startProgress)
    {
        return exports.jm.job({
            onCall:j=> exports.spawn(j, path, args, onPipeStdOut, startProgress)
        })
    }

    //-----------------------------------------------------------------------------------------

    exports.spawn = function(j, path, args, onPipeStdOut, startProgress)
    {
        var cp = require('child_process')
        var js = require("JSONStream")
        var process = undefined
        var canceled = false

        j.onCancel = j=> {
            canceled = true
            process.kill()
        }

        process = cp.spawn(path, args)

        j.updateJob({
            state: {
                type:'running',
                progress: startProgress ? startProgress : 0.05,
                log:'process '+ process.pid +' started ' + args
            }
        })

        process.on('error', err=> j.exception2localError(()=> {
            j.ret('fatal', 'spawn: ' + path + '(' + err.code + ') ' + err.errno)
        }))

        if (onPipeStdOut)
            process.stdout
                .pipe(js.parse())
                .on('data', data=> j.exception2localError(()=> {
                    if (!canceled)
                        onPipeStdOut(j, data)
                 }))
                .on('error', err=> {})
                .on('end',   ()=>  {}) // is called after exit :/

        process.on('exit', (code, sig)=> j.exception2localError(()=> {
            if (!canceled && j.flush)
                j.flush('process exit')

            if (code === 0)
                j.ret('ok', 'process terminated with code 0')

            else if (canceled && code === 143)
                j.ret('canceled', process.pid + ' ec: 143 ok')

            else if (canceled && sig === 'SIGTERM')
                j.ret('canceled', process.pid + ' ec: ' + code + ' sig: ' + sig)

            else
                j.ret('fatal', 'ec: ' + code + ' sig: ' + sig)
        }))
    }

    //-----------------------------------------------------------------------------------------

    exports.execJob = function(cmd, onPipeStdOut)
    {
        return exports.jm.job({
            onCall:j=> exports.exec(j, cmd, onPipeStdOut)
        })
    }

    //-----------------------------------------------------------------------------------------

    exports.exec = function(j, cmd, onPipeStdOut)
    {
        var cp = require('child_process')
        var js = require("JSONStream")
        var process = undefined
        var canceled = false

        j.onCancel = function(j) {
            canceled = true
            process.kill()
        }

        process = cp.exec(cmd.valueOf())

        j.updateJob({
            state: {
                type:'running',
                progress:0.05,
                log:'process '+ process.pid +' started ' + cmd
            }
        })

        process.on('error', err=> j.exception2localError(()=> {
            j.ret('fatal', 'exec: ' + cmd.valueOf() + '(' + err.code + ') ' + err.errno)
        }))

        if (onPipeStdOut)
            process.stdout
                .on('data', data=> j.exception2localError(()=> {
                    if (!canceled)
                        onPipeStdOut(j, data)
                 }))
                .on('error', err=> {})
                .on('end',   ()=>  {}) // is called after exit :/ */

        process.on('exit', (code, sig)=> j.exception2localError(()=> {
            if (!canceled && j.flush)
                j.flush('process exit')

            if (canceled && code === 143)
                j.ret('canceled', process.pid + ' ec: 143 ok')

            else if (canceled && sig === 'SIGTERM')
                j.ret('canceled', process.pid + ' ec: ' + code + ' sig: ' + sig)

            else if (code >= 0)
                j.ret('ok', 'process terminated with code ' + code)

            else
                j.ret('fatal', 'ec: ' + code + ' sig: ' + sig)
        }))
    }
})
(typeof exports === 'undefined' ? this['tj']={} : exports, typeof exports === 'undefined')

