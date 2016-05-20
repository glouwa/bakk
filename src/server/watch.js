var forever = require('forever-monitor');

console.log(process.argv)

var child = new (forever.Monitor)(process.argv[2], {
    silent: false,
    spinSleepTime: process.argv[2] == 'server.js' ? 1 : 1000,
    args: []
});

child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});

child.start();
