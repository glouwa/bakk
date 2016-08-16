var fs = require('fs')

eval(fs.readFileSync('src/app.js')+'')
eval(fs.readFileSync('src/types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('O', 'Overlord', [], ()=>{})

var network = require('./src/network/nodeWs').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect('ws://' + config.server.wshost + ':' + config.server.wsport)
