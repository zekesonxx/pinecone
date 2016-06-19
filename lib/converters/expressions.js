'use strict';
var meta = require('../meta');
var fast = require('fast.js');
var specialFunctions = require('../specialFunctions');
module.exports = function (handle, convert) {
  handle('CallExpression', function (action, o, f) {
    var callee = convert(action.callee, f.indent+2);
    //Hijack function calls for our own usage.
    if (specialFunctions[callee]) {
      return specialFunctions[callee](action, o, f, convert);
    } else {
      var args = fast.map(action.arguments, function(i) {
        return convert(i, f.indent+2);
      }) || []; //just in case
      return callee + '(' + args.join(', ') + ')';
    }
  });
  handle('MemberExpression', function (action, o, f) {
    var object = convert(action.object, f.indent+2);
    var property = convert(action.property, f.indent+2);
    if (action.computed) { // thing[thing]
      return object + '[' + property + ']';
    } else { // thing.thing
      return object + '.' + property;
    }
  });
  handle('UnaryExpression', function (action, o, f) {
    switch (action.operator) {
      /**
       * typeof is passed through the runtime in order to maintain easy compatability
       * You can still call Lua's type() directly if you'd like.
       */
      case 'typeof':
        o = 'PineconeRuntime.typeof(' + convert(action.argument, f.indent+2) + ')';
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
      case '!':
        o = 'not '+convert(action.argument, f.indent+2);
        break;
      default:
        o = meta.failedConvert(action, 'Unknown Unary Expression `'+action.operator+'`');
        break;
    }
    return o;
  });
  handle('ThisExpression', function (action, o, f) {
    return 'self';
  });
};
