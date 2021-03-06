{
    type:'View',
    icon:'📈',
    modelTypes:['Job'],
    idx:0,
    ctor:function jobStateGantD3View(jobModel)
    {
        function jobPlotGant(view, jobModel)
        {
            var toSmallTimeSpan = date=> '' + date.getHours() +':'+
                                            date.getMinutes() +':'+
                                            date.getSeconds() +'.'+
                                            date.getMilliseconds()

            var jobToDomain  = j=> j.icon ? j.id.valueOf() + ' ' + j.icon.valueOf() : j.id.valueOf()
            var buildDomain  = data=> ['commits'].concat(data.jobs.map(d=> jobToDomain(d)))

            //var getDebug     = function(j) { return j.debugRemote ? j.debugRemote : j.debug }
            var getDebug     = function(j) { return j.debug }
            var getColor     = function(j) { return config.getColor(j.state) }
            var getStartTime = function(j) { return new Date(getDebug(j).createTime.valueOf()) }
            var getEndTime   = function(j) { return new Date(getDebug(j).updateTime.valueOf()) }

            function handleMouseOver() { }
            function handleMouseOut() { }

            var w = 820
            var h = 820
            var m = { top:30, right:30, bottom:30, left:100 }
            var data = { jobs:[] }
            var t = 500//750
            var mergeDotR = 5
            var uiUpdateDotR = 6
            var jobBarHeight = 5
            var beginTime = getStartTime(jobModel)
            var lastCommitEnd = 0

            function handleMouseClick() {
                if (d3g.focus === this) {
                    d3g.focus = undefined
                    d3.select(this)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1.5)
                        .attr('stroke-dasharray', undefined)
                }
                else {
                    d3.select(d3g.focus)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1.5)
                        .attr('stroke-dasharray', undefined)
                    d3g.focus = this
                    d3.select(this)
                        .attr('stroke', '#555')
                        .attr('stroke-width', 0.4)
                        .attr('stroke-dasharray', "3 2")
                        //.attr('r', 8)
                }
                view.setFocus(d3g.focus.__data__)
            }

            var d3g = {}
            d3g.focus = null            
            d3g.init = function() {  // d3g.(vis x y xaxes yaxes )
                this.zoom = d3.zoom()
                    .scaleExtent([0.8, 10])
                    .on("zoom", ()=> {
                        this.x = d3.event.transform.rescaleX(this.xz0)
                        this.y = d3.event.transform.rescaleY(this.yz0)
                        this.xAxis.scale(this.x)
                        this.yAxis.scale(this.y)
                        this.redrawAll(0)
                    })

                this.vis = d3.select(view)
                    .append("svg")
                    //.attr("width", '100%')
                    //.attr("height", '100%')
                    .attr('viewBox', '0 0 820 820')
                    .call(this.zoom)

                this.x = this.xz0 = d3.scaleTime()
                    .range([m.left, w-m.right])
                    .domain([beginTime, new Date()])

                this.y = this.yz0 = d3.scaleBand()
                    .align(0)
                    .range([m.top, h-m.bottom])
                    .domain(buildDomain(data))

                this.xAxis = d3.axisBottom().scale(this.x)
                this.yAxis = d3.axisLeft().scale(this.y)

                this.clip = this.vis.append('clipPath')
                    .attr('id', 'clip')
                    .append('rect')
                        .attr("x", m.left)
                        .attr("y", m.top)
                        .attr("width", w-m.left-m.right)
                        .attr("height", h-m.top-m.bottom)

                this.box = this.vis.append('g').attr("clip-path", 'url(#clip)')
                this.box.append("svg:g").attr("class", "d3commits")
                this.box.append("svg:g").attr("class", "d3jobs")

                this.vis.append("svg:g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (h-m.bottom) + ")")
                    .call(this.xAxis)

                this.vis.append("svg:g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + m.left + ", " + 0 + ")")
                    .call(this.yAxis)
            }

            d3g.updateDomain = function(){
                var endTime = getEndTime(jobModel) > lastCommitEnd
                            ? getEndTime(jobModel)
                            : lastCommitEnd
                this.xz0.domain([beginTime, endTime])
                this.yz0.domain(buildDomain(data))
            }

            //----------------------------------------------------------------------------------------

            d3g.appendCircle = function(v, m, r, c, l) {
                v.append('circle')
                    .datum(m)
                    .attr("class", "dot")
                    .attr("r",  r)
                    .attr('fill', c)
                    .attr('stroke-width', 1.5)
                    .attr('stroke', l||'#fff')
                    .attr('cursor', 'pointer')
                    .on('click', d=> view.setFocus(d.c)) //handleMouseClick)
                    .attr("cx", d=> this.x(d.t))
            }

            d3g.addJob = function(jm) {
                console.assert(getStartTime(jm).getTime() <= getEndTime(jm).getTime())

                data.jobs.push(jm)
                this.updateDomain()

                var d3job = this.vis.select('.d3jobs')
                    .append('g')
                    .datum(jm)
                    .attr('id', 'd3job-'+jm.id.valueOf())
                    .attr("class", "d3job")
                    .attr("transform", d=> 'translate(0,'+(this.y(jobToDomain(d)) + this.y.bandwidth()/2) +')')

                d3job.append("rect")
                    .datum(jm)
                    .attr("class", "jline")
                    .attr("y", -jobBarHeight/2)
                    .attr("height", jobBarHeight)
                    .attr('cursor', 'pointer')
                    //.attr('fill', '#ccc')
                    .attr('fill', d=> config.getColor(d.state))
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1)
                    .on('click', handleMouseClick)
                    .attr("x",     d=> this.x(getStartTime(d)))
                    .attr("width", d=> this.x(getEndTime(d))-this.x(getStartTime(d)))

                this.appendCircle(d3job, { t:new Date(), c:'created with parent' }, 4, '#ccc')
                this.appendCircle(d3job, { t:new Date(jm.debug.createTime) }, 4, config.jobStatTypeColorMap.idle)
                if (jm.debug.callTime)
                    this.appendCircle(d3job, { t:new Date(jm.debug.callTime) }, 4, config.jobStatTypeColorMap.calling)

                if (jm.debug.returnTime)
                    this.appendCircle(d3job, { t:new Date(jm.debug.returnTime) }, 4, config.getColor(jm.state))
            }

            var uiUpdateConut = 0
            d3g.addUiUpdate = function(jm, changes) {

                var v = this.vis.select('.d3jobs').select("#d3job-"+jm.id.valueOf())
                //var c = jm.id.valueOf() + JSON.stringify(changes.diff, 0, 4)
                var diffCopy = JSON.parse(JSON.stringify(changes.diff, 0, 4))
                var diffId = "d3j-" + jm.id.valueOf() + '-' + uiUpdateConut++
                app.merge({ tmp:{ [diffId]:diffCopy }})
                var c = app.tmp[diffId]
                //var c = diffCopy

                this.appendCircle(v, { t:new Date(), c:c }, uiUpdateDotR, hexToRgba('cccccc',0.05), hexToRgba('555555',0.05))
                this.appendCircle(v, { t:new Date(jm.debug.updateTime), c:c }, 4, config.getColor(jm.state))

                this.updateDomain()
            }

            d3g.addCommit = function(j, s, e) {
                //w = view.clientWidth
                this.updateDomain()
                lastCommitEnd = e
                var cm = { j:j, s:s, e:e }

                var d3commits = this.vis.select('.d3commits')
                d3commits.append("rect")
                    .datum(cm)
                    .attr("class", "crect")
                    .attr("y",      d=> m.top)
                    .attr("height", d=> h-m.top)
                    .attr('fill',   '#eee')
                    .attr('opacity', 0.2)
                    .attr('stroke', '#bbb')
                    .attr('stroke-width', 0.2)
                    .attr("x",      d=> this.x(d.s))
                    .attr("width",  d=> this.x(d.e)-this.x(d.s))

                d3commits.append("line")
                    .datum(cm)
                    .attr("class", "cline")
                    .attr('stroke', '#eee')
                    .attr('stroke-width', 2)
                    .attr("x1", d=> this.x(d.s))
                    .attr("x2", d=> this.x(d.e))
                    .attr("y1", d=> this.y('commits') + this.y.bandwidth()/2)
                    .attr("y2", d=> this.y('commits') + this.y.bandwidth()/2)

                d3commits.append("circle")
                    .datum(cm)
                    .attr("class", "dot")
                    .attr("r",  3)
                    .attr('fill', '#bbb')
                    .attr('stroke-width', 1.5)
                    .attr('stroke', '#fff')
                    .on('click', handleMouseClick)
                    .attr("cx", d=> this.x(d.e))
                    .attr("cy", d=> this.y('commits') + this.y.bandwidth()/2)

                this.redrawAll(t)
            }

            d3g.redrawAll = function(t) {
                var vist = this.vis.transition()
                vist.select(".x.axis")
                    .duration(t)
                    .call(this.xAxis)

                vist.select(".y.axis")
                    .duration(t)
                    .call(this.yAxis)

                // jobs
                var d3jobs = vist.select('.d3jobs')
                d3jobs.selectAll(".d3job")
                    .duration(t)
                    .attr("transform", d=> 'translate(0,'+(this.y(jobToDomain(d)) + this.y.bandwidth()/2) +')')

                d3jobs.selectAll(".jline")
                    .duration(t)
                    .attr("x",     d=> this.x(getStartTime(d)))
                    .attr("width", d=> this.x(getEndTime(d))-this.x(getStartTime(d)))
                    .attr('fill',  d=> config.getColor(d.state))

                d3jobs.selectAll(".dot")
                    .duration(t)
                    .attr("cx", d=> this.x(d.t))

                // commits
                var d3commits = vist.select('.d3commits')
                d3commits.selectAll(".cline")
                    .duration(t)
                    .attr("x1", d=> this.x(d.s))
                    .attr("x2", d=> this.x(d.e))
                    .attr("y1", d=> this.y('commits') + this.y.bandwidth()/2)
                    .attr("y2", d=> this.y('commits') + this.y.bandwidth()/2)

                d3commits.selectAll(".crect")
                    .duration(t)
                    .attr("x",      d=> this.x(d.s))
                    .attr("width",  d=> this.x(d.e) - this.x(d.s))
                    .attr("y",      d=> m.top)
                    .attr("height", d=> h-m.top)

                d3commits.selectAll(".dot")
                   .duration(t)
                   .attr("cx", d=> this.x(d.e))
                   .attr("cy", d=> this.y('commits') + this.y.bandwidth()/2)
            }

            d3g.init()
            return d3g
        }

        var view = d3View('plot', jobPlotGant, jobModel)
            view.d3handler = jobPlotGant(view, jobModel)

        function addJob(jm) {
            view.d3handler.addJob(jm)
            jm.on('change', changes=> view.d3handler.addUiUpdate(jm, changes))

            updateJob({ newMembers:jm }, jm.path)
            jm.on('change', updateJob)

            //if (jm.subjobs) { //jm.subjobs.forEach((v, k, idx)=> addJob(v))
            //    console.warn('+++++++++++++++++++++', jm.id.valueOf(), Object.keys(jm.subjobs))
            //}
        }

        function updateJob(changes, nodeId) {

            //w = view.offsetWidth
            function updateSubjobs(changes) {
                if (changes.newMembers)
                    changes.newMembers.forEach((v, k, idx)=> addJob(v))
            }

            if (changes.newMembers)
                if (changes.newMembers.subjobs) {
                    if (true) // es sollte nur gewarnt werden wenn bereits vorhanden
                        console.warn('+++++++++++++++++++++', Object.keys(changes.newMembers.subjobs))
                    updateSubjobs({ newMembers:changes.newMembers.subjobs })
                    changes.newMembers.subjobs.on('change', updateSubjobs)
                }
        }

        var beginLastCommit = new Date()
        addJob(jobModel)
        //view.d3handler.addCommit(jobModel, beginLastCommit, new Date())
        view.d3handler.updateDomain()
        view.d3handler.redrawAll()

        jobModel.on('commit', ()=> beginLastCommit = new Date())
        jobModel.on('endCommit', ()=> {
            //if (beginLastCommit)
                view.d3handler.addCommit(jobModel, beginLastCommit, new Date())
        })

        return view
    }
}
