var vows = require('vows');
var assert = require('assert');
var jsonsp = require('jsonsp');
var util = require('util');


vows.describe('Module').addBatch({
  
  'jsonsp': {
    topic: function() {
      return null;
    },
    
    'should report a version': function (x) {
      assert.isString(jsonsp.version);
    },
  },
  
}).export(module);
