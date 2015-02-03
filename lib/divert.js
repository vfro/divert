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

      callback = (callback instanceof Function) ? callback : function(err) {
         if (err) {
            console.error(err.stack);
         }
      };

      var iterator = null;

      var spawn = function(method, data) {
         var wrap = function() {
            var result = null;
            try {
               result = method.apply(iterator, [data]);
            } catch(err) {
               callback(err);
            } finally {
               if (result && result.done) {
                  callback(null, result.value);
               }
            }
         };

         setImmediate(wrap);
      }

      var sync = function(first, second) {
         var args = arguments;
         if (args.length === 0) {
            // callback is invoked without any parameters
            spawn(iterator.next);
         } else if (first instanceof Error) {
            // node-style error
            spawn(iterator.throw, first);
         } else if (args.length === 2 && first === null) {
            // node-style one argument flow
            spawn(iterator.next, second);
         } else if (args.length === 1) {
            // callback is invoked with a single value
            spawn(iterator.next, first);
         } else if (args[0] === null) {
            // node-style multiple arguments flow
            spawn(iterator.next, Array.prototype.slice.call(args, 1));
         } else {
            // callback is invoked in unknown convention
            spawn(iterator.next, Array.prototype.slice.call(args));
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
