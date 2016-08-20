function multipleAjaxCalls(j, diff)
{
    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: {}
    })

    j.delegate({
        type: 'parallel',
        desc: 'parallel ajax * ' + j.params.amount,
        //mode: subjobs.async_obligate_replace,
        end: (idx)=> idx < j.params.amount,
        job: (idx)=> tj.ajaxJob({
            url: '../../../data/3dModel/vectorfiles/m' + idx + '.json',
            onData: (j, s, d) =>
                //j.updateJob({ state:s }, tj.wrap(idx, JSON.parse(d)))
                j.updateJob({ state:s }, { [idx]:JSON.parse(d) })
        })
    })
}

new Object({
    icon: '↷',
    desc: 'Multiple AJAX calls',
    service:
    {
        type: 'Service',
        src: multipleAjaxCalls,
        args: {
            amount: 5,            
            timeout: 3000
        },
    },
    tests: []
})


/*
new Job({
    icon: '↷',
    desc: 'Multiple AJAX calls',
    params: {
        amount: 5,
        timeout: 3000
    },
    onCall: multipleAjaxCalls,
    tests: []
})
*/
