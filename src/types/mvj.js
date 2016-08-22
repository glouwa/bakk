(function(exports, inNode)
{
    exports.jm = undefined
    exports.onCommit = function() {}

    var Emitter = {
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
            this._callbacks = this._callbacks || {};
            var args = [].slice.call(arguments, 1), callbacks = this._callbacks['$' + event];

            if (callbacks) {
                callbacks = callbacks.slice(0);
                for (var i = 0, len = callbacks.length; i < len; ++i) {
                    if (this.path.startsWith('model.network') || this.path == 'model')
                    {}
                    else
                        console.debug('Emit: ' + this.path, arguments[1])
                    callbacks[i].apply(this, args)
                }
            }

            return this
        }
    }

    //-----------------------------------------------------------------------------------------

    function isPrimitive(o) // string || String
    {
        return typeof o === 'boolean'
            || typeof o === 'number'
            || typeof o === 'string'
            || typeof o === 'undefined'
            || typeof o === 'null'
            || typeof o === 'function'
    }

    function box(content)
    {      
        if (isPrimitive(content))
        {
            var box = typeof content === 'function'
                    ? function() { return box.value.apply(this, arguments) }
                    : {}

            Object.defineProperty(box, 'isLeafType',{ writable:true, value:true })
            Object.defineProperty(box, 'value',     { writable:true, value:content })
            Object.defineProperty(box, 'valueOf',   { writable:true, value:function()
            {
                return this.value !== undefined
                     ? this.value.valueOf()
                     : undefined
            }})
            Object.defineProperty(box, 'toJSON', { writable:true, value:function()
            {
                if (this.value === undefined)
                    return
                return this.value//.valueOf()
            }})
            Object.defineProperty(box, 'toString', { writable:true, value:function()
            {
                if (this.value === undefined)
                    return 'undefined'
                return this.value.toString()
            }})

            return box
        }
        else
        {
            var box = content instanceof Array ? [] : {}
            if (content.type == 'Job')
            {
                box.__proto__ = exports.jm.jobPrototype

                if(content.isProxy)
                    exports.jm.remoteJobs[content.id.valueOf()] = box
            }

            if (content.type == 'Folder' && app.model.registry.types.folder)
                box.__proto__ = app.model.registry.types.folder

            if (content.type == 'Set<FragmentFolder>' && app.model.registry.types.fragmentFolderSet)
                box.__proto__ = app.model.registry.types.fragmentFolderSet

            if (content.type == 'FragmentFolder' && app.model.registry.types.fragmentFolder)
                box.__proto__ = app.model.registry.types.fragmentFolder

            return box
        }
    }

    function path2wrapper(path, obj)
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

    // FIND BY ID
    exports.traverse = function(path, obj)
    {
        var current = obj
        var nodes = path.split('.')
        for (var i = 0; i < nodes.length; i++)
            current = current[nodes[i]]

        console.assert(i == nodes.length)
        return current
    }


    //-----------------------------------------------------------------------------------------

    function update(a1, a2)
    {
        var pathUsed = arguments.length === 2 ? true:false
        var wdiff = pathUsed ? path2wrapper(a1, a2) : a1
        var path = pathUsed ? a1 : this.path

        if (!path.startsWith('model.network'))
            console.log('%cMerging u ' + path, '', wdiff)

        var node = this.merge(wdiff)
    }


    function commit(a1, a2)
    {
        var pathUsed = arguments.length === 2 ? true:false
        var wdiff = pathUsed ? path2wrapper(a1, a2) : a1
        var path = pathUsed ? a1 : this.path

        console.log('%cMerging c '+ path, '', wdiff)

        var node = this.merge(wdiff)

        var path = pathUsed ? a1 : node.path
        var diff = pathUsed ? a2 : a1

        exports.onCommit(path, diff)
    }


    function merge(diff, noEvents, inShadow)
    {
        console.assert(this.path != '' || !this.path)
        var changes = { diff:diff, sender:this, newMembers:{}, deletedMembers:{} }

        if (this.isLeafType) {
            console.assert(isPrimitive(diff) || diff.isLeafType,           'Model is primitive but diff is not', this, diff)

            this.value = isPrimitive(diff)
                       ? diff
                       : diff.value
            /*if (isPrimitive(diff)) this.value = diff else this.value = diff.value*/
        }

        else diff.forEach((v, id, idx)=> { // [] or {}
            console.assert(!isPrimitive(diff),                             'Model is not primitive but diff is')
            console.assert(!(v === 'deadbeef' && !this[id]),               'Trying to delete non existing member ' + id)

            if (v === 'deadbeef') {
                changes.deletedMembers[id] = this[id]
                this[id].destroyRecursive(this)
                delete this[id]
            }

            else if (!this[id]) {
                var p = this.path == '' ? id : (this.path + '.' + id)

                this[id] = exports.model(p, v, noEvents, inShadow)
                changes.newMembers[id] = this[id]
            }

            else {
                this[id].merge(v, noEvents, inShadow) // RECURSION

                if (this[id].shadowed && !noEvents) {
                    changes.newMembers[id] = this[id]
                    this[id].shadowed = false
                }
            }
        })

        if (!noEvents)
            this.emit('change', changes)

        return this
    }


    function destroyRecursive(parent, noEvents, inShadow)
    {
        var changes = { diff:{}, sender:this, newMembers:{}, deletedMembers:{} }

        this.forEach((v, id, idx)=> {
            // todo: check ownership
            v.destroyRecursive(this)
            changes.deletedMembers[id] = this[id]
        })

        if (!noEvents)
            this.emit('change', changes)
    }


    exports.model = function(path, initDiff)
    {
        //console.assert(!noEvents)
        //console.assert(!inShadow)

        if (initDiff === undefined)
            console.warn('initDiff is undefined', path)

        else if (initDiff.path)
            return initDiff //console.trace('using boxedObj as initDiff\n' + initDiff.path +'\n'+ path)

        var model = box(initDiff)        

        Object.defineProperty(model, 'path',             { writable:true, value:path })
        Object.defineProperty(model, 'diff',             { writable:true, value:{} })
        Object.defineProperty(model, 'changes',          { writable:true, value:{} })

        Object.defineProperty(model, 'shadowed',         { writable:true, value:false })

        Object.defineProperty(model, '_callbacks',       { value:{} })
        Object.defineProperty(model, 'on',               { value:Emitter.on }) //mixin(model)
        Object.defineProperty(model, 'off',              { value:Emitter.off })
        Object.defineProperty(model, 'emit',             { value:Emitter.emit })

        Object.defineProperty(model, 'add',              { writable:true, value:null })
        Object.defineProperty(model, 'update',           { writable:true, value:update })
        Object.defineProperty(model, 'commit',           { writable:true, value:commit })
        Object.defineProperty(model, 'merge',            { writable:true, value:merge })
        Object.defineProperty(model, 'destroyRecursive', { writable:true, value:destroyRecursive })

        model.merge(initDiff)

        return model
    }    
})
(typeof exports === 'undefined' ? this['mvj']={} : exports, typeof exports !== 'undefined')
