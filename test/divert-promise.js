const assert = require('assert');
const divert = require('../');

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
});
