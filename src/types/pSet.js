(function(exports)
{
    /*
    function distributedSet()
    {
        // hashDistribution |  arbitraryDistribution
        distribution: (idx)=>        node
        rehash:       (dist)=>       dist

        // schreiben (add/remove/set)
        // sollte auch veränderung der arbitraryDistribution erlauben?
        change: (begin, end, ctor)=> {}

        // lesend
        get:    (idx, level)=>       element
        visit:  (level)=>           (element, idx)=> {}
    }*/

    /*
    exports.setSubset = function(set)
    {
        var subset = { data:undefined, pageNr:0, fetch:0 }
        subset.begin = function() { return db.pageNr * config.dbsize }

        subset.size    = function()    { return db.data.length }
        subset.getItem = function(mid) { return db.data[mid]   }

        subset.nextPage = function() { subset.pageNr+=1; subset.load() }
        subset.prevPage = function() { subset.pageNr-=1; subset.load() }

        set.visit = function(j, visitor)
        {
            set.begin = subset.begin()
            set.end = set.begin + subset.size()
            set.visit(j, visitor)
        }
    }
    */

    exports.lazySet = function(begin, end, constructor)
    {
        var set = {}        
        set.type = 'ParaSet'
        set.begin = begin
        set.end = end        
        set.data = {} // todo rename cache
        set.size = function() { return this.end - this.begin + 1 }

        set.ictor = constructor        

        /*
        set.unload = function(j)
        {
            var set = this
            for (var idx = set.begin.valueOf(); idx <= set.end.valueOf(); idx++)
                if (set.data[idx])
                    set.data.update(idx.toString(), 'deadbeef')
        }*/

        set.load = function(j)
        {
            var set = this

            // set range
            if (j.params)
                set.update({ begin:j.params.begin, end:j.params.end })

            if (!set.begin.valueOf() == undefined || !set.end.valueOf() == undefined)
                throw new Error('set.begin or set.end is undefined')

            // create items
            for (var idx = set.begin.valueOf(); idx <= set.end.valueOf(); idx++)                
                set.data.update(idx.toString(), set.ictor(idx))

            // load items
            j.delegateToFactory({            
                end: idx=> idx < set.size(),
                job: idx=> set.data[set.begin + idx]['↻'](j)
            })
        }

        set.get = function(j, idx, level)
        {
            var set = this
            var idxStr = idx.toString()

            if (!set.data[idxStr])
                set.data.update(idxStr, set.ictor(idx))

            console.assert(set.data[idxStr])

            j.delegateToOne({ job:()=> set.data[idxStr]['↻'](j) })
        }

        set.visit = function(vj/*j*/, visitor)
        {
            var set = this

            if(sim.config && sim.config.stopWork.active && sim.config.stopWork.pof === 'beforeWork')
                return

            sim.delayedLoop(vj, 0, set.size()-1, function(x)
            {
                //if (vj.canceled)
                //    return

                visitor(vj, set.data[set.begin + x], set.begin + x, (x+1) / set.size() * 0.95)
            })
        }

        set.shrink = function(idx, partsCount)
        {            
            var partLen = this.size() / partsCount
            var sclone = this.clone()
            sclone.begin = Math.floor(this.begin + idx * partLen)
            sclone.end = Math.floor(this.begin + (idx+1) * partLen) - 1
            return sclone
        }

        return set
    }
})
(typeof exports === 'undefined' ? this['pSet']={} : exports)
