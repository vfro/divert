const assert = require('assert');
const fs = require('fs');
const divert = require('../');

describe('divert for-each flow', () => {
   it('divert invokes callback for each element in an array', (done) => {
      const array = [0, 2, 4, 6, 8, 10];
      let checkCounter = 0;

      divert(function* (sync) {
         const result = yield divert.each(array, function* (sync, value, index, collection) {
            // for-each generator can yield values with using of sync callback
            yield setImmediate(sync);

            assert.strictEqual(checkCounter++, index, 'for-each callback is called for proper index');
            assert.strictEqual(index * 2, value, 'for-each callback is called for proper value');
            assert.strictEqual(collection, array, 'for-each callback is called for proper collection');
         }, sync);

         assert.strictEqual(array.length, checkCounter, 'for-each callback is called proper number of times');
         assert.ok(result, 'for-each must return true in normal flow');
         done();
      });
   });

   it('divert invokes callback for each element in an object', (done) => {
      const object = {
         first: 'one',
         second: 'two',
         third: 'three'
      };
      let checkCounter = 0;

      divert(function* (sync) {
         const result = yield divert.each(object, function* (sync, value, index, collection) {
            checkCounter++;

            // for-each generator can yield values with using of sync callback
            yield setImmediate(sync);

            if (checkCounter === 1) {
               assert.strictEqual('first', index, 'for-each callback is called for proper index first time');
               assert.strictEqual('one', value, 'for-each callback is called for proper value first time');
            } else if (checkCounter === 2) {
               assert.strictEqual('second', index, 'for-each callback is called for proper index second time');
               assert.strictEqual('two', value, 'for-each callback is called for proper value second time');
            } else if (checkCounter === 3) {
               assert.strictEqual('third', index, 'for-each callback is called for proper index third time');
               assert.strictEqual('three', value, 'for-each callback is called for proper value third time');
            } else {
               assert.fail('for-each callback is called fourth time');
            }
            assert.strictEqual(collection, object, 'for-each callback is called for proper object');
         }, sync);

         assert.strictEqual(3, checkCounter, 'for-each callback is called proper number of times');
         assert.ok(result, 'for-each must return true in normal flow');
         done();
      });
   });

   it('generator can break for-each loop when it is called for an array', (done) => {
      const array = [0, 2, 4, 6, 8, 10];
      let checkCounter = 0;

      divert(function* (sync) {
         const result = yield divert.each(array, function* (sync, value, index, collection) {
            checkCounter++;
            return false;
         }, sync);

         assert.strictEqual(1, checkCounter, 'for-each callback is called proper number of times');
         assert.strictEqual(false, result, 'for-each break can be detected by return value');
         done();
      });
   });

   it('generator can throw an exception when it is called for an array', (done) => {
      const array = [0, 2, 4, 6, 8, 10];
      let checkCounter = 0;

      divert(function* (sync) {
         try {
            yield divert.each(array, function* (sync, value, index, collection) {
               checkCounter++;
               throw new Error('throw Error from for-each');
            }, sync);
         }
         catch(e) {
            assert.strictEqual(1, checkCounter, 'for-each callback is called proper number of times');
            assert.strictEqual('throw Error from for-each', e.message, 'for-each callback is called proper number of times');
            done();
         }
      });
   });

   it('generator can break for-each loop when it is called for an object', (done) => {
      const object = {
         first: 'one',
         second: 'two',
         third: 'three'
      };
      let checkCounter = 0;

      divert(function* (sync) {
         const result = yield divert.each(object, function* (sync, value, index, collection) {
            checkCounter++;
            return false;
         }, sync);

         assert.strictEqual(1, checkCounter, 'for-each callback is called proper number of times');
         assert.strictEqual(false, result, 'for-each break can be detected by return value');
         done();
      });
   });

   it('generator can throw an exception when it is called for an array', (done) => {
      const object = {
         first: 'one',
         second: 'two',
         third: 'three'
      };
      let checkCounter = 0;

      divert(function* (sync) {
         try {
            yield divert.each(object, function* (sync, value, index, collection) {
               checkCounter++;
               throw new Error('throw Error from for-each');
            }, sync);
         }
         catch(e) {
            assert.strictEqual(1, checkCounter, 'for-each callback is called proper number of times');
            assert.strictEqual('throw Error from for-each', e.message, 'for-each callback is called proper number of times');
            done();
         }
      });
   });
});
