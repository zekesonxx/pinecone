'use strict';
var fast = require('fast.js');
module.exports = function (handle, convert) {
  handle('ReturnStatement', function (action, o, f) {
    return 'return ' + convert(action.argument, f.indent+2);
  });
  handle(['FunctionDeclaration', 'FunctionExpression'], function (action, o, f) {
    o += 'function';
    if (action.id) {
      o += ' ' + action.id.name;
    }
    if (!action.params) {
      o += '()';
    } else {
      o += '(';
        // There is no reason why a param param should ever not be a Identifier
        // There's no JS syntax for it.
      o += fast.map(action.params, function(i) {
        return i.name;
      }).join(', ');
      o += ')';
    }
    if (action.body.body.length === 0) {
      o += ' end'; //cleaner empty functions
    } else {
      o += f.newline;
      o += f.newindent(f.indent+2) + convert(action.body, f.indent+2) + f.newline;
      o += 'end';
    }
    return o;
  });
};