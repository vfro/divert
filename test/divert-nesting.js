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
});
