var fs = require('fs')

eval(fs.readFileSync('src/app.js')+'')
eval(fs.readFileSync('src/types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('W', 'Worker', ['JS', 'POSIX64', 'Matlab'], ()=>{})

//-------------------------------------------------------------------------------------------

var network = require('./src/network/nodeWs').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect('ws://' + config.server.wshost + ':' + config.server.wsport)

//-------------------------------------------------------------------------------------------

var os  = require('os')
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

    if (network.connections[0].send)
    {
        var msg = messages.networkInfoMsg('model.network.' + app.clientId, workerInfo)
        var channelMsg = messages.channelMsg('Ws', msg)
        network.connections[0].send(channelMsg)
    }

    osUtils.cpuFree(updateWorkerInfo)
}

osUtils.cpuFree(updateWorkerInfo)
