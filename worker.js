require('console-group').install()
console.debug = ()=> {}

fs       = require('fs')
os       = require('os')
path     = require('path')

jf     = require('./src/job/job.js')
workflows       = require('./src/job/workflows.js')
var tj       = require('./src/job/toolJobs.js')
box      = require('./src/box.js')
var mvj      = require('./src/mvj.js')
q            = require('./src/q.js')
config   = require('./src/config.js')
var tools    = require('./src/tools.js')
var pSet          = require('./modules/types/pSet.js')

Mod     = require('./src/job/mod.js')

//project        = require('./src/job/project.js')

eval(fs.readFileSync('src/app.js')+'')

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'
//var givenIdx = process.argv[2]
//var givenId = 'W'+Number(givenIdx).toSubscript()
var givenId = process.argv[2]

app.init({
    builtInTypes:{
        'Network':require('./modules/types/nodeWsNetwork.js').network,
    },
    structure:{
        type:'W',
        host:os.hostname(),
        clientId:givenId,
        binDir: 'bin/' + osDir + '/',
        ios:{
            hcsw:{
                type:'Network',
                endpoint:'ws://' + config.server.wshost + ':' + config.server.wsport,
                stateChangeHandlers:{
                    onConnected:    c=> {},
                    onDisconnected: c=> clientProtocol.stateChangeHandlers.onDisconnected(c)
                },
                msgHandlers:{
                    onServerHallo: (c, parsed)=> clientProtocol.msgHandlers.onServerHallo(givenId, 'Worker', ['JS', 'POSIX64', 'Matlab'], c, parsed, os.type()),
                    onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
                    onReload:      (c, parsed)=> {}
                },
                connections:{}
            }
        }
    },
    onInit:j=> app.ios.hcsw['⛓'](j)

})

//-------------------------------------------------------------------------------------------

var osUtils  = require('os-utils')

function formatBytes(bytes, decimals)
{
   if(bytes == 0) return '0 Byte'
   var k = 1024; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + sizes[i];
}

var workerInfo = {
    //hostname:os.hostname(),
    //osType:os.type(),
    totalMem:formatBytes(os.totalmem(), 0),
    totalCpus:osUtils.cpuCount() + 'cores',
    freeMemPercent:'0%',
    freeCpuPercent:'0%',
    netInBytes:'0',
    netOutBytes:'0'
}

function updateWorkerInfo(pf)
{
    workerInfo.freeMemPercent = (osUtils.freememPercentage()*100).toFixed(0)+'%'
    workerInfo.freeCpuPercent = (pf*100).toFixed(0)+'%'

    if (app.ios.hcsw['S₀'].send)
        app.ios.hcsw['S₀'].send({
            type:'Ws',
            payload:{
                type:'NetworkInfo',
                path:'model.network.' + app.clientId,
                diff:workerInfo
            }
        })

    osUtils.cpuFree(updateWorkerInfo)
}

// todo on connect
//osUtils.cpuFree(updateWorkerInfo)
