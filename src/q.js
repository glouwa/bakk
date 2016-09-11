 (function(exports, inNode)
{
    exports.depth = -1
    exports.app = undefined
    exports.addRoot = function(desc, a)
    {
        this.depth++
        this.logGroup(desc, 'black', ()=> {
            try { a() }
            catch(e){ console.error(e.stack) }

            if (this.depth === 0)
                app.commit(desc)
        })
        this.depth--
    }
    exports.addJob = function(ttype, j, action) // e2le :D       alias hier is job bekannt
    {
        var cmap = { call:'#FFD900', update:'#A5F7B8', cancel:'#EAB0F1', ret:'#FF0000' }
        var color = cmap[ttype] || 'black'

        this.depth++
        this.logGroup(ttype + ' ' + j.path + ' ' + j.desc, color, ()=> {
            try { action() }
            catch(e) {
                console.error('local error: ' + e.stack)
                j.onLocalError(e.message === 'recoverable' ? 'recoverable' : 'fatal', e.stack)
            }

            if (this.depth === 0)
                app.commit(ttype)
        })
        this.depth--
    }

    exports.logGroup = function(desc, bgc, a) {
        var css = 'background-color:'+bgc+';'
        if (bgc == 'black') css += ';text-decoration:underline;  color:white'

        if (inNode)
            console.group(desc)
        else
            console.groupCollapsed('%c ***' + desc, css)
        a()
        console.groupEnd()
    }
    exports.logGroup = (d, bgc, a)=> a()
})
(typeof exports === 'undefined' ? this['q']={} : exports, typeof exports !== 'undefined')
