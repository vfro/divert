const assert = require('assert');
const divert = require('../');

describe('divert integrates with promises', function() {
   const doAsync = function(x) {
      setImmediate(function() {
         x(undefined, 'async value');
      });
   }

   it('divert returns promise which resolves with value of return statement', function(done) {
      divert(function* (sync) {
         yield doAsync(sync);
         return 'value';
      }).then(function(result) {
         assert.equal('value', result, 'promise resolves to return value');
         done();
      });
   });

   it('divert returns promise which rejects with value of exception', function(done) {
      divert(function* (sync) {
         yield doAsync(sync);
         throw new Error('message');
      }).then(function() {
         assert.fail('divert promise is resolved instead been rejected');
      }).catch(function(err) {
         assert.equal('message', err.message, 'promise is rejected with correct error information');
         done();
      });
   });

   const array = ['one', 'two', 'three'];

   it('divert for-each returns promise which resolves when loop is finished', function(done) {
      let checkCounter = 0;

      divert.each(array, function* (sync, value) {
         checkCounter++;
      }).then(function(result) {
         assert.equal(3, checkCounter, 'for-each callback is called proper number of times before promise is resolved');
         assert.equal(true, result, 'promise resolves to true at the end of the loop');
         done();
      });
   });

   it('divert for-each returns promise which resolves when loop is interrupted', function(done) {
      let checkCounter = 0;

      divert.each(array, function* (sync, value) {
         checkCounter++;
         if (value === 'two') {
            return false;
         }
      }).then(function(result) {
         assert.equal(2, checkCounter, 'for-each callback is called proper number of times before promise is resolved');
         assert.equal(false, result, 'promise resolves to false when loop is interrupted');
         done();
      });
   });

   it('divert for-each returns promise which rejects when exception is thrown', function(done) {
      let checkCounter = 0;

      divert.each(array, function* (sync, value) {
         checkCounter++;
         if (value === 'two') {
            throw new Error('message');
         }
      }).then(function() {
         assert.fail('divert for-each promise is resolved instead been rejected');
      }).catch(function(err) {
         assert.equal(2, checkCounter, 'for-each callback is called proper number of times before promise is rejected');
         assert.equal('message', err.message, 'promise is rejected with correct error information');
         done();
      });
   });
});
