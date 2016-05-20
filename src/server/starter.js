var fs = require('fs')
var archy = require('archy')
var logUpdate = require('log-update')

eval(fs.readFileSync('../app.js')+'')
eval(fs.readFileSync('../types/project.js')+'')
eval(fs.readFileSync('../types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('C', 'Client', [], ()=> aProjectJob().call())

var projectName = process.argv[2]
var iteration   = process.argv[3]
var outputFile  = process.argv[4]
var devCount    = process.argv[5]

function formatTimespan(ms) {
    if (ms > 1000*60*60)
        return ~~(ms/(1000*60*60)) + 'h'
    else if (ms > 1000*60)
        return ~~(ms/(1000*60)) + 'm'
    else if (ms > 1000)
        return (ms/1000).toFixed(1) + 's'
    else
        return ms + 'ms'
}

function getLastSubjobs(j) {
    var r
    j.subjobs.forEach((v, k, i)=> { r = v; })
    return r
}

function visitJob(j, visitor)
{
    visitor(j)
    if (j.subjobs)
        j.subjobs.forEach((v, k)=> visitJob(v, visitor))
}

function jobToArchyNode(j) {
    var line = ''
    if (j.state) {
        if (j.state.type == 'returned')
            line += config.getIcon(j.state) + ' '
        else
            line += ~~(j.state.progress.valueOf()*100) + '% '

        if (j.state.realWorker)
            line += j.state.realWorker + ' '

        if (j.state.lastModification && j.state.callTime)
            line += formatTimespan(jf.jobTime(j)) + '@' + j.state.callTimeloc

        if (j.state.lastRemoteModification && j.state.remoteCallTime)
            line += formatTimespan(jf.jobRemoteTime(j)) + '@' + j.state.remoteCallTimeloc + '@' + j.state.lastRemoteModificationloc
        else line += '      '
    }

    line += '  ' + j.desc + ': (…) → '

    if (j.state)
        line += j.state.log.valueOf()

    var archyNode = { label:line, nodes:[] }
    if (j.subjobs)
        j.subjobs.forEach((v, k)=> archyNode.nodes.push(jobToArchyNode(v)))
    return archyNode
}

function aProjectJob() {
    app.model.update({
        type: 'Model',
        jobs: { type:'Set<Job>' },
        store: { type:'Store' },
        network: { type:'Network' },
        projects: { // fileset(path, 'Set<Project>', (filename)=> project.ctor(filename))
            type:'Set<Project>',
            'cliProject':project('../../projects/' + projectName + '.js', 'noWiew')
        },
        registry: {
            type:'Registry',
            config: config,
            types: { type:'Set<Type>' }
        },
    })

    var pathPrefix = '../../log/'
    var startTime = new Date().toLocaleString()
    var workerPerDev = 3

    function printjobUpdate(j) {
        var headLabel = projectName + ', devCount=' + devCount + ', i=' + iteration + ', ' +  startTime
        var archyRootNode = { label:headLabel, nodes:[ 'ok Connected', jobToArchyNode(j) ] }
        var treeStr = archy(archyRootNode)
        logUpdate(treeStr)
    }

    function printjobResult(j) {
        if (outputFile) {            
            var jobToMeasure = getLastSubjobs(getLastSubjobs(j))
            var workerCount = jobToMeasure.output.workerCount.valueOf()

            if (workerCount == workerPerDev*devCount) {                
                // write worker runtime
                var workterTimes = ''
                var workerJobCount = 0
                visitJob(j, sj=> {
                    if (sj.state.realWorker.valueOf().startsWith('W')) {
                        workterTimes += jf.jobTime(sj) + ',\n'
                        workerJobCount++
                    }
                })
                fs.appendFileSync(pathPrefix + devCount + '-worker-' + outputFile, workterTimes)

                // write overall runtime
                var workTimeMs = jf.jobTime(jobToMeasure)
                var logline = devCount + ', ' + workerCount + ', ' + workTimeMs
                fs.appendFileSync(pathPrefix + devCount + '-all-' + outputFile, logline + '\n')
            }
            else
            {
                var errMsg = 'expected ' + workerPerDev*devCount + ' workers but got ' + workerCount + '\n'
                fs.appendFileSync(pathPrefix + 'error-log.txt', errMsg)
            }
        }
        logUpdate.done()
        process.exit(0)
    }

    var args = projectName=='overlordWorkers'
             ? { devCount:devCount, workerCount:workerPerDev, justStart:true}
             : undefined

    return rootJob({
        desc:'cli',
        onCall:   j=> app.model.projects['cliProject']['▸'](j, {}, args),
        onUpdate: j=> printjobUpdate(j),
        onReturn: j=> printjobResult(j)
    })
}

var network = require('./network').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect(app.wsUrl.valueOf())


