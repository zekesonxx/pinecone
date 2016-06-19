'use strict';
var fast = require('fast.js');
var debug = require('debug')('pinecone:specialfunctions');
var acorn = require('acorn');
var meta = require('./meta');
module.exports = {
  /**
   * pinecone-_rawlua("string")
   * Outputs the string into the final code as raw Lua
   */
  'pinecone__rawlua': function(action, o, f) {
    o = action.arguments[0].value;
    return o;
  },
  'pinecone__runtime': function(action, o, f, convert) {
    var filepath = require('path').join(__dirname, '..', 'runtime', 'main.js');
    var file = require('fs').readFileSync(filepath, 'utf8');
    return convert(acorn.parse(file), 0, true);
  },
  'pinecone__version': function(action, o, f) {
    return '"' + require('../package.json').version + '"';
  },
  'pinecone__comment': function(action, o, f) {
    return '--[[' + action.arguments[0].value + ']]';
  }
};
