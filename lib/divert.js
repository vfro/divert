var divert = (function() {
   "use strict";

   var Generator = (function*(){yield undefined;}).constructor;
   var isGenerator = function(x) {
      return (x instanceof Generator);
   }

   var performer = function(generator, callback) {
      if (!isGenerator(generator)) {
         throw TypeError('First parameter must be a generator');
      }

      callback = (callback instanceof Function) ? callback : function() {};

      var iterator = null;

      var spawn = function(x) {
         var wrap = function() {
            try {
               x();
            } catch(e) {
               callback(e);
            } finally {
               if (iterator.done) {
                  callback(null, iterator.value);
               }
            }
         };

         setImmediate(wrap);
      }

      var sync = function(err, data) {
         var args = arguments;
         if (args.length === 0) {
            // callback is invoked without any parameters
            spawn(function() {
               iterator.next();
            });
         } else if (err instanceof Error) {
            // node-style error
            spawn(function() {
               iterator.throw(err);
            });
         } else if (args.length === 2 && err === null) {
            // node-style normal flow
            spawn(function() {
               iterator.next(data);
            });
         } else if (args.length === 1) {
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
      };

      iterator = generator(sync);
      sync();
   }

   return performer;
}());

if (typeof exports === 'object' && typeof module === 'object') {
   module.exports = divert;
}
