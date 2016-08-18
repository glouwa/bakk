(function(exports)
{
    exports.type = 'Set<Config>'
    exports.server = {}
    exports.server.wshost          = 'desktop'
    exports.server.wsport          = 1336
    exports.server.httpport        = 1337
    exports.client = {}
    exports.client.reconnectIntervall = 300
    exports.colors = {}
    exports.colors.disabledIcon    = 'lightgray'
    exports.colors.enabledIcon     = '#00CC66'
    exports.colors.paperBorder     = '#FdFdFd'  //'#FcFcFc' '#FEFEFE' old btab color
    exports.clientDefaultSimConfig = {
        type: 'SimConfig',

        exception:  { active:false, icon:'⚡',  text:'throw an exception', value:'fatal', pof:'atWork' },
        stopWork:   { active:false, icon:'☠',  text:'stop working',       pof:'atWork'                },
        delayed:    { active:false,  icon:'🐌', text:'work slowly',        value:150                    }, //🐌⌛
        //disconnect: { active:false, icon:'↛',  text:'disconnect',       pof:'afterRequest' },
        delegate:   { active:false, icon:'☞',  text:'delegate to server'   },
        lognet:     { active:false, icon:'☍',  text:'log network messages' }, //ⶨ
        logjob:     { active:true,  icon:'⥂', text:'log job messages'     }, //⇌
        logapp:     { active:false, icon:'⚘',  text:'log app messages'     }, //⚘
    }
    exports.serverDefaultSimConfig = {
        type: 'SimConfig',

        exception:  { active:false, icon:'⚡',  text:'throw an exception', value:'recoverable', pof:'beforeWork' },
        stopWork:   { active:false, icon:'☠',  text:'stop working',                            pof:'beforeWork' },
        //disconnect = { active:false, icon:'↛',  text:'disconnect',                           pof:'afterRequest' },
        lognet:     { active:false, icon:'☍',  text:'log network messages' },
        logjob:     { active:true,  icon:'⥂', text:'log job messages'     },
        logapp:     { active:false, icon:'⚘',  text:'log app messages'     }, // ⎎
    }

    exports.jobStatTypeIconMap =
    {
        idle:            '…',
        calling:         '→',
        running:         '',
        canceling:       ' ⃕✗',
        returned:        '?',
    }

    exports.jobStateDetailIconMap =
    {
        // calling
        requests:        ' ⃕',

        // returned
        ok:              '✓',
        canceled:        '✗',
        failed:          '⛐',
        fatal:           '⚡',
        recoverable:     '⛈',
        timeout:         '☠',

        // running
        delegates:       ' ⃕',
        recovering:      '⚠',
        loaded:          '⊶', //⚯☍
        found:           '⋆',  //⋆•
        compared:        ''
    }

    exports.getIcon = function(state)
    {
        if (state.detail)
            var i = exports.jobStateDetailIconMap[state.detail.valueOf()]
        if (i)
            return i
        return exports.jobStatTypeIconMap[state.type.valueOf()]
    }

    exports.jobStatTypeColorMap =
    {
        idle:            '#FFA500',
        calling:         '#FFD900',
        running:         '#A5F7B8',
        canceling:       '#EAB0F1',
        returned:        '#FF0000',
    }

    exports.jobStateDetailColorMap =
    {
        // calling
        requests:        '#FFD900',

        // returned
        ok:              '#00CC66',
        canceled:        '#D167DE',

        // running
        loaded:          '#80CCE6', //⚯☍
        found:           '#80CCE6'  //⋆•
    }

    exports.getColor = function(state)
    {
        //if (state.detail)
            var i = exports.jobStateDetailColorMap[state.detail.valueOf()]
        if (i)
            return i
        return exports.jobStatTypeColorMap[state.type.valueOf()]
    }
})
(typeof exports === 'undefined' ? this['config']={} : exports)

