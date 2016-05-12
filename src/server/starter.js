var fs = require('fs')
var archy = require('archy');

eval(fs.readFileSync('../app.js')+'')
eval(fs.readFileSync('../types/project.js')+'')
eval(fs.readFileSync('../types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('C', 'Client', [], ()=> aProjectJob().call())

function jobToArchyNode(j)
{
    var line = ''
    if (j.state)
    {
        if (j.state.type == 'returned')
            line += j.state.detail + ' '
        else
            line += ~~(j.state.progress.valueOf()*100) + '% '

        if (j.state.lastModification && j.state.callTime)
            line += formatTimespan(j.state.lastModification.valueOf() - j.state.callTime.valueOf()) + ' '
    }

    line += '  ' + j.desc + ': (…) → '

    if (j.state)
        line += j.state.log.valueOf()

    var archyNode = { label:line, nodes:[] }
    if (j.subjobs)
        j.subjobs.forEach((v, k)=> archyNode.nodes.push(jobToArchyNode(v)))
    return archyNode
}

function formatTimespan(ms)
{
    if (ms > 1000*60*60)
        return ~~(ms/(1000*60*60)) + 'h'
    else if (ms > 1000*60)
        return ~~(ms/(1000*60)) + 'm'
    else if (ms > 1000)
        return (ms/1000).toFixed(1) + 's'
    else
        return ms + 'ms'
}

function aProjectJob()
{    
    app.model.update({
        type: 'Model',
        jobs: { type:'Set<Job>' },
        store: { type:'Store' },
        network: { type:'Network' },
        projects: // fileset(path, 'Set<Project>', (filename)=> project.ctor(filename))
        {
            type:'Set<Project>',
            'cliProject':project('../../projects/' + process.argv[2] + '.js', 'noWiew')
        },
        registry:
        {
            type:'Registry',
            config: config,
            types: { type:'Set<Type>' }
        },
    })

    var lastTreeSize = undefined
    var startTime = new Date().toLocaleString()

    function printjobUpdate(j)
    {
        if (lastTreeSize) {
            process.stdout.moveCursor(0, -lastTreeSize)
            process.stdout.clearScreenDown()
        }

        var archyRootNode = { label:startTime }
        archyRootNode.nodes = [ 'ok Connected', jobToArchyNode(j) ]
        var treeStr = archy(archyRootNode)
        lastTreeSize = treeStr.split(/\r\n|\r|\n/).length
        console.log(treeStr)
    }

    function printjobResult(j)
    {     
        if (process.argv[3])
        {
            var jobToMeasure = j.subjobs[0]

            var workTimeMs = j.state.lastModification.valueOf()
                           - j.state.callTime.valueOf() + ' '
            fs.appendFileSync(process.argv[3], workTimeMs + '\n')

            var nodeIds = Object.keys(app.model.network)
            var nodeCount = nodeIds.length

            console.log(nodeIds)
            console.log(app.model.network)

            console.log('   → ' + process.argv[3] + ' += '
                        + workTimeMs + 'ms, '
                        + nodeCount + 'nodes, ' +
                        + nodeIds.toString() + '\n\n')
        }
        process.exit(0)
    }

    return rootJob({
        desc:'cli',
        onCall:j=> app.model.projects['cliProject']['▸'](j),
        onUpdate: j=> printjobUpdate(j),
        onReturn: j=> printjobResult(j)
    })
}

var network = require('./network').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect(app.wsUrl.valueOf())


