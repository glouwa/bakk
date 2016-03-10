var config   = require('../config.js')
var sim      = require('../sim.js')
var messages = require('../messages.js')
var jff      = require('../job/job.js')
var jl       = require('../job/jobLogic.js')
var tj       = require('../job/toolJobs.js')
var tools    = require('../tools.js')
var mvj      = require('../types/mvj.js')

sim.config = config.clientDefaultSimConfig

var jf = jff.jm()
jf.workerId = undefined
jf.nextFreeId = 0
jf.jl = jl

tj.jm = jf
tj.config = config
mvj.jm = jf

//-------------------------------------------------------------------------------------------

var app = mvj.model('',{})
app.clientId = undefined
//app.networkInfo = model.networkModel(sim, app)

// called by Net --------------------------------------------------------------------------

app.onNetworkStateChange = function(state, connection)
{
    var stateHandlers =
    {
        onConnected: function()
        {
        },

        onDisconnected: function()
        {
        }
    }
    stateHandlers['on'+state]()
}

app.onMessage = function(c, parsed)
{
    var channelHandlers =
    {
        onWsMessage: function(c, parsed)
        {
            sim.log('app', 'log', '⟵', parsed)

            var messageHandlers =
            {
                onServerHallo: function(c, parsed)
                {                    
                    app.clientId = parsed.diff.clientId
                    jf.workerId = 'W' + Number(app.clientId).toSubscript()

                    var mynodeInfo = {
                        type: 'Worker',
                        id: jf.workerId,
                        capabilitys: ['JS', 'POSIX64', 'Matlab'],
                        simconfig: config.clientDefaultSimConfig,
                    }

                    //app.networkInfo.update(mynodeInfo)
                    var msg = messages.networkInfoMsg('model.network.'+app.clientId, mynodeInfo)
                    var channelMsg = messages.channelMsg('Ws', msg)
                    network.connections[0].send(channelMsg)
                },

                onNetworkInfo: function(c, parsed)
                {
                    //app.networkInfo.update(parsed.nodes)
                },

                onReload: function(c, parsed)
                {
                    // ?? soll das server machen?
                }

            }['on'+parsed.type](c, parsed)
        },

        onJobMessage: function(c, parsed)
        {
            jf.onReceive(c, parsed, code=> eval(code), app)
        }

    }['on'+parsed.type+'Message'](c, parsed.payload)
}

//-------------------------------------------------------------------------------------------

function formatBytes(bytes, decimals)
{
   if(bytes == 0) return '0 Byte'
   var k = 1024; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + sizes[i];
}

var network = require('./workerNetwork').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect('ws://' + config.server.wshost + ':' + config.server.wsport)

var os  = require('os')
var osUtils  = require('os-utils')

var workerInfo = {
    hostname:os.hostname(),
    osType:os.type(),
    totalMem:formatBytes(os.totalmem(), 0),
    totalCpus:osUtils.cpuCount() + 'cores',

}

function updateWorkerInfo(pf)
{
    workerInfo.freeMemPercent = (osUtils.freememPercentage()*100).toFixed(0)+'%'
    workerInfo.freeCpuPercent = (pf*100).toFixed(0)+'%'

    var msg = messages.networkInfoMsg('model.network.' + app.clientId, workerInfo)
    var channelMsg = messages.channelMsg('Ws', msg)
    network.connections[0].send(channelMsg)

    osUtils.cpuFree(updateWorkerInfo)
}

osUtils.cpuFree(updateWorkerInfo)
