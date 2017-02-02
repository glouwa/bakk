 
(function(exports)
{
    //exports.jm = undefined
    exports.onCommit = function() {}

    exports.Emitter = {
        on: function(event, fn)
        {
            this._callbacks = this._callbacks || {};
            (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
            return this;
        },
        off: function(event, fn)
        {
            this._callbacks = this._callbacks || {};

            // all
            if (0 == arguments.length) {
                this._callbacks = {};
                return this;
            }

            // specific event
            var callbacks = this._callbacks['$' + event];
            if (!callbacks) return this;

            // remove all handlers
            if (1 == arguments.length) {
                delete this._callbacks['$' + event];
                return this;
            }

            // remove specific handler
            var cb;
            for (var i = 0; i < callbacks.length; i++) {
                cb = callbacks[i];
                if (cb === fn || cb.fn === fn) {
                    callbacks.splice(i, 1);
                    break;
                }
            }
            return this;
        },
        emit: function(event)
        {
            this._callbacks = this._callbacks || {}
            var args = [].slice.call(arguments, 1)
            var callbacks = this._callbacks['$' + event]

            /*
            if (this.path.startsWith('model.network') || this.path == 'model') {}
            else {
                if (callbacks && callbacks.length > 0) {
                    q.logGroup('Emit '+event+' ⨉' + callbacks.length +': ' + this.path.valueOf(), 'white', ()=> {
                        console.debug('diff: '+JSON.stringify(arguments[1].diff, 0, 4))
                        console.debug('new: '+JSON.stringify(arguments[1].newMembers, 0, 4))
                        console.debug('deleted: '+JSON.stringify(arguments[1].deletedMembers, 0, 4))
                        console.debug('changes: '+JSON.stringify(Object.keys(arguments[1].changedMembers), 0, 4))
                    })
                }
            }*/

            if (callbacks) {
                callbacks = callbacks.slice(0)
                for (var i = 0, len = callbacks.length; i < len; ++i)
                    callbacks[i].apply(this, args)
            }

            return this
        }
    }

    //-----------------------------------------------------------------------------------------

    exports.isPrimitive = function isPrimitive(o) // string || String
    {
        return typeof o === 'boolean'
            || typeof o === 'number'
            || typeof o === 'string'
            || typeof o === 'undefined'
            || typeof o === 'null'
            || typeof o === 'function'
    }

    exports.updateJsProto = function updateJsProto(type, box)
    {
        if(!type)
            return // primitives hav not type member, and need no proto

        if (!app)
            console.log('app is unedf and requesting type ' + type + box.path)

        if (app.core.types[type] == box)
            return

        if (app.core.types[type])
            box.__proto__ = app.core.types[type] // protoy sind auch beboxed
    }

    exports.box = function box(content, path)
    {
        console.assert(!content.path || content.linkThatShit, 'boxed obj already has a path member')

        if (exports.isPrimitive(content)) {
            var box = typeof content === 'function'
                    ? function() { return box.value.apply(this, arguments) }
                    : {}

            Object.defineProperty(box, 'isLeafType',{ writable:true, value:true })
            Object.defineProperty(box, 'value',     { writable:true, value:content })
            Object.defineProperty(box, 'valueOf',   { writable:true, value:function() {
                return this.value !== undefined
                     ? this.value.valueOf()
                     : undefined
            }})
            Object.defineProperty(box, 'toJSON', { writable:true, value:function() {
                if (this.value === undefined)
                    return
                return this.value
            }})
            Object.defineProperty(box, 'toString', { writable:true, value:function() {
                if (this.value === undefined)
                    return 'undefined'
                return this.value.toString()
            }})
            return box
        }
        else {
            var box = content instanceof Array ? [] : {}

            if (content.type == 'Job') {
                box.__proto__ = jf.jobPrototype

                if(content.isProxy && !path.startsWith('tmp'))
                    jf.remoteJobs[content.id.valueOf()] = box
            }

            exports.updateJsProto(content.type, box)
            return box
        }
    }
})
(typeof exports === 'undefined' ? this['box']={} : exports)
