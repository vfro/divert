"use strict";

var divert = (function() {
   var Generator = (function*(){yield undefined;}).constructor;
   var isGenerator = function(x) {
      return (x instanceof Generator);
   }

   var errorHandler = function(e) {
      console.error(e.stack);
   }

   var spawn = function(x) {
      var wrap = function() {
         try {
            x();
         } catch(e) {
            errorHandler(e);
         }
      };

      setImmediate(wrap);
   }

   var performer = function(generator, sync) {
      if ( !isGenerator(generator) ) {
         throw TypeError("Divert first parameter must be generator.");
      }

      var iterators = null;

      if (!sync) {
         iterators = [];

         sync = function(err, data) {
            var args = arguments;

            if (sync.iterators.length > 0) {
               var iterator = sync.iterators[sync.iterators.length - 1];
               var next = function(value) {
                  var result = iterator.next(value);
                  if (result.done) {
                     sync.iterators.pop();
                     sync();
                  }
               }

               if (err instanceof Error) {
                  // node-style error
                  spawn(function() {
                     iterator.throw(err);
                     sync.iterators.pop();
                  });
               } else if (arguments.length == 2 && err == null) {
                  // node-style normal flow
                  spawn(function() {
                     next(data);
                  });
               } else if (arguments.length == 0) {
                  // callback is invoked without arguments
                  spawn(function() {
                     next();
                  });
               } else if (arguments.length == 1) {
                  // callback is invoked with a single value
                  spawn(function() {
                     next(err);
                  });
               } else {
                  // callback is invoked in unknown convention
                  spawn(function() {
                     next(Array.prototype.slice.call(args));
                  });
               }
            }
         };
         sync.iterators = iterators;
      } else {
         iterators = sync.iterators;
      }

      var iterator = generator(sync);
      iterators.push(iterator);
      sync();
   }

   performer.errorHandler = function(newHandler) {
      errorHandler = newHandler;
   }

   return performer;
}());

if (typeof exports === "object" && typeof module === "object") {
   module.exports = divert;
}
