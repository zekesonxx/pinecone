'use strict';
var meta = require('../meta');
var fast = require('fast.js');
module.exports = function (handle, convert) {
  handle('CallExpression', function (action, o, f) {
    var callee = convert(action.callee, f.indent+2);
    var args = fast.map(action.arguments, function(i) {
      return convert(i, f.indent+2);
    }) || []; //just in case
    return callee + '(' + args.join(', ') + ')';
  });
  handle('MemberExpression', function (action, o, f) {
    return convert(action.object, f.indent+2) + '.' + 
                   convert(action.property, f.indent+2);
  });
  handle('UnaryExpression', function (action, o, f) {
    switch (action.operator) {
      /**
       * type() is a built-in Lua function that is essentially equivalent to typeof
       */
      case 'typeof':
        o = 'type(' + convert(action.argument, f.indent+2) + ')';
        break;
      /**
       * `void [exp]` is a outdated JavaScript operator.
       * It was originally used as a way of always getting `undefined`
       * as browsers like Internet Explorer would have undefined be overwritable
       * So you could `window.undefined = 42` and break everything.
       * Now it's basically worthless.
       * Lua has no concept of `undefined`, ex `local b` b = nil
       */
      case 'void':
        o = 'nil';
        break;
      default:
        o = meta.failedConvert(action, 'Unknown Unary Expression `'+action.operator+'`');
        break;
    }
    return o;
  });
};