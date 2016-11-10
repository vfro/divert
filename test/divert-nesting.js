const assert = require('assert');
const divert = require('../');

describe('divert can be nested', function() {
   it('divert accepts node-style callback as a second parameter', function(done) {
      divert(function*(sync) {
         const result = yield divert(function*() {
               return true;
            }, function(err, result) {
               assert.ifError(err);
               assert.ok(result, 'result of nested divert can be obtained through callback');
               done();
            });
      });
   });

   it('divert accepts sync as a second parameter', function(done) {
      divert(function*(sync) {
         const result = yield divert(function*() {
               return true;
            }, sync);
         assert.ok(result, 'result of nested divert can be obtained through callback');
         done();
      });
   });

   it('divert invokes a callback only for the last time', function(done) {
      const doAsync = function(x) {
         setImmediate(function() {
            x(null, false);
         });
      }

      divert(function*(sync) {
         const result = yield divert(function*(sync) {
               yield doAsync(sync);
               return true;
            }, sync);
         assert.ok(result, 'only the last returned result is obtained through callback');
         done();
      });
   });

   it('exception can be thrown through several levels of divert', function(done) {
      divert(function*(sync) {
         try {
            yield divert(function*(sync) {
               yield divert(function*(sync) {
                  throw Error('error message');
               }, sync);
            }, sync);
            assert.fail('exception must be thrown by yield construction');
         }
         catch(e) {
            assert.equal('error message', e.message, 'exception is thrown through several levels of divert');
            done();
         }
      });
   });
});
