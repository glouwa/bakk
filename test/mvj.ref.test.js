tools    = require('../src/tools.js')
box      = require('../src/box.js')
q        = require('../src/q.js')
mvj      = require('../src/mvj.js')
assert   = require('assert');

assert.jsonEqual = function(a, b) { assert.strictEqual(JSON.stringify(a), JSON.stringify(b)) }

app = mvj.model('', { types:{} })
app.commit()

app.merge({
    num:1,
    obj:{
        bool:true
    }
})
assert.equal(app.obj.bool, true)
app.commit()

var step = 0
assert.strictEqual(step++, 0)

app.merge({
    link:app.obj
})
assert.strictEqual(app.obj, app.link)
assert.deepEqual(app.link.bool, new Boolean(true))

app.on('change', c=> {
    //console.log(c)
    assert.strictEqual(step++, 2)
    assert.strictEqual(c.diff.link, app.obj)
})

app.obj.on('change', c=> assert.ok(false))
app.link.on('change', c=> assert.ok(false))

assert.strictEqual(step++, 1)
app.commit()

// check new value everywhere

app.obj.merge({ bool:false })
assert.equal(app.obj.bool, false)
assert.equal(app.link.bool, false)

