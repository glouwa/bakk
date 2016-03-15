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
            node: network.server,
            args: j.params,
            realJob: js=> {

                function addCommandsOfFolder(commands, dir) {
                    var fs = require('fs'), path = require('path'), files = fs.readdirSync(dir)
                    var cmd = 'Preprocessing'
                    var cmdArgs = ''

                    files.forEach((v, k, idx)=> {
                        var sub = path.join(dir, v)
                        if (fs.statSync(sub).isDirectory())
                            addCommandsOfFolder(commands, sub)
                        if (path.extname(v) == '.off' && v != 'output.off')
                            cmdArgs += ' ' + v
                    })

                    if (cmdArgs) commands.push({
                        dir:dir,
                        cmd:cmd+cmdArgs+' output.off'
                    })
                }
                var commands = []
                addCommandsOfFolder(commands, js.params.directory.valueOf())
                js.updateJob({ state:{ type:'running', log:'collected commands'} }, commands )

                js.delegateToPool({
                    pool: app.filterNodes('POSIX64'),
                    count: commands.length,
                    desc: 'pooling ' + commands.length + ' processes',
                    job: (idx, node)=> jf.remoteProxyJob({
                        node:node,
                        args:{ command:commands[idx], timeout:js.params.workerTimeout },
                        realJob: jw=> tj.exec(jw,
                            'shuf -i 0-10 -n 1 | xargs sleep',//jw.params.command.cmd.valueOf(),
                            (jw, data)=> jw.commitJob(
                                             { type:'running', progress:0.5, log:data },
                                             { cwd:jw.params.command.dir.valueOf() }
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
            timeout:10000,
            workerTimeout:12000
        },
    },    
    tests: []
})
