var fs = require('fs')

eval(fs.readFileSync('src/app.js')+'')
eval(fs.readFileSync('src/types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('O', 'Overlord', [], ()=>{})

var network = require('./src/network/nodeWs').network
network.onConnectionChanged = appOnNetworkStateChangeWithLog
network.onMessage = appOnMessageDefault
network.sim = sim
network.connect('ws://' + config.server.wshost + ':' + config.server.wsport)
