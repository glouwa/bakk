(function(exports)
{
    exports.File = {
        type:'File',
        icon:'📄',
        '↻':function(j) { this.io['↻₁'](j) }
    }

    exports.Folder = {
        type:'Folder',
        icon:'📂',
        '↻':function(j) { this.io['↻₁'](j) }
    }
})
(typeof exports === 'undefined' ? this['FS']={} : exports)
