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

    function isPrimitive(o) // string || String
    {
        return typeof o === 'boolean'
            || typeof o === 'number'
            || typeof o === 'string'
            || typeof o === 'undefined'
            || typeof o === 'null'
            || typeof o === 'function'
    }

    function updateJsProto(type, box)
    {
        if (type == 'Folder' && app.registry.types.folder)
            box.__proto__ = app.registry.types.folder

        if (type == 'Set<FragmentFolder>' && app.registry.types.fragmentFolderSet)
            box.__proto__ = app.registry.types.fragmentFolderSet

        if (type == 'FragmentFolder' && app.registry.types.fragmentFolder)
            box.__proto__ = app.registry.types.fragmentFolder
    }

    function box(content, path)
    {      
        console.assert(!content.path, 'boxed obj already has a path member')

        if (isPrimitive(content)) {
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
                /*if (this.isLink) {
                    console.log('skipping JSON ' + this.path)
                    return
                }*/
                if (this.value === undefined)
                    return
                return this.value//.valueOf()
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
                box.__proto__ = exports.jm.jobPrototype

                if(content.isProxy && !path.startsWith('model.tmp'))
                        exports.jm.remoteJobs[content.id.valueOf()] = box
            }
            updateJsProto(content.type, box)
            return box
        }
    }

    function path2wrapper(path, obj)
    {
        if (path === '')
            return obj

        var result = {}
        var current = result
        var nodes = path.split('.')
        for (var i = 0; i < nodes.length-1; i++) {
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

    function mergePath(path, diff) // merge by relative path
    {
        return this.merge(path2wrapper(path, diff))
    }

    function merge(diff)
    {
        //if (!path.startsWith('model.network'))
        q.logBigMsg('Merging ' + this.path.valueOf(), JSON.stringify(diff, 0, 4))
        var fullDiff = path2wrapper(this.path.valueOf(), diff)
        app.merge_(fullDiff)
    }

    function commit(msg)
    {
        q.logGroup('commit ' + this.path + ': ' + msg, 'white', ()=> {
            app.commit_()
            exports.onCommit(this.path, 0)
        })
    }

    function merge_(diff)
    {        
        console.assert(this.path != '' || !this.path)

        if (this.isLeafType) {
            console.assert(isPrimitive(diff) || diff.isLeafType, 'Model is primitive but diff is not', this, diff)

            attachChanges(this, diff)

            this.value =
            this.changes.diff = isPrimitive(diff)&&!diff.path ? diff : diff.value

            console.assert(!this.value.path, 'assigning value to box: ' + this.path)
        }

        else diff.forEach((v, id, idx)=> { // [] or {}
            if (typeof v !== 'undefined') {
                console.assert(!isPrimitive(diff), 'Model is not primitive but diff is')
                console.assert(!(v === 'deadbeef' && !this[id]), 'Trying to delete non existing member ' + id)

                attachChanges(this, diff)

                if (v === 'deadbeef' && this[id]) {                          // removing
                    this.changes.deletedMembers[id] = this[id]
                    this.changes.diff[id] = 'deadbeef'

                    this[id].destroyRecursive(this)
                    delete this[id]                                      
                }

                else if (typeof this[id] == "undefined") {                   // adding
                    var p = this.path == '' ? id : (this.path + '.' + id)
                    this[id] = exports.model(p, v)

                    if (this[id].path != p) {
                        this[id].isLink = this[id].isLink ? this[id].isLink.concat(p) : []
                        console.log('isLink=true ' + p +' --> '+ this[id].path)
                    }

                    this.changes.newMembers[id] = this[id]
                    if (!this.changes.diff[id]) //?
                        this.changes.diff[id] = this[id] // ja, das ganze?                      
                }

                else {                                                       // child changes (rekursion)
                    console.assert(this[id].merge_, id, this.path)
                    this[id].merge_(v)                                       // RECURSION

                    this.changes.changedMembers[id] = this[id]
                    if (this[id].changes)
                        this.changes.diff[id] = this[id].changes.diff
                }
            }
        })

        updateJsProto(this.type, this)
        return this
    }

    function commit_()
    {
        if (this.changes) {
            this.emit('commit', this.changes)
            this.changes.diff.forEach((v, id, idx)=> {
                if(this[id])
                    if (this[id].commit_)
                        this[id].commit_()
                    else
                       console.warn(this.path + '.' + id + ': has no commit')
                else
                    if (v != 'deadbeef')
                        console.warn(this.path + '.' + id + ': diff but no member')
            })
            this.emit('change', this.changes)
            this.emit('endCommit', this.changes)
            this.commitlog_.push(this.changes)
            this.changes = undefined
        }
        //else
        //    console.warn(this.path + ' should not be in chaged list (has no changes but is in diff of parent)')
    }

    function destroyRecursive(parent)
    {
        var changes = { diff:{}, sender:this, newMembers:{}, deletedMembers:{} }

        this.forEach((v, id, idx)=> {
            // todo: check ownership
            v.destroyRecursive(this)
            changes.deletedMembers[id] = this[id]
        })

        this.emit('destroy', changes)
    }

    function attachChanges(m, diff) {
        console.assert(typeof diff !== 'undefined')
        m.changes = m.changes || {
            diff:diff,
            sender:m,
            newMembers:{},
            deletedMembers:{},
            changedMembers:{}
        }
    }

    exports.model = function(path, initDiff)
    {
        if (initDiff === undefined)
            console.warn('initDiff is undefined', path)

        else if (initDiff.path)
            return initDiff //console.trace('using boxedObj as initDiff\n' + initDiff.path +'\n'+ path)

        var model = box(initDiff, path)

        Object.defineProperty(model, 'path',             { writable:true, value:path })
        Object.defineProperty(model, 'isLink',           { writable:true, value:undefined })

        Object.defineProperty(model, '_callbacks',       { value:{} })
        Object.defineProperty(model, 'on',               { value:Emitter.on }) //mixin(model)
        Object.defineProperty(model, 'off',              { value:Emitter.off })
        Object.defineProperty(model, 'emit',             { value:Emitter.emit })

        //Object.defineProperty(model, 'begin',            { writable:true, value:begin })
        Object.defineProperty(model, 'mergelog_',        { writable:true, value:[] })
        Object.defineProperty(model, 'commitlog_',       { writable:true, value:[] })
        Object.defineProperty(model, 'mergePath',        { writable:true, value:mergePath })
        Object.defineProperty(model, 'merge',            { writable:true, value:merge })
        Object.defineProperty(model, 'commit',           { writable:false, value:commit })

        Object.defineProperty(model, 'changes',          { writable:true })
        Object.defineProperty(model, 'lastcommit',       { writable:true })

        Object.defineProperty(model, 'merge_',           { writable:true, value:merge_ })
        Object.defineProperty(model, 'commit_',          { writable:false, value:commit_ })
        Object.defineProperty(model, 'destroyRecursive', { writable:true, value:destroyRecursive })

        model.merge_(initDiff)
        return model
    }
})
(typeof exports === 'undefined' ? this['mvj']={} : exports, typeof exports !== 'undefined')
