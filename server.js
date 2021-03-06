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
config   = require('./src/config.js')
var tools    = require('./src/tools.js')

var pSet          = require('./modules/types/pSet.js')

Mod     = require('./src/job/mod.js')
//project        = require('./src/job/project.js')


eval(fs.readFileSync('src/app.js')+'')
//eval(fs.readFileSync('src/types/project.js')+'')

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'
var serverId = 'S₀'

app.init({
    builtInTypes:{
        'IO<Folder>':require('./src/job/io.js').Folder,
        'IO<Ajax>':require('./src/job/io.js').File,
        'Network':require('./modules/types/nodeWsNetwork.js').network,
    },
    structure:{
        type:'S',
        host:os.hostname(),
        clientId:serverId,
        binDir: 'bin/' + osDir + '/',        
        ios:{
            hcsw:{
                type:'Network',
                port:config.server.wsport,
                [serverId]:{
                    type:'Server',
                    id:serverId, // damed
                    clientcount:0,
                    capabilitys:[],
                    osType:os.type(),
                    hostname:os.hostname()
                },
                stateChangeHandlers:serverProtocol.stateChangeHandlers,
                msgHandlers:serverProtocol.msgHandlers,
                connections:{}
            }
        }
    },
    onInit:j=> app.ios.hcsw.listen(j)
})

//-------------------------------------------------------------------------------------------

var connect = require('connect')
var serveStatic = require('serve-static')
connect().use(serveStatic('./')).listen(config.server.httpport)
