# Divert

Divert is a [generator-based](http://wiki.ecmascript.org/doku.php?id=harmony:generators) flattener of asynchronous code.

## motivation

Divert is minimalistic and stunningly simple, it is a zero-dependency module. Nevertheless divert is enough for vast majority of cases. Divert-based code is compact, exceptions-enabled and intuitive.
Divert is also callback and Promise friendly.

**Note:** Generators are supported by Node.js starting from v0.12.x with `--harmony-generators` or `--harmony` flag in V8:

```
$ node --harmony-generators script.js
```

Starting from Node.js 4.0 generators are supported without additional flags.

Generators are also supported by [io.js](https://iojs.org/) running without additional flags and [Babel](https://babeljs.io).

## installation

```
$ npm install divert
```

## API

`require('divert')` returns a function with two parameters:
* `generator`: must be a generator-function `function*(sync) { ... }`
    * generator function is invoked asynchronously.
    * generator function accepts `sync` as a first parameter, which must be passed as a callback to all `yield`ed asynchronous calls.
    * `yield` construction evaluates to the value, which is passed to `sync` callback by asynchronous function.
    * `yield` construction may throw an exception in case if asynchronous function produces an error.
* `callback`: Optional Node-style callback which is called when `divert` is done.
* ... additional parameters: Optional additional parameters are passed as arguments to generation after `sync`.
* return: A `Promise` which either resolves to `return` value of the generator in normal flow or rejects with an `Error` if the `Error` is thrown by generator. 

```javascript
var divert = require('divert');
var fs = require('fs');

divert(function* (sync) {
   var hello = yield fs.readFile('./hello.txt', 'utf8', sync);
   var there = yield fs.readFile('./there.txt', 'utf8', sync);
   console.log("%s, %s!", hello, there);

   try {
      var unknown = yield fs.readFile('./unknown-file.txt', 'utf8', sync);
   } catch(e) {
      console.log('File is not found, as expected.');
   }
});
```

## callback notations

Divert supports the following notations, passed to `sync` callback:

* Node.js-style:
    * `yield` throw an exception if first parameter of `sync` is an instance of `Error`.
    * `yield` returns a value, in case if first parameter is `null` and second parameter is a value.
    * `yield` returns an array of values, if first parameter is `null` and more than one parameter is passed after that.
* Raw:
    * `yield` returns a value directly, in case if single parameter is not an instance of `Error`.
    * `yield` returns an array of values, in case if multiple parameters are passed and first parameter is not an `Error`.

## for-each loop

Divert block cannot be nested directly into for-each method of [lodash](https://lodash.com/), [Underscore.js](http://underscorejs.org/),
[async](https://github.com/caolan/async) or similar libraries. In order to `yield` asynchronous for-each loop, `sync` callback must be invoked only once
and only after each element is processed. Most of the libraries doesn't allow that.

In that case divert.each function can be used to invoke nested generator for element in a regular or array-like object. It accepts the following arguments:
* `collection`: regular or array-like object.
* `generator`: must be a generator-function with the following parameters:
   * `sync`: callback to `yield` internal asynchronous calls properly.
   * `value`: Optional parameter which contains an iterated value.
   * `index`: Optional parameter which contains an index of the iterated value.
   * `collection`: Optional parameter which contains the original collection.
* `callback`: Optional Node.js-style callback which is called when `divert.each` is done. Can be `sync` parameter in case if `divert.each` is `yield`ed from parent divert block.

## example

Consider the following [phantomjs-node](https://github.com/sgentle/phantomjs-node)-based code, based on callbacks:

```javascript
var phantom = require('phantom');

phantom.create(function(ph) {
   return ph.createPage(function(page) {
      return page.open('http://www.google.com', function(status) {
         console.log('Status is: ' + status);
         return page.evaluate((function() {
               return document.title;
            }), function(title) {
               console.log('Page title is: ' + title);
               return ph.exit();
            });
      });
  });
});
```

Compare it with the same code flattened by divert:

```javascript
var phantom = require('phantom');
var divert = require('divert');

divert(function* (sync) {
   var ph = yield phantom.create(sync);
   var page = yield ph.createPage(sync);
   var status = yield page.open('http://www.google.com', sync);
   console.log('Status is: ' + status);
   var title = yield page.evaluate(function() {
         return document.title;
      }, sync);
   console.log('Page title is: ' + title);
   return ph.exit(sync);
});
```

## divert compared to other modules

* [suspend](https://github.com/jmar777/suspend):  divert is very similar to suspend in many aspects, but still there are two differences.
    * suspend doesn't treat single-parameter callback notation properly. In the example with phantomjs-node above, suspend resumeRaw callback will return single parameter as an array with one element.
* [Q](https://github.com/kriskowal/q): Q supports yield-based asynchronous control flow, with one significant flaw though.
    * Exceptions aren't thrown from `yield` construction, but `fail()` callback is called instead in case of failure. 
* [co](https://github.com/tj/co):
    * Unlike co, divert can `yield` functions which are not thunkified or promisified.

## License

The MIT License (MIT)

Copyright (c) 2015 Volodymyr Frolov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
