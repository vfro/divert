# Divert

Divert is a [generator-based](http://wiki.ecmascript.org/doku.php?id=harmony:generators) flattener of asynchronous code.

## motivation

Divert is minimalistic and stunningly simple. It doesn't support [promises](http://wiki.ecmascript.org/doku.php?id=strawman:promises) and [thunks](https://github.com/tj/node-thunkify)
which makes it a zero-dependency module. Nevertheless divert is enough for vast majority of cases. Divert-based code is compact, exceptions-enabled and intuitive.

**Note:** Generators are supported by stable Node release starting from v0.12.x with `--harmony-generators` or `--harmony` flag in V8:

```
$ node --harmony-generators script.js
```

Generators are also supported by [io.js](https://iojs.org/) running without additional flags and [Babel](https://babeljs.io).

## installation

```
$ npm install divert
```

## API

`require('divert')` returns a function with two parameters:
* `generator`: must be a generator-function `function*(sync) { ... }`
    * generator function is invoked asynchronously.
    * generator function accepts `sync` parameter, which must be passed as a callback to all yielded asynchronous calls.
    * `yield` construction evaluates to the value, which is passed to `sync` callback by asynchronous function.
    * `yield` construction may throw an exception in case if asynchronous function produces an error.
* `callback`: Optional Node-style callback which is called when `divert` is done.

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

* Node-style:
    * `yield` throw an exception if first parameter of `sync` is an instance of `Error`.
    * `yield` returns a value, in case if first parameter is `null` and second parameter is a value.
    * `yield` returns an array of values, if first parameter is `null` and more than one parameter is passed after that.
* Raw:
    * `yield` returns a value directly, in case if single parameter is not an instance of `Error`.
    * `yield` returns an array of values, in case if multiple parameters are passed and first parameter is not an `Error`.

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
    * suspend requires [promise](https://github.com/then/promise) as a dependency.
    * suspend doesn't treat single-parameter callback notation properly. In the example with phantomjs-node above, suspend resumeRaw callback will return single parameter as an array with one element.
* [Q](https://github.com/kriskowal/q): Q supports yield-based asynchronous control flow, with one significant flaw though.
    * Exceptions aren't thrown from yield construction, but `fail()` callback is called instead in case of failure. 
* [co](https://github.com/tj/co):
    * Unlike co, divert can yield functions which are not thunkified or promisified.

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
