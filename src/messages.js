(function(exports)
{

    exports.channelMsg = function(type, msg)
    {
        var net = {}
        net.type = type
        net.payload = msg
        return net
    }

//-------------------------------------------------------------------------------------------

    exports.serverHalloMsg = function(cid, networkInfo)
    {
        var msg = {}
        msg.type = 'ServerHallo'
        msg.diff = {}
        msg.diff.clientId = cid        
        msg.diff.network = networkInfo
        return msg
    }

    exports.reloadMsg = function()
    {
        return { type:'Reload' }
    }

    exports.networkInfoMsg = function(path, diff)
    {
        var msg = {}
        msg.type = 'NetworkInfo'
        msg.path = path
        msg.diff = diff
        return msg
    }

    exports.pushMsg = function(path, diff)
    {
        var msg = {}
        msg.type = 'Push'
        msg.path = path
        msg.diff = diff
        return msg
    }

//-------------------------------------------------------------------------------------------

    exports.parse = function(str)
    {
        return JSON.parse(str)
    }

    exports.stringify = function(obj)
    {
        return JSON.stringify(obj, null, 4)
    }
})
(typeof exports === 'undefined' ? this['messages']={} : exports)
