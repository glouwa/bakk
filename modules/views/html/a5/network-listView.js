{
    type:'View',
    icon:'☰',
    modelTypes:['Network'],
    idx:0,
    ctor:function systemView(model)
    {
        var system = document.createElement('div')
            system.classList.add('networkNodes')
            var nodes = listView(
                model,
                app.core.views.line.query('Client'),
                'networkView',
                (v, k, idx)=> typeof v !== 'function'
                           &&  v.type
                           && (v.type == 'Client' ||
                               v.type == 'Server' ||
                               v.type == 'Worker' ||
                               v.type == 'Overlord')
            )
            nodes.style.margin = '30 0'
            system.appendChild(nodes)
        return system
    }
}



