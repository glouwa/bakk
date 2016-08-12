(function(exports, shellMode)
{
    exports.config = undefined // will be set on init, and if somebody changes it on the network panel

    exports.isEnabled = function(test)
    {
        return this.config && this.config[test] && this.config[test].active.valueOf()
    }

    exports.pointOfFailure = function(pointName, c, p)
    {
        if (this.config && this.config.disconnect && this.config.disconnect.active.valueOf())
            if (pointName === this.config.disconnect.pof.valueOf())
                c.close()

        if (this.config && this.config.exception && this.config.exception.active.valueOf())
            if (pointName === this.config.exception.pof.valueOf())
                throw new Error(this.config.exception.value.valueOf())

        if (this.config && this.config.delegate && this.config.delegate.active.valueOf())
            if (pointName === 'beforeWork')
                p.payload.type = 'Delegate'
    }

    exports.delayedLoop = function(j, act, max, action)
    {
        function simActionWrapper()
        {
            if (act >= max/2)
            {
                exports.pointOfFailure('atWork')
                if (exports.isEnabled('stopWork'))
                    return
            }
            action(act)
        }

        if (this.isEnabled('delayed') && j.exception2localError)
        {
            setTimeout(function()
            {
                j.exception2localError(function()
                {
                    simActionWrapper()

                    if (j.state.detail == 'canceled')
                        return//j.ret('canceled', 'canceled at' + act + ' of ' + max)

                    else if (act < max)
                        exports.delayedLoop(j, act+1, max, action)

                    else
                        j.ret('ok', 'all elements visited')
                })
            },
            exports.config.delayed.value.valueOf())
        }
        else
        {
            for (; act <= max && j.state.detail != 'canceled'; act++)
                simActionWrapper()

            if (j.state.detail.valueOf() == 'canceled')
                return//j.ret('canceled', 'canceled at ' + act + ' of ' + max)

            else
                j.ret('ok', 'all elements visited')
        }
    }

    exports.log = function()
    {
        var argArray = Array.prototype.slice.call(arguments)
        var category = argArray[0]
        var level = argArray[1]
        var desc = category

        if (shellMode)
            desc = '\n------------------------------------------------------------\n' + category

        if (!this.config || (this.config['log' + category] && this.config['log' + category].active.valueOf()))
        {
            var remainingsArgs = JSON.parse(JSON.stringify(argArray.slice(2)))
            var logArgs = [desc].concat(remainingsArgs)
            console[level].apply(console, logArgs)
        }
    }     
})
(typeof exports === 'undefined' ? this['sim']={} : exports, typeof exports !== 'undefined')
