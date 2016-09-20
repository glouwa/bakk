(function(exports, inBrowser)
{
    exports.rangeOfPart = function(rangeToSplit, partsCount, idx)
    {        
        var begin = rangeToSplit.begin
        var end = rangeToSplit.end
        var rangeLen = end-begin
        var partLen = rangeLen / partsCount

        return {
            begin: Math.floor(begin + idx * partLen),
            end: Math.floor(begin + (idx+1) * partLen) - 1
        }
    }

    Object.defineProperty(Object.prototype, 'forEach',
    {
        value: function(visit)
        {
            if (typeof this.valueOf() == 'string')
                return

            var idx = 0
            for (var key in this)
                visit(this[key], key, idx++)
        },
        writable: true,
        configurable: true,
        enumerable: false
    })

    Object.defineProperty(Array.prototype, 'without',
    {
        value: function(toRemove)
        {
            if (!toRemove)
                return this
            return this.filter(function(i) { return toRemove.indexOf(i) === -1 })
        },
        writable: true,
        configurable: true,
        enumerable: false
    })

    Object.defineProperty(Number.prototype, 'toSubscript',
    {
        value: function()
        {
          var result = ''
          var str = this.toString()
          for (var i = 0; i < str.length; i++)
              result += String.fromCharCode(8320 + Number(str.charAt(i)))
          return result
        },
        writable: true,
        configurable: true,
        enumerable: false
    })

    Object.defineProperty(Object.prototype, 'clone',
    {
        value: function (obj)
        {
            var clone = this instanceof Array ? [] : {}
            for(var i in this)
            {
                if(typeof this[i] == 'object' && this[i] != null)
                    clone[i] = this[i].clone()
                else
                    clone[i] = this[i];
            }
            return clone;
        },
        writable: true,
        configurable: true,
        enumerable: false
    })

    Object.defineProperty(Object.prototype, 'pack',
    {
        value:function(pf)
        {            
            var clone = this instanceof Array ? [] : {}
            for(var i in this) {                
                var v = this[i]
                console.log('packing ' + i + '  ' +(v?v.path:'...'))

                if(typeof v == 'object' && v != null) {

                    if (v.isLeafType)
                        clone[i] = v.value

                    else if (i !== 'data') {
                        if (v.isLink)
                            console.log('pack is link ' + v.path +'-->'+this.path+'.'+i)

                        if (!v.isLink || v.path == this.path+'.'+i || i == 'params')
                            clone[i] = v.pack(pf) // todo: remove that shit
                        else {
                            clone[i] = v.pack()
                            clone[i].linkThatShit = true
                            clone[i].linkPath = v.path

                            console.log('skip packing ' + v.path +'-->'+this.path+'.'+i)
                        }
                    }

                    else
                        clone[i] = {}
                }
                else if (typeof v == 'function' && pf) {
                    clone['$' + i] = '(' + v.toString() + ')'
                    clone[i] = v
                    //console.warn('stringifying function ' + i)
                }
                else
                    clone[i] = v                
            }

            if (this.onCall)   clone['$onCall']   = '(' + this.onCall.toString()   + ')'
            if (this.onCancel) clone['$onCancel'] = '(' + this.onCancel.toString() + ')'
            return clone
        },
        writable: true,
        configurable: true,
        enumerable: false
    })

    Object.defineProperty(Object.prototype, 'unpack',
    {
        value: function (evaluator)
        {            
            for(var i in this) {
                if(typeof this[i] == 'object' && this[i] != null) {
                    this[i].unpack(evaluator)
                }
                else if (i.indexOf('$') === 0) {
                    //console.warn('unstringifying function ' + i)
                    this[i.substring(1)] = evaluator(this[i])
                    delete this[i]
                }
                else {
                }
            }
            return this
        },
        writable: true,
        configurable: true,
        enumerable: false
    })

    exports.toggleVis = function(htmlElement)
    {
        htmlElement.style.display = htmlElement.style.display === 'none'
                                  ? 'block'
                                  : 'none'
    }

    exports.toggle = function(va, v1, v2)
    {
        va = va === v1 ? v2 : v1
    }

})
(typeof exports === 'undefined' ? this['tools']={} : exports, typeof exports === 'undefined')
