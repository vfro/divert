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
            assert.fail("yield construction must throw in case of errors");
         } catch(e) {
            assert.ok(e instanceof Error, "yield construction throws");
            assert.equal("ENOENT", e.code, "error contains valid code");
            done();
         }
      });
   });

   it("yield construction returns undefined in case if callback is called without parameters", function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x();
         });
      }

      divert(function* (sync) {
         var none = yield doAsync(sync);
         assert.equal(undefined, none, "yield construction returns undefined");
         done();
      });
   });

   it("yield construction returns a value in case of single-parameter callback convention", function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x("one");
         });
      }

      divert(function* (sync) {
         var text = yield doAsync(sync);
         assert.equal("one", text, "yield returns single value of callback");
         done();
      });
   });

   it("yield construction returns array of arguments in case of unknown convention", function(done) {
      var doAsync = function(x) {
         setImmediate(function() {
            x("one", "two");
         });
      }

      divert(function* (sync) {
         var array = yield doAsync(sync);
         assert.deepEqual(["one", "two"], array, "yield returns array of arguments");
         done();
      });
   });
});

describe("divert sub-flow must reuse same sync parameter to execute sequentially", function() {
   it("sequential sub-divert", function(done) {
      var i = 0;
      var doAsync = function(x) {
         setImmediate(function() {
            x(++i);
         });
      }

      divert(function* (sync) {
         var value = yield doAsync(sync);
         assert.equal(1, value, "before sub-divert");

         yield divert(function* (newSync) {
            assert.ok(newSync === sync, "sync instance is the same");
            var value = yield doAsync(sync);
            assert.equal(2, value, "a call inside sub-divert");

            var value = yield doAsync(sync);
            assert.equal(3, value, "verify that sub-divert continues");
         }, sync);

         var value = yield doAsync(sync);
         assert.equal(4, value, "after sub-divert");
         done();
      });
   });

   it("async sub-divert", function(done) {
      var i = 0;
      var doAsync = function(x) {
         setImmediate(function() {
            x(++i);
         });
      }

      divert(function* (sync) {
         var value = yield doAsync(sync);
         assert.equal(1, value, "before async sub-divert");

         divert(function* (newSync) {
            assert.ok(newSync != sync, "new instance of sync in async sub-divert");
            var value = yield doAsync(newSync);
            assert.ok(value === 2 || value === 3, "async call inside sub-divert");
         });

         var value = yield doAsync(sync);
         assert.ok(value === 2 || value === 3, "after async sub-divert");
         done();
      });
   });
});

describe("parallel diverts flow", function() {
   it("several diverts may be performed asynchronously", function(done) {
      var i = 0;
      var doAsync = function(x) {
         setImmediate(function() {
            x(++i);

            if (i == 4) {
               done();
            }
         });
      }

      divert(function* (sync) {
         var value = yield doAsync(sync);
         assert.ok(value < 6, "1.1) async divert");

         var value = yield doAsync(sync);
         assert.ok(value < 7, "1.2) async divert");
      });

      divert(function* (sync) {
         var value = yield doAsync(sync);
         assert.ok(value < 6, "2.1) async divert");

         var value = yield doAsync(sync);
         assert.ok(value < 7, "2.2) async divert");
      });

      divert(function* (sync) {
         var value = yield doAsync(sync);
         assert.ok(value < 6, "2.1) async divert");

         var value = yield doAsync(sync);
         assert.ok(value < 7, "2.2) async divert");
      });
   });
});

describe("divert error handler is customizable", function() {
   it("customize divert error handler", function(done) {
      divert.errorHandler(function(e) {
         assert.equal("custom error", e, "exception from divert");
         done();
      });

      divert(function* (sync) {
         throw "custom error";
      });
   });
});
