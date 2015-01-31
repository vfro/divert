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

   it("yield construction trows an exception in case of errors", function(done) {
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
});
