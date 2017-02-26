(function(exports)
{
    //exports.jm = undefined
    exports.onCommit = function() {}    

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
        var nodes = path.valueOf().split('.')
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

        var merge = {
            visitedObjects:{},
            firstTouchedObject:null
        }

        app.merge_(fullDiff, merge)
        return merge
    }

    function commit(msg)
    {
        q.logGroup('commit ' + this.path + ': ' + msg, 'white', ()=> {
            var commitDS = {}
            app.commit_()
            exports.onCommit(this.path, 0)
        })
    }

    //-----------------------------------------------------------------------------------------

    function merge_(diff, merge)
    {        
        //console.assert(this.path != '' || !this.path)
        console.assert(this.path || this.path === '')

        if (merge.visitedObjects[this.path]) {
            console.log('skipping ' + this.path)
            //console.log('  ' + JSON.stringify(Object.keys(merge.visitedObjects)))
            return
        }
        attachChanges(this, diff, merge)

        if (this.isLeafType) {
            console.assert(box.isPrimitive(diff) || diff.isLeafType, 'Model is primitive but diff is not', this, diff)

            this.value = box.isPrimitive(diff)&&!diff.path
                       ? diff
                       : diff.value

            this.changes.diff = this

            console.assert(!this.value.path, 'assigning value to box: ' + this.path)
        }

        else diff.forEach((v, id, idx)=> { // [] or {}
            if (typeof v !== 'undefined') {
                console.assert(!box.isPrimitive(diff), 'Model is not primitive but diff is')
                console.assert(!(v === 'deadbeef' && !this[id]), 'Trying to delete non existing member ' + id)

                if (v === 'deadbeef' && this[id]) {                          // removing
                    this.changes.deletedMembers[id] = this[id]
                    this.changes.diff[id]           = 'deadbeef'

                    this[id].destroyRecursive(this)
                    delete this[id]                                      
                }

                else if (typeof this[id] == "undefined") {                   // adding
                    var p = this.path == '' ? id : (this.path + '.' + id)
                    this[id] = exports.model(p, v)

                    if (!this[id])
                        console.log('this id = undef'
                                    + '\nid: ' + id
                                    + '\nv: ' + JSON.stringify(v)
                                    + '\npath: '+ p)

                    if (this[id].path != p) {
                        this[id].isLink = this[id].isLink ? this[id].isLink.concat(p) : [p]
                        //console.log('isLink=true ' + p +' --> '+ this[id].path)
                    }

                    this.changes.newMembers[id] = this[id]
                    this.changes.diff[id]       = this[id] // ja, das ganze?
                }

                else {                                                       // child changes (rekursion)
                    console.assert(this[id].merge_, id, this.path)
                    this[id].merge_(v, merge)                                       // RECURSION

                    this.changes.changedMembers[id] = this[id]
                    this.changes.diff[id] =           this[id].changes.diff
                }
            }
        })

        box.updateJsProto(this.type, this)
        return this
    }

    function commit_()
    {
        if (this.changes) {
            //console.log('comitting ' + this.path)
            var thischanges = this.changes
            this.changes = undefined

            this.emit('commit', thischanges)
            thischanges.diff.forEach((v, id, idx)=> {
                if(this[id])
                    if (this[id].commit_)
                        this[id].commit_()
                    else
                       if (id != 'onCancel')
                        console.warn(this.path + '.' + id + ': has no commit')
                else
                    if (v != 'deadbeef')
                        if (id != 'onCancel')
                            console.warn(this.path + '.' + id + ': diff but no member')
            })
            this.emit('change', thischanges)
            this.emit('endCommit', thischanges)
            this.commitlog_.push(thischanges)
        }
        //else
        //    console.warn(this.path + ' should not be in chaged list (has no changes but is in diff of parent)')
    }

    function destroyRecursive(parent)
    {
        var changes = { sender:this, diff:{}, newMembers:{}, deletedMembers:{} }

        this.forEach((v, id, idx)=> {
            // todo: check ownership
            v.destroyRecursive(this)
            changes.deletedMembers[id] = this[id]
        })

        this.emit('destroy', changes)
    }

    function attachChanges(m, diff, merge) {
        console.assert(typeof diff !== 'undefined')
        console.assert(!merge.visitedObjects[m.path])

        merge.visitedObjects[m.path] = m.changes = m.changes || {
            sender:m,
            diff:{}, // special tactics
            newMembers:{},
            deletedMembers:{},
            changedMembers:{}
        }
        Object.defineProperty(m.changes.diff, 'path',    { writable:true, value:m.path })
        Object.defineProperty(m.changes.diff, 'isLink',  { writable:true, value:m.isLink })
    }

    exports.model = function(path, initDiff)
    {
        if (initDiff === undefined)
            console.warn('initDiff is undefined', path)

        else if (initDiff.linkPath && initDiff.linkThatShit) {
            try {
                //console.log('Initialize model by linkPath\nPath: ' + path + '\nlinkPath: ' + initDiff.linkPath.valueOf())
                var targetObj = exports.traverse(initDiff.linkPath, app)
                if (targetObj)
                    return targetObj
                else
                    path = initDiff.linkPath
            }
            catch(e) {
                path = initDiff.linkPath
                console.warn('initDiff.linkPath does not exist ' + path)
            }
        }

        else if (initDiff.path != undefined)
            // wärs nicht besser hier das model obj z suchen und zurück zu geben?
            return initDiff //console.trace('using boxedObj as initDiff\n' + initDiff.path +'\n'+ path)

        var model = box.box(initDiff, path)

        Object.defineProperty(model, 'path',             { writable:true, value:path })
        Object.defineProperty(model, 'isLink',           { writable:true, value:undefined })

        Object.defineProperty(model, '_callbacks',       { value:{} })
        Object.defineProperty(model, 'on',               { value:box.Emitter.on }) //mixin(model)
        Object.defineProperty(model, 'off',              { value:box.Emitter.off })
        Object.defineProperty(model, 'emit',             { value:box.Emitter.emit })

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

        var mergeDS = {
            visitedObjects:{},
            firstTouchedObject:null
        }

        model.merge_(initDiff, mergeDS)
        return model
    }
})
(typeof exports === 'undefined' ? this['mvj']={} : exports)
