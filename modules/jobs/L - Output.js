function localOutput(j, diff)
{    
    j.merge({
        state:{ progress: 0.1, type: 'running', log:'setting output reference' },
        //output: app.model.store[j.id.valueOf()]
    })

    j.updateJob({
        state:{
            progress: 0.5,
            log: 'adding greetings to output'
        },
        output:{
            greetings: 'Hello world!',            
            obj: {
                boolOutput: true
            }
        }
    })

    j.updateJob({
        state:{
            progress: 0.95
        },
        output:{
            greetings: 'Hello universe!',
            obj: {
                boolOutput: false,
                numberOutput: 7,
                realOutput: 7.7
            }
        }
    })

    //throw new Error('try it')
    // try also to forget to return
    j.ret('ok', 'no exceptions')
}

new Object({
    type:'Project',
    jobPrototype: {
        type:'JobPrototype',
        icon:'🗩',
        desc:'Generate some output',
        args:{
            timeout: 200
        },
        onCall:localOutput
    }
})


