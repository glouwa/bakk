function comboBox(psetModel, selectionModel, itemDelegate)
{
    var combo = document.createElement("div")
    var comboContent = document.createElement("div")
    var comboDropDown = document.createElement("ul")
    var comboIndicator = document.createElement("div")
    var comboSelectedItem = document.createElement("div")
    var selectedIndex = undefined

    combo.disabled = false
    combo.setAttribute('tabindex', 0)
    combo.onfocus = function () {}    
    combo.onblur = function()
    {
        comboDropDown.style.display = 'none'
        comboContent.style.background = '-webkit-linear-gradient(bottom, #DEDEDE, #F6F6F6)'
    }
    combo.setValue = function(selectedModel, index)
    {
        if (selectedIndex != index)
        {
            var newSelectedItemView = itemDelegate(selectedModel)
            comboContent.replaceChild(newSelectedItemView, comboContent.childNodes[0])

            selectedIndex = index
            selectionModel.update(index)
        }
        combo.onblur()
    }
    comboContent.id = 'content'
    comboContent.onclick = function()
    {
        comboDropDown.style.display =
            comboDropDown.style.display === 'none' && !combo.disabled ?
                'block' : 'none'

        comboContent.style.background =
            comboDropDown.style.display === 'none' ?
                '-webkit-linear-gradient(bottom, #DEDEDE, #F6F6F6)' :
                '-webkit-linear-gradient(top, #DEDEDE, #F6F6F6)'
    }

    comboIndicator.id = 'indicator'
    comboIndicator.innerText = '🞃'

    comboDropDown.className = 'cdd'
    comboDropDown.style.display = 'none'

    comboContent.appendChild(comboSelectedItem)
    comboContent.appendChild(comboIndicator)
    combo.appendChild(comboContent)
    combo.appendChild(comboDropDown)

    //--------------------------------------------------------------------------

    function updateSet(changes)
    {
        updateData = compositeUpdate({
            view:comboDropDown,
            itemDelegate:(v, k)=>
            {
                if (k == selectionModel.value)
                    combo.setValue(v, k)

                var li = document.createElement('li')
                    var liDiv = itemDelegate(v)
                        liDiv.id = v.mid
                        liDiv.onclick = ()=> combo.setValue(v, k)
                    li.appendChild(liDiv)
                return li
            }
        })

        if (changes.newMembers)
            if (changes.newMembers.data)
            {
                updateData({ newMembers:changes.newMembers.data })
                changes.newMembers.data.on('change', updateData)
            }
    }
    updateSet({ newMembers:psetModel })
    psetModel.on('change', updateSet)

    function updateSelection()
    {
        var newIdx = selectionModel.value
        combo.setValue(psetModel.data[newIdx], newIdx)
    }
    updateSelection()
    selectionModel.on('change', updateSelection)

    return combo
}
