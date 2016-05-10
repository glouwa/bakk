function getCmdSet(j, diff)
{
    app.update('model.store.'+j.id, {})
    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: app.model.store[j.id.valueOf()]
    })

    j.delegateToOne({
        desc: 'delegating to server',
        job: ()=> jf.remoteProxyJob({
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
                var output = addCommandsOfFolder(js.params.directory.valueOf())
                js.updateJob({ state:{ type:'running', log:'collected commands'} }, output)

                var workers = app.filterNodes('POSIX64')

                js.delegateToPool({
                    pool: workers,
                    count: output.commands.length,
                    desc: workers.length + ' worker, ' + output.commands.length + ' elements',
                    job: (idx, node)=> jf.remoteProxyJob({
                        node:node,
                        args:{ command:output.commands[idx], idx:idx, timeout:js.params.workerTimeout },
                        realJob: jw=> tj.exec(jw,
                            'shuf -i 0-10 -n 1 | xargs sleep && echo echo', //jw.params.command.cmd.valueOf(),
                            (jw, data)=> jw.commitJob(
                                { type:'running', progress:0.5, log:data },
                                { commands:{ [jw.params.idx.valueOf()]:{ fileState:'ok'} }}
                            )
                        )
                    })
                })
            }
        })
    })
}

new Object({
    type: 'Project',
    icon: '⤑🐼',
    desc: 'Process fragment folder',
    service: {
        type: 'Service',
        src: getCmdSet,
        args: {
            directory: '../../data/fragmented/',
            timeout:25000,
            workerTimeout:12000
        },
    },    
    tests: []
})
