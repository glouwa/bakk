var graphConfigMap =
{
    'def':          { value:3,  mass:1,  color:'#97C2FC' },
    'function':     { value:3,  mass:1,  color:'#FFA807' },

    'Model':        { value:12, mass:175, color:'#97C2FC', fixed:true, x:0, y:0 }, // 00CC66
    'User':         { value:9,  mass:50, color:'#97C2FC' },

    'Registry':     { value:9,  mass:50, color:'#97C2FC', fixed:true, x:0, y:-1050 },
    'Set<Config>':  { value:5,  mass:7, color:'#97C2FC' },
    'Set<View>':    { value:5,  mass:7, color:'#97C2FC' },
    'Set<Type>':    { value:5,  mass:7, color:'#97C2FC' },

    'Store':        { value:9,  mass:50, color:'#97C2FC', fixed:true, x:-700, y:950 },

    'Set<Job>':     { value:9,  mass:50, color:'#97C2FC', fixed:true, x:700, y:950 },
    'Job':          { value:4,  mass:5,  color:'#6E6EFD', showOnly:['params', 'output'] },
    'remoteJob':    { value:4,  mass:5,  color:'#AF8373', showOnly:['params', 'output'] },
    'rootJob':      { value:4,  mass:5,  color:'#ffffff', showOnly:['params', 'output'] },

    'Set<Project>': { value:9,  mass:50, color:'#97C2FC', fixed:true, x:1100, y:-250 },
    'Project':      { value:6,  mass:10, color:'#6E6EFD', fontSize:80 },

    'Network':      { value:9,  mass:50, color:'#97C2FC', fixed:true, x:-1100, y:-250 },
    'Server':       { value:6,  mass:10, color:'#7BE141', fontSize:80 },
    'Client':       { value:6,  mass:10, color:'#FFFF00', fontSize:80 },
    'Worker':       { value:6,  mass:10, color:'#AF8373', fontSize:80 },

    'SimConfig':    { value:3,  mass:1,  color:'#97C2FC', showOnly:[] },

    'View':         { value:3,  mass:1,  color:'#FFFF00', showOnly:[] },
    'Type':         { value:3,  mass:1,  color:'#6E6EFD', showOnly:[] },

    'ParaSet':      { value:3,  mass:1,  color:'#FB7E81', showOnly:[] },
    'DistSet':      { value:3,  mass:1,  color:'#FB7E81', showOnly:[] },

    'graphConfig':  { value:3,  mass:1,  color:'#97C2FC', showOnly:[] }
}

function graphConfig(obj)
{
    var type = obj.type

    if (typeof obj  === 'function')
        type = 'function'

    if (!type)
        return graphConfigMap.def

    if (type instanceof mvj.PrimitiveModel)
        type = type.value

    //if (!graphConfigMap[type])
        //console.warn('no graphconfig fpr type ', type)

    if (!graphConfigMap[type])
        type = 'def'

    if (type == 'Job' && obj.isRemote)
        type = 'remoteJob'

    if (type == 'Job' && obj.isRoot)
        type = 'rootJob'

    return graphConfigMap[type]
}

function getInitPos(path)
{
    var parts = path.split('.')
    var r = 1.3

    if (parts.length > 1)
        if (parts[1] === 'registry') return { x:    0*r, y:-1050*r }
        if (parts[1] === 'projects') return { x: 1100*r, y: -250*r }
        if (parts[1] === 'jobs')     return { x:  700*r, y:  950*r }
        if (parts[1] === 'store')    return { x: -700*r, y:  950*r }
        if (parts[1] === 'network')  return { x:-1100*r, y: -250*r }

    return {}
}

function onlyGraphView(model, data, config, selectionDelegate)
{
    var view = document.createElement('div')
        var gView = document.createElement('div')
        var progressOuter = document.createElement('div')
            progressOuter.style.display = config.physics?'block':'none'
            progressOuter.style.height = 7
            progressOuter.style.marginTop = -200
            progressOuter.style.marginBottom = 193
            progressOuter.style.textAlign = '-webkit-center'
            var progressInner = document.createElement('div')
                progressInner.style.height = '100%'
                progressInner.style.width = '40%'
                progressInner.style.backgroundColor = '#e8e8e8'
                progressInner.style.boxShadow = '0 1px 1px rgba(0, 0, 0, 0.15) inset'
                progressInner.style.textAlign = 'left'
                var progressValue = document.createElement('div')
                    progressValue.style.height = '100%'
                    progressValue.style.width = 0
                    progressValue.style.backgroundColor = '#00CC66'

        progressInner.appendChild(progressValue)
    progressOuter.appendChild(progressInner)

    view.appendChild(gView)
    view.appendChild(progressOuter)

    view.network = new vis.Network(gView, data, config)

    view.network.on('stabilized', function() { view.network.fit({animation: { duration:750 } }) })
    //network.on('hoverNode', function(e) { data.nodes.update({ id:e.node, font: { color: '#000' } }) })
    //network.on('blurNode', function(e) { data.nodes.update({ id:e.node, font: { color: 'rgba(0, 0, 0, 0.1)' } }) })
    view.network.on("stabilizationProgress", function(params)
    {
        var widthFactor = params.iterations/params.total
        progressValue.style.width = widthFactor*100 + '%'        
    })
    view.network.once("stabilizationIterationsDone", function()
    {
        progressOuter.style.display = 'none'
    })
    return view
}

