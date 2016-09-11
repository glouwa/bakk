function systemView(model)
{
    var system = document.createElement('div')
        system.classList.add('networkNodes')
        var nodes = listView(
            model,
            networkNodeView,
            'networkView',
            (v, k, idx)=> typeof v !== 'function' && k !== 'currentTransaction'
        )
        nodes.style.margin = '30 0'
        system.appendChild(nodes)
    return system
}
