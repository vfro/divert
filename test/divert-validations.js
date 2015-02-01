var assert = require("assert");
var divert = require("../");

describe("divert parameters validation", function() {
   it("divert ensures that first parameter is a generator", function(done) {
      assert.throws(function() {
            divert(function() { return "I am not a generator"; });
         }, TypeError);
      done();
   });

   it("divert ensures that last parameter is a sync callback", function(done) {
      assert.throws(function() {
            divert(function* () { return "I am a generator"; }, "but I am not a sync callback");
         }, TypeError);
      done();
   });

   it("several generators can be passed", function(done) {
      assert.doesNotThrow(function() {
            divert(function* () { return "I am a generator"; }, function* () { return "I am a generator too"; });
            done();
         });
   });

   it("several generators can be passed with sync parameter", function(done) {
      divert(function* (sync) {
         assert.doesNotThrow(function() {
               divert(function* () { return "I am a generator"; }, function* () { return "I am a generator too"; }, sync);
               done();
            });
      });
   });

   it("several generators can be passed as an array as well", function(done) {
      assert.doesNotThrow(function() {
            divert([function* () { return "I am a generator"; }, function* () { return "I am a generator too"; }]);
            done();
         });
   });

   it("several generators can be passed as an array plus sync parameter", function(done) {
      divert(function* (sync) {
         assert.doesNotThrow(function() {
               divert([function* () { return "I am a generator"; }, function* () { return "I am a generator too"; }], sync);
               done();
            });
      });
   });
});
