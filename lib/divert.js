"use strict";

var divert = (function() {
   var Generator = (function*(){yield undefined;}).constructor;
   var isGenerator = function(x) {
      return (x instanceof Generator);
   }

   var spawn = function(x) {
      var wrap = function() {
         try {
            x();
         } catch(e) {
            // unhandled exception from generator
         }
      };

      setImmediate(wrap);
   }

   var performer = function(generator, sync) {
      if ( isGenerator(generator) ) {
         var iterator = null;

         if (!sync) {
            sync = function(err, data) {
               var args = arguments;
               if (iterator && !iterator.done) {
                  if (err instanceof Error) {
                     // node-style error
                     spawn(function() {
                        iterator.throw(err);
                     });
                  } else if (arguments.length == 2 && err == null) {
                     // node-style normal flow
                     spawn(function() {
                        iterator.next(data);
                     });
                  } else if (arguments.length == 1) {
                     // callback is invoked with a single value
                     spawn(function() {
                        iterator.next(err);
                     });
                  } else {
                     // callback is invoked in unknown convention
                     spawn(function() {
                        iterator.next(Array.prototype.slice.call(args));
                     });
                  }
               }
            }
         } else {
            // TO DO: Join two diverted sequences
         }

         spawn(function() {
            iterator = generator(sync);
            iterator.next();
         });
      }
   }
   return performer;
}());

if (typeof exports === "object" && typeof module === "object") {
   module.exports = divert;
}
