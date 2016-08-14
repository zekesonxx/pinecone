'use strict';
const fs = require('fs');
const path = require('path');
const debuglib = require('debug');
const debug = debuglib('pinecone:convert');
const walker = require('./walker');
const luaize = require('./luaize');

/**
* Load in the converters
* This gets to be run at loadtime because it's
* basically just requiring a bunch of stuff
*/
var converters = {};
var convertersfiles = fs.readdirSync(path.join(__dirname, 'converters'));
var debughandle = debuglib('pinecone:handle');
function handle(file) { //so there can be filenames in debug logs
 return function (name, handler) {
   if (Array.isArray(name)) {
     name.forEach(function(i) {
       converters[i] = handler;
       debughandle(file + ' registered handler for "' + i + '"');
     });
   } else {
     converters[name] = handler;
     debughandle(file + ' registered handler for "' + name + '"');
   }
 };
}
convertersfiles.forEach(function (file) {
 require('./converters/' + file)(handle(file));
});

exports.compile = function(inputAst) {
  walker(inputAst, {
    version: require('../package.json').version
  }, converters,
    function fallback(node, state) {
      node.code = luaize.failed(node, 'unknown node '+node.type);
  });
  //return JSON.stringify(inputAst, null, 2);
  return inputAst.code;
};
