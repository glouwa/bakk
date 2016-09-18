function jobHeaderView(jobModel)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.backgroundColor = config.colors.paperBorder
        view.style.height = 16
        view.style.paddingRight = 10
        view.style.borderStyle = 'none none solid none'
        view.style.borderWidth = 1;
        view.style.borderColor = '#fafafa'

    view.style.paddingTop = 20
    view.style.paddingBottom = 14 // ändert nichts ?!?!

    var defaultAction = jobControlingButton(jobModel)
    view.appendChild(defaultAction)

    return view
}


function jobAllView(jobModel)
{
    var tab = a3Frame(jobModel,  jobHeaderView)
        //tab.className = 'search'
        //var starterArgs = a3View(jobModel.params)
        var statusTab = a3View(jobModel)/*a3expander({
            model:jobModel,
            expanded:true,
            header:a3Frame(jobModel),
            contentFactory:()=> autoMultiView(jobModel, [jobStateGraphView])
        })*/

   function update(changes) {
        if (changes.newMembers) {
            if (changes.newMembers.output) {
                var result = a3View(jobModel.output)
                    result.id = 'result'
                tab.appendChild(result)
            }
            /*if (changes.newMembers.params) {
                var result = a3View(jobModel.params)
                    result.id = 'params'
                tab.appendChild(result)
            }*/
        }
    }
    update({ newMembers:jobModel })
    //jobModel.on('change', update)

    //tab.appendChild(starterArgs)
    tab.appendChild(statusTab)
    return tab
}
