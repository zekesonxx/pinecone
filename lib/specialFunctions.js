'use strict';
var fast = require('fast.js');
var debug = require('debug')('pinecone:specialfunctions');
var convert = require('./convert');
var meta = require('./meta');
module.exports = {
  'pinecone__rawlua': function(action, o, f) {
    return action.arguments[0].value;
  }
};
