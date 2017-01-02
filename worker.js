require('console-group').install()
console.debug = ()=> {}

var fs       = require('fs')
var os       = require('os')
var jff      = require('./src/job/job.js')
var jl       = require('./src/job/workflows.js')
var tj       = require('./src/job/toolJobs.js')
var messages = require('./src/messages.js')
var mvj      = require('./src/mvj.js')
q            = require('./src/q.js')
var config   = require('./src/config.js')
var sim      = require('./src/sim.js')
var tools    = require('./src/tools.js')
var pSet          = require('./modules/types/pSet.js')
var projectFolder = require('./modules/types/projectFolder.js')
var network       = require('./src/network/nodeWs').network

var jf = jff.jm()
eval(fs.readFileSync('src/app.js')+'')

app.init({     
     wsUrl:'ws://' + config.server.wshost + ':' + config.server.wsport,
     onInit:function(){
         var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'

         app.merge({
            type:'W',
            host:os.hostname(),
            binDir: 'bin/' + osDir + '/',
            network:{
                msgHandlers:clientMessageHandlerFactory('W', 'Worker', ['JS', 'POSIX64', 'Matlab'], ()=>{}),
            }
         })

         network.sim = sim
         network.connect(this.wsUrl.valueOf())
    }
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

    if (app.network[0].send)
    {
        var msg = messages.networkInfoMsg('model.network.' + app.clientId, workerInfo)
        var channelMsg = messages.channelMsg('Ws', msg)
        app.network[0].send(channelMsg)
    }

    osUtils.cpuFree(updateWorkerInfo)
}

// todo on connect
//osUtils.cpuFree(updateWorkerInfo)
