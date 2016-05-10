var fs = require('fs')

eval(fs.readFileSync('../app.js')+'')
eval(fs.readFileSync('../types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('C', 'Client', [], ()=> aProjectJob().call())

function aProjectJob()
{    
    app.model.update({
        type: 'Model',
        jobs: { type:'Set<Job>' },
        store: { type:'Store' },
        projects: // fileset(path, 'Set<Project>', (filename)=> project.ctor(filename))
        {
            type:'Set<Project>',
            'ℙ Find prime numbers with C++ on workers':project('../../projects/' + process.argv[2] + '.js', 'noWiew')
        },
        registry:
        {
            type:'Registry',
            config: config,
            types: { type:'Set<Type>' }
        },
    })

    function printjobUpdate(j)
    {
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(j.state.progress.valueOf().toFixed(2))
    }

    function printjobResult(j)
    {
        var workTimeMs = j.state.lastModification.valueOf() - j.state.callTime.valueOf()
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        console.log(j.state.detail + ' ' + workTimeMs + 'ms ' + j.state.log.valueOf())
        fs.appendFileSync('100' + process.argv[2] + '.csv', workTimeMs + '\n')
        process.exit()
    }

    return rootJob({
        desc:'cli',
        onCall:j=> app.model.projects['ℙ Find prime numbers with C++ on workers']['▸'](j),
        onUpdate:j=> printjobUpdate(j),
        onReturn:j=> printjobResult(j)
    })
}

var network = require('./network').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect(app.wsUrl.valueOf())


