(function () {


project.config = {}
project.view = {}
project.model = {}
project.job = {}

project.icon = 'prime JS'
project.icon = 'find prime numbers with JS'
project.config.requires = 'JS, POSIX64'
project.config.terminateTimeout = 5*60000
project.config.ttfbTimeout = 300
project.config.responseTimeout = 100
project.config.cancelTimeout = 1000
project.config.serverRequestProgress = 0.05
project.config.cancelOnFatal = true
project.config.tryRecover = true

// -------------------------------------------------------------------------------------

project.job.createSet = function()
{
    return pSet.lazySet(
        0,
        10000000,
        function(j, idx) { return { mid: idx } }
    )
}

project.job.main = function(j, diff)
{
    j.subjobs = subjobs.fromFactory(
        j,
        app.networkInfo.filter('POSIX64'),
        function(cid, cidx, partsCount)
        {
            var subreq = request.clone()
            subreq.param.set.shrink(cidx, partsCount)

            var c = network.connections[cid]
            var sj = jobManager.remoteProxyJob(c, j)

            sj.onExecute = function()
            {
                sj.sendRequest(subreq)
            }
            sj.onResponse = function(p)
            {
                j.subjobs.handleResponse(p)
            }
            sj.onTerminate = function()
            {
                j.subjobs.handleError(sj, subreq, network)
                j.subjobs.handleTermination()
            }
            return sj
        }
    )
}

project.job.worker = function(j, request)
{
    function isPrime(n)
    {
        if (n < 2)
            return false

        var m = Math.sqrt(n)
        for (var i = 2; i <= m; i++)
            if (n%i == 0)
                return false

        return true
    }

    request.param.set.visit(j, function(i, idx, p)
    {
        j.emit({
            force: p === 1,
            payload: isPrime(i.mid) ? i : undefined,
            progress: p,
            type: undefined,
            log: 'checked ' + request.param.set.begin + '-' + idx
        })

        if (p === 1)
            j.sendResponseAck('ok', 'completed ' + request)
    })
}

// -------------------------------------------------------------------------------------

function entityView(model)
{
    var view = document.createElement('span')
        view.innerText = model.mid
        view.style.marginRight = 10
        view.style.float = 'left'
    return view
}

function parameterView(model)
{
    var view = document.createElement("div")
        view.style.display = 'inline-flex'
        view.setDisabled = function(d)
        {
            threshhold.setDisabled(d)
        }
        view.value = function() {
            return {
                threshold: view.threshhold.value
            }
        }
        var threshhold = labeledSlider(1, 9999, 1000, '', '', 0, 25)

        view.threshhold = threshhold
        view.appendChild(threshhold)
    return view
}

function resultView(model)
{
    var view = document.createElement("div")
        var header = document.createElement("div")
        header.style.marginBottom = 20

    var count = 0
    view.append = function(dbItems)
    {
        count += dbItems.length
        header.innerText = count + ' prime numbers found'

        for(var i = 0; i < dbItems.length; i++)
            if (count < 1000)
                view.appendChild(model.project.view.entityView(dbItems[i]))
    }
    view.appendChild(header)
    return view
}

// -------------------------------------------------------------------------------------

project.model.initialSet = project.job.createSet()
project.model.sampleEntity = { mid:1 }
project.model.parameter  = { threshold: 1000 }

project.view.entityView =                        function(m) { return entityView(m) }
project.view.entityView.demoViewModel =          project.model.sampleEntity

project.view.parameterView =                     function(m) { return parameterView(m) }
project.view.parameterView.demoViewModel =       project.model.parameter

project.view.resultView =                        function(m) { return resultView(m) }
project.view.resultView.demoViewModel =  []

project.view.matchEntityView =                   function(m) { return entityView(m) }
project.view.matchEntityView.demoViewModel =     project.model.sampleEntity

// -------------------------------------------------------------------------------------

project.script = project.job.server.toString() + '\n\n'
               + project.job.worker.toString()

return project

})()
