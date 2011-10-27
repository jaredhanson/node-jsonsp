# JSONSP

[JSON](http://www.json.org/) stream parser for [Node](http://nodejs.org).

## Installation

    $ npm install jsonsp

Install from source code repository:

    $ git clone git@github.com:jaredhanson/node-jsonsp.git
    $ npm install

jsonsp depends on [YAJL](http://lloyd.github.com/yajl/) and the
[YAJL binding for Node.js](https://github.com/vibornoff/node-yajl).  libyajl
must be installed on your system prior to installing jsonsp.

Install YAJL via [Homebrew](http://mxcl.github.com/homebrew/) on Mac OS X:

    $ brew install yajl
    
Note that the latest version of yajl (0.6.1) in the npm Registry fails to
install via npm, as reported in issue [#3](https://github.com/vibornoff/node-yajl/issues/3).
I have forked and patched yajl to address this issue, and the dependency
declared by jsonsp points to the tarball URL corresponding to the [v0.6.1-build-fix](https://github.com/jaredhanson/node-yajl/tree/v0.6.1-build-fix)
tag on my fork.  Once the main yajl repository accepts the patch, jsonsp will
switch to the npm Registry for its dependency.

## Usage

#### Initialize Parser

Create a new JSON stream parser.  The parser will incrementally parse data from
a stream, and emit an `'object'` event each time it parses a fully-formed JSON
object.

var parser = new jsonsp.Parser()
parser.on('object', function(obj) {
  // do something with obj
});

#### Parse Data from Stream

As chunks of data are read from a stream, they can be incrementally parsed by
the JSON stream parser.

var req = http.request(options, function(res) {
  // feed each chunk of data incrementally to the JSON stream parser
  res.on('data', function(chunk) {
    parser.parse(chunk.toString('utf8'));
  });
});

#### Examples

For a complete, working example, refer to the [Twitter Streaming API example](https://github.com/jaredhanson/node-jsonsp/tree/master/examples/twitter-stream).

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
