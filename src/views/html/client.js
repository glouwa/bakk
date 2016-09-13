var jf = jobFactory.jm()

var app = mvj.model('', {
    wsUrl: 'ws://' + document.location.hostname + ':' + config.server.wsport,
    clientId: 'unknown',
    model: {}
})

function callUiJob(args)
{
    q.addRoot('Message From UI ' + args.desc, ()=> {
        rootJob(args).call()
    })
}

function rootJob(args)
{
    // todo: use this in view.createRootJob
    args.isRoot = true
    var jd = jf.job(args)

    app.mergePath('model.jobs.'+jd.id, jd)
    var observableJob = app.model.jobs[jd.id.valueOf()]

    //$('#jobTab')[0].add(observableJob.id, { content:jobAllView(observableJob) }/*, 'inBg'*/)
    return observableJob
}

// called by GUI --------------------------------------------------------------------------

function appInit() { q.addRoot('App init', ()=> {

    sim.config = config.clientDefaultSimConfig

    // nicht hin schaun
    jf.jl = jl
    jf.workerId = undefined
    jf.host = undefined
    jf.nextFreeId = 0
    tj.jm = jf
    tj.config = config
    mvj.jm = jf
    mvj.app = app
    q.app = app

    app.clientId.on('change', changes=> {
        jf.workerId = 'C' + Number(app.clientId).toSubscript()
        jf.host = 'Browser'
        document.title = jf.workerId
        $('#thisId').text(jf.workerId)
    })

    // network -----------------------------------------------------

    network.onMessage = appOnMessage
    network.onConnectionChanged = appOnNetworkStateChange
    network.connect(app.wsUrl.valueOf())
    mvj.onCommit = function(path, diff) {
        /*
        if (network.connections[0]) {
            var msg = messages.networkInfoMsg(path, diff)
            var channelMsg = messages.channelMsg('Ws', msg)
            node: network.connections[0].send(channelMsg)

            sim.log('app', 'log', '⟶', msg)
        }
        else
        {
            // todo:
        }*/
    }

    // projects ----------------------------------------------------

    app.model.merge({
        type: 'Model',
        jobs: { type:'Set<Job>' },
        store: { type:'Store' },
        projects: // fileset(path, 'Set<Project>', (filename)=> project(filename))
        {
            type:'Set<Project>',
            '↻': function(j) {
                this.merge({
                    '↻': 'deadbeef',
                    'services': {
                        type:'Set<Project>',
                        '✕': function free(j) {},
                        '🖥 Start workers':                       project('modules/jobs/overlordWorkers.js'),
                        '☠ Kill all':                            project('modules/jobs/workerKill.js'),
                    },
                    'tests': {
                        type:'Set<Project>',
                        '✕': function free(j) {},
                        '▸': function run(j) {
                            // this =  tests
                            //var projectMembers = this.filter(i=> i.type == 'project')

                            //$('#jobTab')[0].add(j.id, { content:jobAllView(j) } )

                            var projectMembers = [
                                this['💻 server cmd'],
                                this['📂 server folder'],
                                this['🗩 server output'],
                                this['↷ local paralell AJAX'],
                                this['🗩 local output'],
                                this['🐼 Process fracturing folder on workers'],
                                this['🐁 Process empty jobs on worker'],
                                this['❄ Find similar 3d models on worker'],
                                this['ℙ Find prime numbers with C++ on workers'],
                            ]

                            j.updateJob({ state:{}}, projectMembers)

                            var pjobs = projectMembers.map(i=> {
                                //return ()=> jf.job({ params:i.service.args, onCall:i.service.src })

                                return ()=> jf.job({
                                    desc:i.desc,
                                    //args:
                                    onCall: j=> i['▸'](j),

                                })
                            })
                            j.updateJob({ state:{}}, pjobs)

                            j.delegate({ type:'sequence', job:pjobs })

                            //j.delegateToSequence(projectMembers.map(i=> new Job(i))
                        },
                        '🐼 Process fracturing folder on workers':    project('modules/jobs/workerBacc0.js'),
                        '🐁 Process empty jobs on worker':            project('modules/jobs/workerBacc1.js'),
                        '❄ Find similar 3d models on worker':        project('modules/jobs/workerModel3d.js'),
                        'ℙ Find prime numbers with C++ on workers':  project('modules/jobs/workerPrimeCpp.js'),
                        '💢 server fragment folder':                  project('modules/jobs/serverFragmentFolder.js'),
                        '💻 server cmd':                              project('modules/jobs/serverCmd.js'),
                        '📂 server folder':                           project('modules/jobs/serverFolder.js'),
                        '🗩 server output':                           project('modules/jobs/serverOutput.js'),
                        '❄ local find 3d models':                    project('modules/jobs/localSetIteration.js'),
                        '↷ local paralell AJAX':                     project('modules/jobs/localAjax.js'),
                        '🗩 local output':                            project('modules/jobs/localOutput.js'),
                    },
                })
                j.ret('ok', '+11 projects')
            }
        },
        registry:
        {
            type:'Registry',
            config: config,
            views: viewCollection,
            lineViews:{},
            primitiveViews:{},
            graphViews:{},
            types: { type:'Set<Type>' }
        },
    })

    $('#modelTabPaper').append(tab('modelTab'))
    $('#jobTabPaper').append(tab('jobTab'))

    //$('#modelTab')[0].add('☍', { content:a3View(app.model) })
})}

