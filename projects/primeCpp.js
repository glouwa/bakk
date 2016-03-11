function findPrimes(j, diff)
{
    app.update('model.store.'+j.id, { type:'DistSet' })
    j.update({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: app.model.store[j.id.valueOf()]
    })

    j.delegateToOne({
        desc: 'delegating to server',
        job: ()=> jf.remoteProxyJob({
            args: j.params,
            node: network.server,
            realJob: js=> {
                var nodes = app.filterNodes('POSIX64')
                js.delegateToFactory({
                    desc: 'delegating parts to worker',
                    end: idx=> idx < nodes.length,
                    job: idx=> jf.remoteProxyJob({
                        args: js.params.set.shrink(idx, nodes.length),
                        node: nodes[idx],                        
                        realJob: jw=> tj.spawn(
                            jw,
                            '../../bin/posix64/prime.exe',
                            [jw.params.begin.valueOf(), jw.params.end.valueOf()],
                            (jw, data)=> {
                                arguments.callee.count = arguments.callee.count || 1
                                jw.commitJob(data.state, { [jf.workerId]:arguments.callee.count++ })
                            }
                        )
                    })
                })
            }
        })
    })
}

function primeNummberView(itemModel)
{
    var view = document.createElement('div')
        view.innerText = itemModel.mid
        view.style.marginRight = 10
        view.style.float = 'left'
    return view
}

function primeRangeView(argsModel)
{
    var view = document.createElement('div')
        var t1 = document.createElement('div')
            t1.innerText = 'Test all ℕ from'
            t1.style.margin = '24 10'
            t1.style.float = 'left'
        var begin = labeledSlider(argsModel.set.begin, 1e4, 1e6, '', '', 0, 55)
            begin.style.margin = '20 0'
            begin.style.float = 'left'
        var t2 = document.createElement('div')
            t2.innerText = 'to'
            t2.style.margin = '24 10 0 20'
            t2.style.float = 'left'
        var end = labeledSlider(argsModel.set.end, 1e5, 1e7, '', '', 0, 55)
            end.style.margin = '20 0'
            end.style.float = 'left'

        view.appendChild(t1)
        view.appendChild(begin)
        view.appendChild(t2)
        view.appendChild(end)
    return view
}

function primeStatsView(outputModel)
{/*
    var startTime = new Date()
    var statModel = mvj.model('/statModel', {
        startTime: new Date().toString(),
        messageCount: 0,
        primeNumberCount: 0
    })

    outputModel.onChange = function(changes)
    {
        console.log(changes)
        var newMsgCount = statModel.messageCount + 1
        var newItemCount = Object.keys(outputModel).length + statModel.primeNumberCount
        //var newItemCount = payload.length + statModel.itemCount

        statModel.update({
            messageCount: newMsgCount,
            primeNumberCount: newItemCount,
            test: {
                avgItemsPmsg: (newItemCount / newMsgCount).toFixed(1),
                duration: ((new Date() - startTime)/1000).toFixed(3) + 's'
            }
        })
    }

    var view = btab()
        view.add('list', { content:document.createElement("div") })
        view.add('auto', { content:autoView(statModel) })
    return view*/

    var view = btab()
        view.add('auto', { content:autoView(outputModel) })
    return view
}

new Object({
    type:'Project',
    icon: '⤑ℙ',
    desc: 'Find prime numbers with C++',
    service:
    {
        type: 'Service',
        src: findPrimes,
        args: {
            type: 'PrimeArgs',
            set: pSet.lazySet(
                1*10e6,
                2*10e6,
                function(j, idx) { return { mid: idx } }
            ),
            config: {
                requires: 'JS, POSIX64',                
                timeout: 3*60000,
                ttfbTimeout: 300,
                responseTimeout: 100,
                cancelTimeout: 1000
            }
        },
    },
    tests: [],
    views: {
        primeNummberView: {
            type: 'View',
            demoViewModel: { mid:1 },
            ctor: function(m) { return primeNummberView(m) }
        },
        primeParameterView: {
            type: 'View',
            demoViewModel: {},//project.args,
            ctor: function(m) { return primeRangeView(m) }
        },
        primeResultView: {
            type: 'View',
            demoViewModel: [],
            ctor: function(m) { return primeStatsView(m) }
        }
    }
})

