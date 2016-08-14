'use strict';
const luaize = require('../luaize');
module.exports = function(h) {
  h('Literal', function(node, state, c) {
    var inp = node.value;
    if (inp === null) {
      node.code = 'nil';
      return;
    }
    switch (typeof inp) {
      case 'string':
        node.code = '"'+inp.replace(/"/g, '\\"').replace(/\n/g, '\\n')+'"';
        break;
      case 'number':
        node.code = inp.toString();
        break;
      case 'boolean':
        node.code = (inp) ? 'true' : 'false';
        break;
      case 'object': //regex
        //TODO figure out regex
        node.code = luaize.failed(node, 'Can\'t convert regex into Lua yet.');
        break;
      default:
        throw new Error(`Malformed AST, got Literal type: ${typeof node}`);
      }
  });
  h('Identifier', function(node, state, c) {
    node.code = luaize.idents(node.name);
  });
  h(['Program', 'BlockStatement', 'SequenceExpression'], function(node, state, c) {
    node.code = '';
    (node.body || node.expressions).forEach(function(internal) {
      c(internal, state);
      node.code += '\n'+internal.code;
    });
    //remove the leading \n
    node.code = node.code.substr(1);
  });
};
