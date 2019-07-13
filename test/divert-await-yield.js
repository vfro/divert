const assert = require('assert');
const fs = require('fs');
const divert = require('../');
const util = require('util');
util.promisify = util.promisify || require('util.promisify').shim();

describe('divert async generator', () => {
  it('generator function can be async and use await', (done) => {
    const readFilePromisified = util.promisify(fs.readFile);
    divert(async function* (sync) {
       let text = await readFilePromisified('test/resources/one.txt', 'utf8');
       assert.equal('1', text, 'promisified value');
       text = (yield fs.readFile('test/resources/two.txt', 'utf8', sync)).toString();
       assert.equal('2', text, 'unpromisified value');
     done();
    });
  });
});
