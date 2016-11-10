const assert = require('assert');
const fs = require('fs');
const divert = require('../');

describe('divert basic flow', () => {
   it('divert invokes callback with sync parameter', (done) => {
      divert(function* (sync) {
         assert.ok(sync);
         done();
      });
   });

   it('sync parameter must be used as a callback function in all async calls', (done) => {
      divert(function* (sync) {
         let text = (yield fs.readFile('test/resources/one.txt', 'utf8', sync)).toString();
         assert.equal('1', text);
         text = (yield fs.readFile('test/resources/two.txt', 'utf8', sync)).toString();
         assert.equal('2', text);
         done();
      });
   });

   it('yield construction throws an exception in case of errors', (done) => {
      divert(function* (sync) {
         try {
            yield fs.readFile('test/resources/unknown.txt', 'utf8', sync);
            assert.fail('yield construction must throw in case of errors');
         } catch(e) {
            assert.ok(e instanceof Error, 'yield construction throws');
            assert.equal('ENOENT', e.code, 'error contains valid code');
            done();
         }
      });
   });

   it('yield construction returns undefined in case if callback is called without parameters', (done) => {
      const doAsync = (x) => {
         setImmediate(() => {
            x();
         });
      }

      divert(function* (sync) {
         const none = yield doAsync(sync);
         assert.equal(undefined, none, 'yield construction returns undefined');
         done();
      });
   });

   it('yield construction returns a value in case of single parameter callback convention', (done) => {
      const doAsync = (x) => {
         setImmediate(() => {
            x('one');
         });
      }

      divert(function* (sync) {
         const text = yield doAsync(sync);
         assert.equal('one', text, 'yield returns single value of callback');
         done();
      });
   });

   it('yield construction returns array of arguments in case of multiple parameters callback convention', (done) => {
      const doAsync = (x) => {
         setImmediate(() => {
            x(null, 'one', 'two');
         });
      }

      divert(function* (sync) {
         const array = yield doAsync(sync);
         assert.deepEqual(['one', 'two'], array, 'yield returns array of arguments without nulls');
         done();
      });
   });

   it('yield construction returns array of arguments in case of unknown convention', (done) => {
      const doAsync = (x) => {
         setImmediate(() => {
            x('one', 'two');
         });
      }

      divert(function* (sync) {
         const array = yield doAsync(sync);
         assert.deepEqual(['one', 'two'], array, 'yield returns array of arguments');
         done();
      });
   });

   it('yield construction works in case if error parameter is undefined in node-style convension', (done) => {
      const doAsync = (x) => {
         setImmediate(() => {
            x(undefined, 'one');
         });
      }

      divert(function* (sync) {
         const one = yield doAsync(sync);
         assert.equal('one', one, 'yield returns single value');
         done();
      });
   });

   it('yield construction returns array of arguments in case if error parameter is undefined in node-style convension', (done) => {
      const doAsync = (x) => {
         setImmediate(() => {
            x(undefined, 'one', 'two');
         });
      }

      divert(function* (sync) {
         const array = yield doAsync(sync);
         assert.deepEqual(['one', 'two'], array, 'yield returns array of arguments');
         done();
      });
   });

   it('invocation of divert generator is asynchronous', (done) => {
      let async = true;
      let checked = false;
      divert(function* (sync) {
         async = false;
         assert.ok(checked, 'it is checked now that generator is asynchronous');
         done();
      });
      assert.ok(async, 'generator is not invoked yet');
      checked = true;
   });

   it('setImmediate can be used in divert function with sync argument to return control flow', (done) => {
      divert(function* (sync) {
         yield setImmediate(sync);
         done();
      });
   });

   it('additional divert parameters are passed to generator', (done) => {
      divert(function* (sync, one, two) {
         assert.equal('one', one, 'firts additional divert\'s parameter of type string is passed to generator');
         assert.equal(2, two, 'second additional divert\'s parameter of type string is passed to generator');
         done();
      }, null, 'one', 2);
   });
});
