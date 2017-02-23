tools    = require('../src/tools.js')
box      = require('../src/box.js')
q        = require('../src/q.js')
mvj      = require('../src/mvj.js')
assert   = require('assert');

assert.jsonEqual = function(a, b) { assert.strictEqual(JSON.stringify(a), JSON.stringify(b))}

app = mvj.model('', { types:{} })
app.commit()

// set primitive, set obj
// rewrite primitive

// commit event order
app.merge({ num:1 })
assert.equal(app.num, 1)

app.merge({ num:3, obj: { str:'hallo' }})
assert.equal(app.num, 3)
assert.equal(app.obj.str, 'hallo')

var step = 0

app.on('commit', c=> assert.strictEqual(step++, 1))
app.num.on('commit', c=> assert.strictEqual(step++, 2))
app.num.on('change', c=> {
    //console.log(c)
    assert.strictEqual(step++, 3)
    assert.strictEqual(c.sender, app.num, 'sender must be app.num')

    assert.deepEqual(c.diff,           new Number(3))
    assert.deepEqual(c.newMembers,     {})
    assert.deepEqual(c.deletedMembers, {})
    assert.deepEqual(c.changedMembers, {})
})
app.num.on('endCommit', c=> assert.strictEqual(step++, 4))

app.obj.on('commit', c=> assert.strictEqual(step++, 5))
app.obj.on('change', c=> {
    //console.log(c)
    assert.strictEqual(step++, 6)
    assert.strictEqual(c.sender, app.obj, 'sender must be app.obj')

    assert.deepStrictEqual(c.diff,     app.obj)

    assert.jsonEqual(c.diff,           { str:'hallo' })
    assert.jsonEqual(c.newMembers,     { str:'hallo' })
    assert.deepEqual(c.deletedMembers, {})
    assert.deepEqual(c.changedMembers, {})
})
app.obj.on('endCommit', c=> assert.strictEqual(step++, 7))

app.on('change', c=> {
    //console.log(c)
    assert.strictEqual(step++, 8)
    assert.strictEqual(c.sender, app, 'sender must be app')

    assert.jsonEqual(c.diff,           { num:new Number(3), obj:{ str:new String('hallo') }})
    assert.jsonEqual(c.newMembers,     { num:new Number(3), obj:{ str:'hallo' }})
    assert.deepEqual(c.deletedMembers, {})
    assert.deepEqual(c.changedMembers, { num:new Number(3) })
})
app.on('endCommit', c=> assert.strictEqual(step++, 9))

assert.strictEqual(step++, 0)
app.commit()

// delete



// set link by path
// set link by Object - cycle
// set link by path - cycle

// test is link
// test parent
// test parent
