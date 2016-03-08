(function(exports, inNode)
{
    exports.jm = undefined
    exports.onCommit = function() {}

    var Emitter = {}
    Emitter.on = function(event, fn)
    {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
        return this;
    };

    Emitter.off = function(event, fn)
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
    };

    Emitter.emit = function(event)
    {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1), callbacks = this._callbacks['$' + event];

        if (callbacks) {
            callbacks = callbacks.slice(0);
            for (var i = 0, len = callbacks.length; i < len; ++i)
                callbacks[i].apply(this, args)
        }

        return this;
    };

    function isPrimitive(o) // string || String
    {
        return typeof o === 'boolean'
            || typeof o === 'number'
            || typeof o === 'string'
            || typeof o === 'undefined'
            || typeof o === 'null'
            || typeof o === 'function'
    }

    exports.primitiveModel = function(i)
    {
        var primitiveBox = typeof i === 'function'
                         ? function() { return primitiveBox.value.apply(this, arguments) }
                         : {}

        Object.defineProperty(primitiveBox, 'isLeafType',{ writable:true, value:true })
        Object.defineProperty(primitiveBox, 'value',     { writable:true, value:i })
        Object.defineProperty(primitiveBox, 'valueOf',   { writable:true, value:function()
        {
            return this.value !== undefined
                 ? this.value.valueOf()
                 : undefined
        }})
        Object.defineProperty(primitiveBox, 'toJSON', { writable:true, value:function()
        {
            if (this.value === undefined)
                return
            return this.value//.valueOf()
        }})
        Object.defineProperty(primitiveBox, 'toString', { writable:true, value:function()
        {
            if (this.value === undefined)
                return 'undefined'
            return this.value.toString()
        }})

        return primitiveBox
    }

    function box(obj)
    {      
        if (isPrimitive(obj))
        {
            return exports.primitiveModel(obj)
        }
        else
        {
            var boxed = obj instanceof Array ? [] : {}
            if (obj.type == 'Job')
            {
                boxed.__proto__ = exports.jm.jobPrototype

                if(obj.isProxy)
                    exports.jm.remoteJobs[obj.id.valueOf()] = boxed
            }

            if (obj.type == 'Folder' && app.model.registry.types.folder)
                boxed.__proto__ = app.model.registry.types.folder

            if (obj.type == 'Set<FragmentFolder>' && app.model.registry.types.fragmentFolderSet)
                boxed.__proto__ = app.model.registry.types.fragmentFolderSet

            if (obj.type == 'FragmentFolder' && app.model.registry.types.fragmentFolder)
                boxed.__proto__ = app.model.registry.types.fragmentFolder

            return boxed
        }
    }

    exports.path2wrapper = function(path, obj)
    {
        var result = {}
        var current = result
        var nodes = path.split('.')
        for (var i = 0; i < nodes.length-1; i++)
        {
            current[nodes[i]] = {}
            current = current[nodes[i]]
        }
        console.assert(i == nodes.length-1 )
        current[nodes[i]] = obj
        return result
    }

    exports.traverse = function(path, obj)
    {
        var current = obj
        var nodes = path.split('.')
        for (var i = 0; i < nodes.length; i++)
            current = current[nodes[i]]

        console.assert(i == nodes.length)
        return current
    }

    exports.model = function(path, initDiff, noEvents, inShadow)
    {
        if (initDiff === undefined)        
            console.warn('initDiff is undefined', path)

        else if (initDiff.path)
            return initDiff //console.trace('using boxedObj as initDiff\n' + initDiff.path +'\n'+ path)

        var model = box(initDiff)        

        Object.defineProperty(model, 'path', { writable:true, value:path })
        Object.defineProperty(model, 'shadowed', { writable:true, value:false })
        Object.defineProperty(model, 'on', { value:Emitter.on }) //mixin(model)
        Object.defineProperty(model, 'off', { value:Emitter.off })
        Object.defineProperty(model, 'emit', { value:Emitter.emit })
        Object.defineProperty(model, '_callbacks', { value:{} })
        Object.defineProperty(model, 'update', { writable:true, value: function(a1, a2)
        {            
            var pathUsed = arguments.length === 2 ? true:false
            var wdiff = pathUsed ? exports.path2wrapper(a1, a2) : a1
            var node = model.merge(wdiff)
        }})
        Object.defineProperty(model, 'commit', { writable:true, value: function(a1, a2)
        {
            var pathUsed = arguments.length === 2 ? true:false
            var wdiff = pathUsed ? exports.path2wrapper(a1, a2) : a1
            var node = model.merge(wdiff)
            var path = pathUsed ? a1 : node.path
            var diff = pathUsed ? a2 : a1
            exports.onCommit(path, diff)
        }})
        Object.defineProperty(model, 'merge', { writable:true, value: function(diff, noEvents, inShadow)
        {
            var changes = { diff:diff, sender:model, newMembers:{}, deletedMembers:{} }

            if (model.isLeafType)
            {                
                console.assert(isPrimitive(diff) || diff.isLeafType,                        'Model is primitive but diff is not', model, diff)

                if (isPrimitive(diff))
                    model.value = diff
                else
                    model.value = diff.value
            }
            else diff.forEach(function(v, id, idx) // [] or {}
            {                
                console.assert(!isPrimitive(diff),                                          'Model is not primitive but diff is')
                console.assert(!(v === 'deadbeef' && !model[id]),                           'Trying to delete non existing member ' + id)

                if (v === 'deadbeef')
                {
                    changes.deletedMembers[id] = model[id]
                    model[id].destroyOwn(model)
                    delete model[id]
                }
                else if (!model[id])
                {                    
                    var p = model.path == '' ? id : (model.path + '.' + id)
                    model[id] = exports.model(p, v, noEvents, inShadow)
                    changes.newMembers[id] = model[id]
                }
                else
                {
                    model[id].merge(v, noEvents, inShadow) // RECURSION

                    if (model[id].shadowed && !noEvents)
                    {
                        changes.newMembers[id] = model[id]
                        model[id].shadowed = false
                    }
                }
            })

            if (!noEvents)
                model.emit('change', changes)

            return model
        }})
        Object.defineProperty(model, 'destroyOwn', { writable:true, value: function(parent, noEvents, inShadow)
        {
            var changes = { diff:{}, sender:model, newMembers:{}, deletedMembers:{} }

            model.forEach((v, id, idx)=>
            {
                v.destroyOwn(model)
                changes.deletedMembers[id] = model[id]
            })

            if (!noEvents)
                model.emit('change', changes)
        }})

        var shadowRoot = noEvents && !inShadow
        model.merge(initDiff, noEvents, inShadow || shadowRoot)

        if (shadowRoot)
            model.shadowed = true

        return model
    }    
})
(typeof exports === 'undefined' ? this['mvj']={} : exports, typeof exports !== 'undefined')
