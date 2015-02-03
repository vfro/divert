var assert = require('assert');
var divert = require('../');

describe('divert parameters validation', function() {
   it('divert ensures that first parameter is a generator', function(done) {
      assert.throws(function() {
            divert(function() { return 'I am not a generator'; });
         }, TypeError);
      done();
   });
});
