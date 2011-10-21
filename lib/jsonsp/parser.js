/**
 * Module dependencies.
 */
var events = require('events')
  , yajl = require('yajl')
  , util = require('util');


/**
 * Initialize a new `Parser`.
 *
 * Creates a new JSON stream parser, with given `options`.  The optional
 * `objectListener` argument is automatically set as a listener for the 'object'
 * event.
 *
 * Options:
 *   - `allowMultipleObjects`  allow multiple objects to be parsed from the stream, defaults to _true_
 *
 * Events:
 *
 *   Event: 'object'
 *
 *     `function(obj) { }`
 *
 *   Emitted when a complete JSON object is parsed from the stream.
 *
 *   Event: 'error'
 *
 *     `function(err) { }`
 *
 *   Emitted if there was an error parsing data.
 *
 * Examples:
 *
 *     var parser = new Parser();
 *
 *     var parser = new Parser(function(obj) {
 *       console.log('Parsed object: ' + util.inspect(obj));
 *     });
 *
 * @param {Object} options
 * @param {Function} objectListener
 * @api public
 */
function Parser(options, objectListener) {
  if (!objectListener && typeof options === 'function') {
    objectListener = options;
    options = null;
  }
  options = options || {};
  options.allowMultipleValues = (options.allowMultipleObjects === undefined) ? true : options.allowMultipleObjects;
  
  events.EventEmitter.call(this);
  
  this._handle = new yajl.Handle(options);
  this._context = [];
  this._currentKey = null;
  
  if (objectListener) { this.addListener('object', objectListener); }
  
  var self = this;
  
  this._handle.addListener('startMap', function() {
    self._context.push({ key: self._currentKey, value: new Object() });
  });
  
  this._handle.addListener('endMap', function() {
    var ctx = self._context.pop();
    var len = self._context.length;
    if (0 == len) {
      self.emit('object', ctx.value);
    } else {
      addToContainer(self._context[len - 1].value, ctx.key, ctx.value);
    }
  });
  
  this._handle.addListener('startArray', function() {
    self._context.push({ key: self._currentKey, value: new Array() });
  });
  
  this._handle.addListener('endArray', function() {
    var ctx = self._context.pop();
    var len = self._context.length;
    if (0 == len) {
      self.emit('object', ctx.value);
    } else {
      addToContainer(self._context[len - 1].value, ctx.key, ctx.value);
    }
  });
  
  this._handle.addListener('mapKey', function(key) {
    self._currentKey = key;
  });
  
  this._handle.addListener('null', function() {
    var len = self._context.length;
    addToContainer(self._context[len - 1].value, self._currentKey, null);
  });
  
  this._handle.addListener('boolean', function(flag) {
    var len = self._context.length;
    addToContainer(self._context[len - 1].value, self._currentKey, flag);
  });
  
  this._handle.addListener('number', function(n) {
    if ('string' == typeof n) {
      if (-1 == n.indexOf('.')) {
        n = parseInt(n);
      } else {
        n = parseFloat(n);
      }
    }
    var len = self._context.length;
    addToContainer(self._context[len - 1].value, self._currentKey, n);
  });
  
  this._handle.addListener('integer', function(i) {
    var len = self._context.length;
    addToContainer(self._context[len - 1].value, self._currentKey, i);
  });
  
  this._handle.addListener('double', function(f) {
    var len = self._context.length;
    addToContainer(self._context[len - 1].value, self._currentKey, f);
  });
  
  this._handle.addListener('string', function(s) {
    var len = self._context.length;
    addToContainer(self._context[len - 1].value, self._currentKey, s);
  });
  
  this._handle.addListener('error', function(err) {
    self.emit('error', err);
  });
}

/**
 * Inherit from `events.EventEmitter`.
 */
util.inherits(Parser, events.EventEmitter);


/**
 * Parse `data`.
 *
 * `Parser` remembers all state necessary to restart parsing.  This allows
 * incremental parsing as data is streamed from a disk or network.
 *
 * @param {String} data
 * @api public
 */
Parser.prototype.parse = function(data) {
  this._handle.parse(data);
}

/**
 * Add `val` to `container`.
 *
 * If `container` is an array, `val` will be appended.  Otherwise, if
 * `container` is an object, `val` will be set as the value of `key`.
 *
 * @param {Object|Array} container
 * @param {String} key
 * @param {Mixed} val
 * @api private
 */
function addToContainer(container, key, val) {
  if (container instanceof Array) {
    container.push(val);
  } else if (container instanceof Object) {
    container[key] = val;
  }
}


/**
 * Export `Parser`.
 */
module.exports = Parser;
