'use strict';
var fast = require('fast.js');
module.exports = function (handle, convert) {
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