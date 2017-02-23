tools    = require('../src/tools.js')
box      = require('../src/box.js')
q        = require('../src/q.js')
mvj      = require('../src/mvj.js')
assert   = require('assert');

assert.jsonEqual = function(a, b) { assert.strictEqual(JSON.stringify(a), JSON.stringify(b)) }

app = mvj.model('', { types:{} })
app.commit()

app.merge({
    a:{
        bool:true
    },
    b:{
        c:app,
        //d:b
    }
})
assert.equal(app.b.c.a.bool, true)
assert.equal(app.b.c.b.c.a.bool, true)

app.commit()

