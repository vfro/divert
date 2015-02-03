var assert = require('assert');
var fs = require('fs');
var divert = require('../');

describe('divert basic flow', function() {
   it('divert invokes callback with sync parameter', function(done) {
      divert(function* (sync) {
         assert.ok(sync);
         done();
      });
   });

   it('sync parameter must be used as a callback function in all async calls', function(done) {
      divert(function* (sync) {
         var text = (yield fs.readFile('test/resources/one.txt', 'utf8', sync)).toString();
         assert.equal('1', text);
         var text = (yield fs.readFile('test/resources/two.txt', 'utf8', sync)).toString();
         assert.equal('2', text);
         done();
      });
   });

   it('yield construction throws an exception in case of errors', function(done) {
      divert(function* (sync) {
         try {
            yield fs.readFile('test/resources/unknown.txt', 'utf8', sync);
            assert.fail('yield construction must throw in case of errors');
         } catch(e) {
            assert.ok(e instanceof Error, 'yield construction throws');
            assert.equal('ENOENT', e.code, 'error contains valid code');
            done();
         }
      });
   });

   it('yield construction returns undefined in case if callback is called without parameters', function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x();
         });
      }

      divert(function* (sync) {
         var none = yield doAsync(sync);
         assert.equal(undefined, none, 'yield construction returns undefined');
         done();
      });
   });

   it('yield construction returns a value in case of single parameter callback convention', function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x('one');
         });
      }

      divert(function* (sync) {
         var text = yield doAsync(sync);
         assert.equal('one', text, 'yield returns single value of callback');
         done();
      });
   });

   it('yield construction returns array of arguments in case of multiple parameters callback convention', function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x(null, 'one', 'two');
         });
      }

      divert(function* (sync) {
         var array = yield doAsync(sync);
         assert.deepEqual(['one', 'two'], array, 'yield returns array of arguments without nulls');
         done();
      });
   });

   it('yield construction returns array of arguments in case of unknown convention', function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x('one', 'two');
         });
      }

      divert(function* (sync) {
         var array = yield doAsync(sync);
         assert.deepEqual(['one', 'two'], array, 'yield returns array of arguments');
         done();
      });
   });

   it('invocation of divert generator is asynchronous', function(done) {
      var async = true;
      var checked = false;
      divert(function* (sync) {
         async = false;
         assert.ok(checked, 'it is checked now that generator is asynchronous');
         done();
      });
      assert.ok(async, 'generator is not invoked yet');
      checked = true;
   });
});
