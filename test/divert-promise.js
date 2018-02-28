const assert = require('assert');
const divert = require('../');
const fs = require('fs');
const util = require('util');
util.promisify = util.promisify || require('util.promisify').shim();

describe('divert integrates with promises', () => {
   const doAsync = (x) => {
      setImmediate(() => {
         x(undefined, 'async value');
      });
   }

   it('divert returns promise which resolves with value of return statement', (done) => {
      divert(function* (sync) {
         yield doAsync(sync);
         return 'value';
      }).then((result) => {
         assert.equal('value', result, 'promise resolves to return value');
         done();
      });
   });

   it('divert returns promise which rejects with value of exception', (done) => {
      divert(function* (sync) {
         yield doAsync(sync);
         throw new Error('message');
      }).then(() => {
         assert.fail('divert promise is resolved instead been rejected');
      }).catch((err) => {
         assert.equal('message', err.message, 'promise is rejected with correct error information');
         done();
      });
   });

   const array = ['one', 'two', 'three'];

   it('divert for-each returns promise which resolves when loop is finished', (done) => {
      let checkCounter = 0;

      divert.each(array, function* (sync, value) {
         checkCounter++;
      }).then((result) => {
         assert.equal(3, checkCounter, 'for-each callback is called proper number of times before promise is resolved');
         assert.equal(true, result, 'promise resolves to true at the end of the loop');
         done();
      });
   });

   it('divert for-each returns promise which resolves when loop is interrupted', (done) => {
      let checkCounter = 0;

      divert.each(array, function* (sync, value) {
         checkCounter++;
         if (value === 'two') {
            return false;
         }
      }).then((result) => {
         assert.equal(2, checkCounter, 'for-each callback is called proper number of times before promise is resolved');
         assert.equal(false, result, 'promise resolves to false when loop is interrupted');
         done();
      });
   });

   it('divert for-each returns promise which rejects when exception is thrown', (done) => {
      let checkCounter = 0;

      divert.each(array, function* (sync, value) {
         checkCounter++;
         if (value === 'two') {
            throw new Error('message');
         }
      }).then(() => {
         assert.fail('divert for-each promise is resolved instead been rejected');
      }).catch((err) => {
         assert.equal(2, checkCounter, 'for-each callback is called proper number of times before promise is rejected');
         assert.equal('message', err.message, 'promise is rejected with correct error information');
         done();
      });
   });

   it('divert awaits for promise', (done) => {
      divert(function* (sync) {
         const resolved = new Promise((resolve, reject) => {
            setImmediate(() => {
               resolve('async resolve');
            });
         });
         const resolvedValue = yield divert.await(resolved, sync);
         assert.equal('async resolve', resolvedValue, 'yield awaits for promise to resolve and returns the resolved value');

         const rejected = new Promise((resolve, reject) => {
            setImmediate(() => {
               reject(new Error('async reject'));
            });
         });

         try {
            yield divert.await(rejected, sync);
         } catch(error) {
            assert.equal('async reject', error.message, 'yield awaits for promise to reject and throws the rejection error');
            done();
         }
      });
   });

   it('unpromisify example', (done) => {
      const readFilePromisified = util.promisify(fs.readFile);
      divert(function* (sync) {
         const result = yield divert.await(readFilePromisified('test/resources/one.txt', 'utf8'), sync);
         assert.equal('1', result, 'unpromisified value');
         done();
      });
   })
});
