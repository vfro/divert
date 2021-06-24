const assert = require('assert');
const fs = require('fs');
const fsPromises = require('fs/promises');
const divert = require('../');
const util = require('util');
util.promisify = util.promisify || require('util.promisify').shim();

describe('divert async generator', () => {
  it('generator function can be async and use await', (done) => {
    divert(async function* (sync) {
       let text = await fsPromises.readFile('test/resources/one.txt', 'utf8');
       assert.strictEqual('1', text, 'promisified value');
       text = (yield fs.readFile('test/resources/two.txt', 'utf8', sync)).toString();
       assert.strictEqual('2', text, 'unpromisified value');
     done();
    });
  });
});
