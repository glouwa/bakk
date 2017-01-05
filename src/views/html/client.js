var jf = jff.jm()
/*
  obligate objekte sollten im html mit datasource versehen werden

model{
    registry:{
        views: some default, some loaded with project
        types: some default, some loaded with project
        jobs: some default, some loaded with project
        workflows: loaded with project?
        config: bound to file
    }
    model:{
        jobs: dynamic / log
        store: bound to folder
        projects: bound to folder
        network: dynamic
    }
}
*/


/* init jobtree
init
  load built in types
  load network (an attach app.clientId.on('change')
  connect network
  load more types (maybe?)
  load views
  crates views                   echt? voher keine views? man könnte auch minimum über ajax oder html holen

*/

function onInit() {

    // Events zuerst
    app.clientId.on('change', changes=> {
        //app.workerId = 'C' + Number(app.clientId).toSubscript()
        jf.host = 'Browser'
        document.title = app.workerId()
        $('#thisId').text(app.workerId())
    })

    mvj.onCommit = function(path, diff) {
        /*if (network.connections[0]) {
            var msg = messages.networkInfoMsg(path, diff)
            var channelMsg = messages.channelMsg('Ws', msg)
            node: network.connections[0].send(channelMsg)

            sim.log('app', 'log', '⟶', msg)
        }
        else{
            // todo:
        }*/
    }
/*
    // Daten
    app.merge({
        type:'C',
        '+1 client': j=> {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open(...) called")
        },
        registry:{
         //   config:config,
            types:{
                'Folder':Folder,
                'Folder<Mod>':ModuleFolder,
                'File<Mod>':FileMod,
                'Set<View>':ViewSet,
                'Network':networkType(),
            },
        }
    })

    // min views
    app.merge({
        registry:{
            config:config,            
            views:{
                primitiveBound:{
                    type:'Folder<Mod>',
                    directory:'./modules/views/html/primitive/'
               }
            }
        },
        network:{
            type: 'Network',
        }
    })

    $('#modelTabPaper').append(tab('modelTab'))
    $('#jobTabPaper').append(tab('jobTab'))*/

/*
    app.callUiJob({
        desc:'app.init',        
        params:{},
        show:false,
        output:{},
        onCall:j=> app.network['⛓'](j),
    })
*/
/*
    app.callUiJob({
        desc:'app.init',
        params:{},
        show:false,
        output:{},
        onCall:j=> j.delegate(
            ()=> jf.job({
                icon:'≟',
                desc:'connect',
                params:{},
                onCall:j1=> app.network['⛓'](j1)
            }),
            ()=> jf.job({
                icon:'≟',
                desc:'load views',
                params:{},
                output:app.registry.views.primitiveBound,
                onCall:j1=> app.registry.views.primitiveBound['↻'](j1),
            }),
            ()=> jf.job({
                icon:'≟',
                desc:'showui',
                params:{},
                onCall:j1=>{
                    var projectsDiv = document.createElement('div')
                    projectsDiv.appendChild(a3View(app.model.mods))
                    projectsDiv.appendChild(a3View(app.network))
                    $('#modelTab')[0].add('☍', { content:a3View(app) })
                    $('#modelTab')[0].add('🌐', { content:projectsDiv }, 'inBg')
                    $('#modelTab')[0].add('⥂', { content:a3View(app.model.jobs) }, 'inBg')

                    $('#jobTab')[0].add(j.id, { content:a3View(j) })
                    j1.ret('ok', 'ui loaded')
                }
            })
        )
    })*/
}

