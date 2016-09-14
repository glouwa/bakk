function getCmdSet(j, diff)
{
    app.mergePath('model.store.'+j.id, {})
    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: app.model.store[j.id.valueOf()]
    })

    j.delegate(()=> jf.remoteProxyJob({
        icon: 'Ⓟ',
        desc: 'delegating to server',
        node: network.connections[0],
        args: j.params,
        realJob: js=> {

            var fs = require('fs'), path = require('path')
            function addCommandsOfFolder(dir, accu) {
                accu = accu || { commands:[], outputs:{} }
                var cmdArgs = ''

                fs.readdirSync(dir).forEach((v, k, idx)=> {
                    var sub = path.join(dir, v)
                    if (fs.statSync(sub).isDirectory()) addCommandsOfFolder(sub, accu)
                    if (path.extname(v) == '.off' && v != 'output.off')
                        cmdArgs += ' ' + v
                })

                if (cmdArgs) {
                    accu.commands.push({
                        dir:dir,
                        cmd:'Preprocessing' + cmdArgs + ' output.off',
                        outputFile:dir+'/output.off',
                        fileState:'planned'
                    })
                    accu.outputs[dir+'/output.off'] = 'planned'
                }
                return accu
            }
            var workers = app.getNodesByCapability('POSIX64')
            var output = addCommandsOfFolder(js.params.directory.valueOf())
            output.workerCount = workers.length
            js.updateJob({ state:{ type:'running', log:'collected commands'} }, output)

            js.delegate({
                type: 'pool',
                pool: workers,
                count: output.commands.length,
                desc: workers.length + ' worker, ' + output.commands.length + ' elements',
                job: (idx, node)=> jf.remoteProxyJob({
                    icon:'⚙',
                    desc:output.commands[idx].dir,
                    node:node,
                    args:{ command:output.commands[idx], idx:idx, timeout:js.params.workerTimeout },
                    realJob: jw=> tj.spawn(jw, {
                    cmd: 'shuf -i 1-3 -n 1 | xargs sleep && echo echo',
                    //cmd: jw.params.command.cmd.valueOf(),
                        options:{ cwd:jw.params.command.dir.valueOf(), env:Object.assign({ OMP_NUM_THREADS:4 }, process.env) },
                        onStdOut: (jw, data)=> jw.commitJob(
                            { type:'running', progress:0.5, log:data },
                            { commands:{ [jw.params.idx.valueOf()]:{ fileState:'ok'} }}
                        )
                    })
                })
            })
        }
    }))
}

new Object({
    type: 'Project',
    icon: '🐈Ⓓ',
    desc: 'Process fragment folder',
    service: {
        type: 'Service',
        src: getCmdSet,
        args: {
            directory: 'data/fragmented/',
            timeout:25*60*1000,
            workerTimeout:5*60*1000
        },
    },    
    tests: []
})
