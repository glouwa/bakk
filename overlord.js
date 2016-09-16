require( 'console-group' ).install()
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
     host:os.hostname(),
     wsUrl:'ws://' + config.server.wshost + ':' + config.server.wsport,
     onInit:function(){
         var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'

         app.merge({
            binDir: 'bin/' + osDir + '/',
            wsMessageHandlers:clientMessageHandlerFactory('O', 'Overlord', [], ()=>{}),
            networkStateChangeHandlers:consoleLogNetworkStateChangeHandler
         })

         network.sim = sim
         network.connect(this.wsUrl.valueOf())
    }
})

