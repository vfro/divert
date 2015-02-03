var assert = require('assert');
var divert = require('../');

describe('divert can be nested', function() {
   it('divert accepts node-style callback as a second parameter', function(done) {
      divert(function*(sync) {
         var result = yield divert(function*() {
               return true;
            }, sync);
         assert.ok(result, 'result of nested divert can be obtained through callback');
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
