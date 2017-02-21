function multipleAjaxCalls(j, diff)
{
    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: {}
    })

    j.delegate({
        type: 'parallel',
        desc: 'parallel ajax * ' + j.params.amount,
        //mode: subjobs.async_obligate_replace,
        end:idx=> idx < j.params.amount,
        job:idx=> tj.ajaxJob({
            url: 'data/3dModel/vectorfiles/m' + idx + '.json',
            onData: (j, s, d) =>
                //j.updateJob({ state:s }, tj.wrap(idx, JSON.parse(d)))
                j.updateJob({ state:s, output:{ [idx]:JSON.parse(d) }})
        })
    })
}

new Object({
    type: 'Project',
    jobPrototype: {
        type: 'Service',        
        icon: '🔃',
        desc: 'Multiple AJAX calls',
        args: {
            amount: 5,            
            timeout: 3000
        },
        onCall: multipleAjaxCalls
    },
    tests: []
})
