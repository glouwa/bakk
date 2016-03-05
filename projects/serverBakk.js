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
                function addCommandsOfFolder(commands, dir)
                {
                    var fs = require('fs')
                    var path = require('path')
                    var files = fs.readdirSync(dir)

                    var cmdArgs = ''
                    files.forEach((v, k, idx)=> {

                        var sub = path.join(dir, v)

                        if (fs.statSync(sub).isDirectory())
                            addCommandsOfFolder(commands, sub)

                        else if (v != 'output.off')
                            cmdArgs += ' ' + v
                    })

                    if (cmdArgs)
                        commands.push({ dir:dir, cmd:'anycmd'+cmdArgs })
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
                        args:{ command:commands[idx], config:js.params.config },
                        realJob: jw=> tj.exec(jw, 'shuf -i 1-5 -n 1 | xargs sleep'
                                              /*jw.params.command.cmd.valueOf()*/)
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
            config: { timeout:500 }
        },
    },    
    tests: []
})