// called by Net --------------------------------------------------------------------------

function appOnMessage(c, parsed, pduSize)
{    
    q.addRoot('app on "' + parsed.type + '" message ' + c.id + ' ('+pduSize+'b)', ()=>
    ({
        onWsMessage: (c, parsed)=> {
            sim.log('app', 'log', '⟵', parsed)
            var messageHandlers = {

                onServerHallo: (c, parsed)=> {

                    app.merge(parsed.diff) // pull
                    app.commit('got my id')


                    var mynodeInfo = {
                        [app.clientId]:{
                            type:'Client',
                            id:jf.workerId,
                            capabilitys:['JS'],
                            simconfig:config.clientDefaultSimConfig,
                            osType:'Browser',
                            hostname:''
                        }
                    }
                    app.model.network.merge(mynodeInfo)
                    sim.config = app.model.network[app.clientId.valueOf()].simconfig
                    app.commit('my properties')

                    // ui sollte nur ein mal passieren
                    var projectsDiv = document.createElement('div')
                    projectsDiv.appendChild(a3View(app.model.projects))
                    projectsDiv.appendChild(a3View(app.model.network))
                    app.model.on('change', changes=>
                    {
                        if (changes.newMembers && changes.newMembers.network)
                            projectsDiv.appendChild(a3View(app.model.network))

                        if (changes.deletedMembers && changes.deletedMembers.network)
                            projectsDiv.removeChild(projectsDiv.childNodes[1])
                    })
                    $('#modelTab')[0].add('a', { content:a3View(app) })
                    $('#modelTab')[0].add('🌐', { content:projectsDiv })
                    $('#modelTab')[0].add('☍', { content:a3View(app.model) })
                    $('#jobTab')  [0].add('⥂', { content:a3View(app.model.jobs) })
                },

                onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
                onReload:      (c, parsed)=> location.reload(true)

            }['on'+parsed.type](c, parsed)
        },

        onJobMessage: (c, parsed, pduSize)=> {
            //sim.log('job', 'log', '⟵', pduSize, parsed)
            console.info('%cjob', 'text-decoration:underline;', '⟵', pduSize, parsed)
            jf.onReceive(c, parsed, code=> eval(code), app, pduSize)
        }

    })['on'+parsed.type+'Message'](c, parsed.payload, pduSize))
}

function appOnNetworkStateChange(state, connection)
{
    q.addRoot('Network state changed ' + connection.id + ' ('+state+')', ()=>
    ({
        onConnecting:()=>
        {
            $('#thisId').text()
            $('#connectionState').text('Auto reconnect to ' + app.wsUrl.valueOf()+ ' \u21c4')
        },
        onConnected:()=>
        {
            $('#thisId').text('Connected')
            $('#connectionState').text('Connected to ' + app.wsUrl.valueOf())
            $('#connectionDate').text('since ' + new Date())
            app.model.merge({ network:networkType() })
        },
        onDisconnected:()=>
        {
            $('#thisId').text('')
            $('#connectionState').text('Disconnected')
            $('#connectionDate').text('')
            app.model.merge({ network:'deadbeef' })
        }

    })['on'+state]())
}
