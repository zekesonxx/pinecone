'use strict';
var fs = require('fs');
var path = require('path');
var debug = require('debug');
var fast = require('fast.js');
var meta = require('./meta');

var converters = {};
var convertersfiles = fs.readdirSync(path.join(__dirname, 'converters'));

var debugconvert = debug('pinecone:convert');
function convert(body, indent, noheader) {
  indent = (!isNaN(indent)) ? indent : 0; //think hard about it
  var indentation = new Array(indent+1).join(' ');
  var newline = '\n'+indentation;
  var o = '';
  if (body.type === 'Program' && noheader !== true) {
    o += '--# Converted using pinecone v'+require('../package.json').version;
    o += newline+newline;
  }
  switch (body.type) {
    case 'Program':
    case 'BlockStatement':
      debugconvert('Action "' +body.type + '" is block statement');
      body.body.forEach(function (action) {
        o += convert(action, indent)+newline;
      });
      break;
    case 'ExpressionStatement':
      if (body.expression.type === 'Literal' && 
          body.expression.value === 'use strict') {
        //Just void out "use strict"s for safety reasons
        o = '';
      } else {
        o = convert(body.expression, indent);
      }
      break;
    default:
      if (converters.hasOwnProperty(body.type)){ //has a handler 
        debugconvert('Parsing action "' +body.type + '"');
        o = converters[body.type](body, '', {
          indent: indent,
          indentation: indentation,
          newindent: function(i) {
            return new Array(i+1).join(' ');
          },
          newline: newline
        });
      } else { //doesn't
        debugconvert('Unknown action "' +body.type + '"');
        o = meta.failedConvert(body, 'Unknown action "'+body.type+'"');
      }
  }
  return o;
}
var debughandle = debug('pinecone:handle');

function handle(file) { //so there can be filenames in debug logs
  return function (name, handler) {
    if (Array.isArray(name)) {
      fast.forEach(name, function(i) {
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
  require('./converters/' + file)(handle(file), convert);
});

module.exports = {
  convert: convert,
  __converters: converters //for unit testing
};