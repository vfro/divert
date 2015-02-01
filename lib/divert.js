var divert = (function() {
   "use strict";

   var Generator = (function*(){yield undefined;}).constructor;
   var isGenerator = function(x) {
      return (x instanceof Generator);
   }
   var isSync = function(x) {
      return x == null || x.iterators instanceof Array;
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

   var parseArguments = function(args) {
      if (args.length < 1) {
         throw TypeError("First parameter must be a generators.");
      }

      var result = {
         generators: null,
         sync: null
      };

      if (args[0] instanceof Array) {
         result.generators = args[0];
         result.sync = args[1];

         if (!isSync(result.sync)) {
            throw TypeError("Sync callback must be passed as a last parameter.");
         }
      } else {
         if (isSync(args[args.length - 1])) {
            result.generators = Array.prototype.slice.call(args, 0, args.length - 1);
            result.sync = args[args.length - 1];
         } else {
            result.generators = Array.prototype.slice.call(args);
         }
      }

      for (var i = 0; i < result.generators.length; i++) {
         if ( !isGenerator(result.generators[i]) ) {
            throw TypeError("Divert accepts only generators.");
         }
      }

      return result;
   }

   var performer = function() {
      var iterators = null;
      var context = parseArguments(arguments);

      if (!context.sync) {
         iterators = [];

         context.sync = function(err, data) {
            var args = arguments;

            if (context.sync.iterators.length > 0) {
               var iterator = context.sync.iterators[context.sync.iterators.length - 1];
               var next = function(value) {
                  var result = iterator.next(value);
                  if (result.done) {
                     context.sync.iterators.pop();
                     context.sync();
                  }
               }

               if (err instanceof Error) {
                  // node-style error
                  spawn(function() {
                     iterator.throw(err);
                     context.sync.iterators.pop();
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
         context.sync.iterators = iterators;
      } else {
         iterators = context.sync.iterators;
      }

      var iterator = context.generators[0](context.sync);
      iterators.push(iterator);
      context.sync();
   }

   performer.errorHandler = function(newHandler) {
      errorHandler = newHandler;
   }

   return performer;
}());

if (typeof exports === "object" && typeof module === "object") {
   module.exports = divert;
}
