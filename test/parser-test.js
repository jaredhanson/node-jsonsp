var vows = require('vows');
var assert = require('assert');
var util = require('util');
var Parser = require('jsonsp/parser');


vows.describe('Parser').addBatch({
  
  'parse primitive types': {
    topic: function() {
      var o;
      var parser = new Parser();
      parser.on('object', function(obj) {
        o = obj;
      });
      parser.parse('{ "string": "hello", "integer": 32, "float": 3.14, "true": true, "false": false, "null": null }');
      return o;
    },
    
    'should parse correctly': function (obj) {
      assert.isString(obj['string']);
      assert.equal(obj['string'], 'hello');
      assert.isNumber(obj['integer']);
      assert.equal(obj['integer'], 32);
      assert.isNumber(obj['float']);
      assert.equal(obj['float'], 3.14);
      assert.isBoolean(obj['true']);
      assert.isTrue(obj['true']);
      assert.isBoolean(obj['false']);
      assert.isFalse(obj['false']);
      assert.isNull(obj['null']);
    },
  },
  
  'parse object': {
    topic: function() {
      var o;
      var parser = new Parser();
      parser.on('object', function(obj) {
        o = obj;
      });
      parser.parse('{ "profile": { "name": "Jared Hanson", "location": "Oakland, CA" } }');
      return o;
    },
    
    'should parse correctly': function (obj) {
      assert.isObject(obj.profile);
      assert.equal(obj.profile.name, "Jared Hanson");
      assert.equal(obj.profile.location, "Oakland, CA");
    },
  },
  
  'parse array': {
    topic: function() {
      var o;
      var parser = new Parser();
      parser.on('object', function(obj) {
        o = obj;
      });
      parser.parse('{ "people": [ "John Doe", "Jane Doe" ] }');
      return o;
    },
    
    'should parse correctly': function (obj) {
      assert.isArray(obj.people);
      assert.lengthOf(obj.people, 2);
      assert.equal(obj.people[0], "John Doe");
      assert.equal(obj.people[1], "Jane Doe");
    },
  },
  
  'parse top-level array': {
    topic: function() {
      var o;
      var parser = new Parser();
      parser.on('object', function(obj) {
        o = obj;
      });
      parser.parse('[ "hello", "world" ]');
      return o;
    },
    
    'should parse correctly': function (obj) {
      assert.isArray(obj);
      assert.lengthOf(obj, 2);
      assert.equal(obj[0], 'hello');
      assert.equal(obj[1], 'world');
    },
  },
  
  'parse a sequence of incomplete chunks': {
    topic: function() {
      var objs = [];
      var parser = new Parser();
      parser.on('object', function(obj) {
        objs.push(obj);
      });
      parser.parse('{ "method": "ec');
      parser.parse('ho", "params": ["Hello ');
      parser.parse(' JSON-RPC"], "id": 1}');
      return objs;
    },
    
    'should parse correctly': function (objs) {
      assert.lengthOf(objs, 1);
      assert.equal(objs[0].id, '1');
      assert.equal(objs[0].method, 'echo');
    },
  },
  
  'parse a sequence of incomplete chunks containing multiple objects': {
    topic: function() {
      var objs = [];
      var parser = new Parser();
      parser.on('object', function(obj) {
        objs.push(obj);
      });
      parser.parse('{ "method": "ec');
      parser.parse('ho", "params": ["Hello ');
      parser.parse(' JSON-RPC"], "id": 1}');
      parser.parse('{"method": "postMessage", "params":');
      parser.parse(' ["Hello all!"], "id": 99}');
      return objs;
    },
    
    'should parse correctly': function (objs) {
      assert.lengthOf(objs, 2);
      assert.equal(objs[0].id, '1');
      assert.equal(objs[0].method, 'echo');
      assert.equal(objs[1].id, '99');
      assert.equal(objs[1].method, 'postMessage');
    },
  },
  
  'parser constructed with objectListener argument': {
    topic: function() {
      var self = this;
      var objs = [];
      var parser = new Parser(function(obj) {
        objs.push(obj);
      });
      parser.parse('{"method": "echo", "params": ["Hello JSON-RPC"], "id": 1}');
      return objs;
    },
    
    'should listen for object event' : function(objs) {
      assert.lengthOf(objs, 1);
    },
  },
  
  'parse multiple objects with option disabled': {
    topic: function() {
      var self = this;
      var objs = [];
      var parser = new Parser({ allowMultipleObjects: false });
      parser.on('object', function(obj) {
        objs.push(obj);
      });
      parser.on('error', function(err) {
        self.callback(null, err);
      });
      
      process.nextTick(function () {
        parser.parse('{"method": "echo", "params": ["Hello JSON-RPC"], "id": 1}');
        parser.parse('{"method": "postMessage", "params": ["Hello all!"], "id": 99}');
      });
    },
    
    'should emit error' : function(err, e) {
      assert.isNotNull(e);
    },
  },
  
}).export(module);
