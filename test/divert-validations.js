const assert = require('assert');
const divert = require('../');

describe('divert parameters validation', () => {
   it('divert ensures that first parameter is a generator', (done) => {
      assert.throws(() => {
            divert(() => { return 'I am not a generator'; });
         }, TypeError);
      done();
   });
});
