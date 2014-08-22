'use strict';
var fast = require('fast.js');
var meta = require('../meta');
module.exports = function (handle, convert) {
  //@TODO check for reserved keywords
  handle('VariableDeclaration', function (action, o, f) {
    var keys = [], values = [];
    fast.forEach(action.declarations, function(decl) {
      keys.push(decl.id.name);
      if (decl.init === null) {
        values.push('nil');
      } else {
        values.push(convert(decl.init, 0));
      }
    });

    //And, output
    o += 'local ';
    o += keys.join(', ');
    o += ' = ';
    o += values.join(', ');
    return o;
  });

  //@TODO fix multiple assignments, ex `cake = bacon = 4`
  handle('AssignmentExpression', function (action, o, f) {
    var left = convert(action.left, f.indent+2);
    var right = convert(action.right, f.indent+2);
    switch (action.operator) {
      case '=':
        o = left + ' = ' + right;
        break;
      default:
        o = meta.failedConvert(action, 'Unknown operator `'+ action.operator + '`');
    }
    return o;
  });

  handle('UpdateExpression', function (action, o, f) {
    var arg = convert(action.argument, f.indent+2);
    switch (action.operator) {
      case '++':
        o = arg + ' = ' + arg + ' + 1';
        break;
      case '--':
        o = arg + ' = ' + arg + ' - 1';
        break;
      default:
        o = meta.failedConvert(action, 'Unknown operator `'+ action.operator + '`');
    }
    return o;
  });

  /**
   * The more literal things
   */


  handle('Literal', function (action, o, f) {
    var inp = action.value;
    switch (typeof inp) {
      case 'string':
        o = '"'+inp+'"';
        break;
      case 'number':
        o = inp.toString();
        break;
      case 'boolean':
        o = (inp) ? 'true' : 'false';
        break;
    }
    return o;
  });
  handle('Identifier', function (action, o, f) {
    return action.name;
  });
};