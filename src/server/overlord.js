var fs = require('fs')

eval(fs.readFileSync('../app.js')+'')
eval(fs.readFileSync('../types/project.js')+'')

var messageHandlers = clientMessageHandlerFactory('O', 'Overlord', [], ()=>{})

var network = require('./network').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect('ws://' + config.server.wshost + ':' + config.server.wsport)
