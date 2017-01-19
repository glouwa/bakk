function find3dModel(j, diff)
{ 
    j.merge({
        state:{ progress:0.1, type:'running', log:'setting output reference' },
        output: { type:'model3dResultSet' }
    })

    j.delegate(()=> jf.remoteProxyJob({
        icon: '🦁',
        node: app.network['S₀'],
        desc:'delegate to server',
        args: j.params,
        realJob: (js, diff)=> {
            //var nodes = app.network.getNodesByCapability('POSIX64') // eigentlich js, aber der client ist überfordert
            var nodes = app.network.getNodesByCapability('POSIX64') // eigentlich js, aber der client ist überfordert
            js.delegate({
                type: 'parallel',
                desc: 'process partition on worker',
                end: idx=> idx < nodes.length,
                job: idx=> jf.remoteProxyJob({
                    icon: 'W',
                    desc: 'load and compare partition',
                    node: nodes[idx],
                    //args: Object.assign({ set:js.params.set.shrink(idx, nodes.length) }, js.params),
                    args: {
                        set: js.params.set.shrink(idx, nodes.length),
                        selected: js.params.selected,
                        threshold: js.params.threshold
                    },
                    realJob: jw=> jw.delegate(
                        ()=> jf.job({
                            icon:'✪',
                            desc: 'load compared',
                            onCall:cj=> jw.params.set.get(cj, jw.params.selected.valueOf(), 'load')
                        }),
                        ()=> jf.job({
                            icon:'🔃*',
                            desc: 'load partition',
                            onCall:cj=> jw.params.set.load(cj)
                        }),
                        ()=> jf.job({
                            icon:'≟',
                            desc: 'comparing',
                            onCall:cj=> jw.params.set.visit(cj, (vj, i, idx, p)=> {
                                var l  = 'compared ' + jw.params.set.begin + '-' + idx
                                var v1 = i.features
                                var v2 = jw.params.set.data[jw.params.selected.valueOf()].features
                                var d  = v1.map((i, idx)=> v2[idx] - i)
                                var r  = d.reduce((acc, c)=> acc + c*c)
                                var l2 = Math.sqrt(r)
                                var m  = l2 < jw.params.threshold.valueOf()
                                       ? { [idx]:{/* dbEntity:i,*/ diff:l2 } }
                                       : undefined

                                if (jw.params.selected.valueOf() != idx)
                                    delete i.features

                                vj.updateJob({ state:{ progress:p, type:'running', log:l }, output:m })
                            })
                        })
                    )
                })
            })
        }
    }))
}

function entityViewPanel(model, contentDelegate)
{
    var viewElement = document.createElement('div')
        viewElement.model = model
        viewElement.className = 'model'
        viewElement.draggable = true
        viewElement.ondragstart = ev=>  ev.dataTransfer.setData("text", ev.target.id)
        var blueHeader = document.createElement('div')
            blueHeader.className = 'header'
            blueHeader.style.backgroundColor = model.features ? '#55D0E0':'#FFD900'
        var thumbnail = contentDelegate(model)
            thumbnail.className = 'thumbnail'

    function update(changes)
    {
        if (changes.newMembers)
            if (changes.newMembers.features)
                blueHeader.style.backgroundColor = '#55D0E0'
    }
    model.on('change', update)

    viewElement.appendChild(thumbnail)
    viewElement.appendChild(blueHeader)
    return viewElement
}

function entityView(model)
{
    var view = document.createElement('div')
        var img = document.createElement('img')
            img.src = model.tUrl.valueOf()
            img.alt = 'err'
            img.draggable = false
            view.appendChild(img)
        var modelIndex = document.createElement('div')
            modelIndex.className = 'index'
            modelIndex.innerText = model.idx.valueOf()
            view.appendChild(modelIndex)
    return view
}

function matchEntityView(model)
{
    var view = entityView(model.dbEntity)
        view.appendChild(diffBar(100, model))
    return view
}

function initialSetView(model)
{
    return itemGridView(model, itemModel=> entityViewPanel(itemModel, entityView))
}

function resultView(outputModel)
{
    var view = listView(outputModel, im=> entityViewPanel(im, matchEntityView), 'model3dResultSet')
    view.style.margin = '30 10'
    return view
}

function parameterView(argsModel)
{
    app.callUiJob({ desc:'combobox.↻', onCall:j=> argsModel.set.load(j) })

    var view = document.createElement("div")
        view.style.display = 'inline-flex'
        view.startQuery = undefined
        view.value = undefined
        view.style.marginLeft = 10
        view.style.marginTop = 25        
        var midCombo = comboBox(
                argsModel.set,
                argsModel.selected,
                itemModel=> entityViewPanel(itemModel, entityView)
            )
            midCombo.id = 'midCombo'
            midCombo.style.position = 'relative'
            //midCombo.style.float = 'left'
            midCombo.ondragover  = ev=> ev.preventDefault()
            midCombo.ondrop = ev=>
            {
                ev.preventDefault()
                mid = ev.dataTransfer.getData("text")
                view.setValue(app.db.data[mid])
                view.startQuery()
            }
        var threshhold = labeledSlider(argsModel.threshold, 10, 25, '±', '', 0, 35)
        var setView = initialSetView(argsModel.set)
            setView.style.marginBottom = 20

    view.midCombo = midCombo
    view.threshhold = threshhold
    view.appendChild(midCombo)
    view.appendChild(threshhold)

    var rv = document.createElement('div')
    rv.className = 'm3dparam'
    rv.appendChild(view)
    rv.appendChild(setView)
    return rv
}

new Object({
    type:'Project',    
    jobPrototype: {
        type: 'JobPrototype',
        icon: '🦁',
        desc: 'Find similar 3d models',
        onCall: find3dModel,
        args: {
            type: 'Model3dArgs',
            threshold: 16,
            selected: 2,
            set: pSet.lazySet(0, 10, idx=> ({
                    idx: idx,
                    url: 'data/3dModel/vectorfiles/m' + idx + '.json',
                    tUrl: 'data/3dModel/thumbnails/m' + idx + '_thumb.png',
                    '↻': function(j) {
                        return tj.ajaxJob({
                            url: this.url.valueOf(),
                            onData: (j, s, d)=> {
                                if (this['↻'])
                                    this.merge({
                                        features: JSON.parse(d).features,
                                        //'↻': 'deadbeef',
                                        '✕': j=> {},
                                    })
                                j.updateJob({ state:s })
                            }
                        })
                    }
                })
            ),
            config: {
                requires: 'JS',
                timeout: 7000,
                ttfbTimeout: 300,
                responseTimeout: 100,
                cancelTimeout: 1000
            }
        },
    },
    tests: [],
    views: {
        a5: {
            model3dEntity: {
                type: 'View',
                demoViewModel: {},
                ctor: m=> entityViewPanel(m, entityView)
            },
            model3dInitialSet: {
                type: 'View',
                demoViewModel: {},
                ctor: m=> initialSetView(m)
            },
            model3dParameter: {
                type: 'View',
                demoViewModel: {},
                ctor: m=> parameterView(m)
            },
            model3dResultSet: {
                type: 'View',
                demoViewModel: [],
                ctor: m=> resultView(m)
            },
            model3dMatchEntity: {
                type: 'View',
                demoViewModel: { diff:15.0, dbEntity: { mid:0 } },
                ctor: m=> entityViewPanel(m, matchEntityView)
            }
        }
    }
})


