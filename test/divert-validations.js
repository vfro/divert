const assert = require('assert');
const divert = require('../');

describe('divert parameters validation', () => {
   it('divert first parameter must generator', (done) => {
      assert.throws(() => {
            divert(() => { return 'I am not a generator'; });
         }, TypeError);

      assert.doesNotThrow(() => {
          divert(function *() { return 'I am a generator'; });
         }, 'generator parameter');
      done();
   });

   it('divert first parameter can be aysnc', (done) => {
      assert.throws(() => {
            divert(async () => { return 'I am async but not a generator'; });
         }, TypeError);

      assert.doesNotThrow(() => {
            divert(async function *() { return 'I am an async generator'; });
         }, 'async generator parameter');

      done();
   });
});
