var assert = require("assert");
var fs = require("fs");
var divert = require("../");

describe("divert basic flow", function() {

   it("divert invokes callback with sync parameter", function(done) {
      divert(function* (sync) {
         assert.ok(sync);
         done();
      });
   });

   it("sync parameter must be used as a callback function in all async calls", function(done) {
      divert(function* (sync) {
         var text = (yield fs.readFile("test/resources/one.txt", "utf8", sync)).toString();
         assert.equal("1", text);
         var text = (yield fs.readFile("test/resources/two.txt", "utf8", sync)).toString();
         assert.equal("2", text);
         done();
      });
   });

   it("yield construction throws an exception in case of errors", function(done) {
      divert(function* (sync) {
         try {
            yield fs.readFile("test/resources/unknown.txt", "utf8", sync);
            assert.fail("yeild construnction must throw in case of errors");
         } catch(e) {
            assert.ok(e instanceof Error, "yield construction throws");
            assert.equal("ENOENT", e.code, "error contains valid code");
            done();
         }
      });
   });

   it("yield construction returns a value in case of single-parameter callback convention", function(done) {
      var someAsyncFunction = function(x) {
         setImmediate(function() {
            x("one");
         });
      }

      divert(function* (sync) {
         var text = yield someAsyncFunction(sync);
         assert.equal("one", text, "yield returns single value of callback");
         done();
      });
   });

   it("yield construction returns array of arguments in case of unknown convention", function(done) {
      var someAsyncFunction = function(x) {
         setImmediate(function() {
            x("one", "two");
         });
      }

      divert(function* (sync) {
         var array = yield someAsyncFunction(sync);
         assert.deepEqual(["one", "two"], array, "yield returns array of arguments");
         done();
      });
   });
});
