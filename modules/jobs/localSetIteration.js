function localFind3dModel(j, diff)
{
    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: { type:'model3dResultSet' }
    })

    j.delegateToSequence(
        ()=> jf.job({ onCall:cj=> j.params.set.load(cj) }),
        ()=> jf.job({ onCall:cj=> j.params.set.visit(cj, (vj, i, idx, p)=>
        {
            var l = 'compared ' + j.params.set.begin + '-' + idx
            var v1 = i.features
            var v2 = j.params.set.data[j.params.selected.valueOf()].features
            var d  = v1.map((i, idx)=> v2[idx] - i)
            var r  = d.reduce((acc, c)=> acc + c*c)
            var l2 = Math.sqrt(r)
            var m  = l2 < j.params.threshold
                   ? { [idx]:{ dbEntity:i, diff:l2 } }
                   : undefined

            vj.updateJob({ state:{ progress:p, type:'running', log:l } }, m)
            //vj.updateJob(p, l, m)
        })})
    )
}

new Object({
    type:'Project',
    icon: '❄',
    desc: 'Find similar 3d models locally',
    service: {
        type: 'Service',
        src: localFind3dModel,
        args: {
            type: 'Model3dArgs',
            threshold: 17,
            selected: 3,
            set: pSet.lazySet(
                0,
                9,
                function(idx) { return {
                    id: idx,
                    url: 'data/3dModel/vectorfiles/m' + idx + '.json',
                    tUrl: 'data/3dModel/thumbnails/m' + idx + '_thumb.png',
                    '↻': function(j) {
                        var element = this
                        return tj.ajaxJob({
                            url: this.url.valueOf(),
                            onData: (j, s, d)=> {
                                if (element['↻'])
                                    element.update({
                                        features: JSON.parse(d).features,
                                        '↻':'deadbeef',
                                        '✕':j=> {},
                                    })
                            }
                        })
                    }
                }}
            ),            
            timeout: 7000
        },
    },
    tests: [],    
})


