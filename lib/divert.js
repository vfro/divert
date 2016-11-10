const divert = (function() {
   "use strict";

   const Generator = (function*(){yield undefined;}).constructor;
   const isGenerator = (x) => { return (x instanceof Generator); };

   const callbackWrapper = function(resolve, reject, callback) {
      return function(err, result) {
         // resolve or reject promise
         if (err) {
            reject(err);
         } else {
            resolve(result);
         }

         // ... before invoking original callback
         if (callback instanceof Function) {
            callback(err, result);
         }
      };
   };

   const performer = (generator, callback) => {
      if (!isGenerator(generator)) {
         throw TypeError('"generator" parameter must be a generator function');
      }

      // generator is called with all additional arguments
      const generatorArgs = Array.prototype.slice.call(arguments, 2);

      return new Promise(function(resolve, reject) {
         callback = callbackWrapper(resolve, reject, callback);

         let iterator = null;

         const spawn = (method, data) => {
            const wrap = () => {
               let result = null;
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

         const sync = (first, second) => {
            const args = arguments;
            if (args.length === 0) {
               // callback is invoked without any parameters
               spawn(iterator.next);
            } else if (first instanceof Error) {
               // node-style error
               spawn(iterator.throw, first);
            } else if (args.length === 2 && first == null) {
               // node-style one argument flow
               spawn(iterator.next, second);
            } else if (args.length === 1) {
               // callback is invoked with a single value
               spawn(iterator.next, first);
            } else if (args[0] == null) {
               // node-style multiple arguments flow
               spawn(iterator.next, Array.prototype.slice.call(args, 1));
            } else {
               // callback is invoked in unknown convention
               spawn(iterator.next, Array.prototype.slice.call(args));
            }
         };

         iterator = generator(sync, ...generatorArgs);
         sync();
      });
   }

   performer.each = function(collection, generator, callback) {
      return new Promise(function(resolve, reject) {
         callback = callbackWrapper(resolve, reject, callback);

         if (collection == null) {
            return callback();
         }

         const length = collection.length;
         if (length != null && typeof length === 'number') {
            // perform for-each loop over array-like object
            performer(function* (sync) {
               let index = -1;

               while (++index < length) {
                  if ((yield performer(generator, sync, collection[index], index, collection)) === false) {
                     return false;
                  }
               }

               return true;
            }, callback);
         } else {
            // perform for-each loop over normal object
            performer(function*(sync) {
               for(let index in collection) {
                  if ((yield performer(generator, sync, collection[index], index, collection)) === false) {
                     return false;
                  }               
               }

               return true;
            }, callback);
         }
      });
   };

   return performer;
}());

if (typeof exports === 'object' && typeof module === 'object') {
   module.exports = divert;
}
