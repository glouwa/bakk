require( 'console-group' ).install()
console.debug = ()=> {}

fs       = require('fs')
os       = require('os')
path     = require('path')

jf      = require('./src/job/job.js')
workflows       = require('./src/job/workflows.js')
var tj       = require('./src/job/toolJobs.js')
box      = require('./src/box.js')
var mvj      = require('./src/mvj.js')
q            = require('./src/q.js')
var config   = require('./src/config.js')
var tools    = require('./src/tools.js')
var pSet          = require('./modules/types/pSet.js')

Mod     = require('./src/job/mod.js')

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'

eval(fs.readFileSync('src/app.js')+'')

app.init({
    builtInTypes:{
        'Network':require('./modules/types/nodeWsNetwork.js').network,
    },
    structure:{
        type:'O',
        host:os.hostname(),        
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
                    onServerHallo: (c, parsed)=> clientProtocol.msgHandlers.onServerHallo(null, 'Overlord', [], c, parsed, os.type()),
                    onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
                    onReload:      (c, parsed)=> {}
                },
                connections:{}
            }
        }
    },
    onInit:j=> app.ios.hcsw['⛓'](j)
})

