'use strict';
var meta = require('../meta');
var needsParthsRegex = /(?:\=|\>|\<|\+|\-|\/|\*)/; //jshint ignore:line
module.exports = function (handle, convert) {
  handle('IfStatement', function (action, o, f) {
    o += 'if ';
    o += convert(action.test, 0);
    o += ' then'+f.newline;
    o += f.newindent(f.indent+2) + convert(action.consequent, f.indent+2);
    if (action.alternate === null) {
      if (action.__no_end !== true) {
        o += f.newline + 'end';
      }
    } else {
      action.alternate.__no_end = true;
      o += 'else';
      o += convert(action.alternate, f.indent+2).substr(f.indent+2)+f.newline;
      o += 'end';
    }
    return o;
  });
  handle('WhileStatement', function (action, o, f) {
    o += 'while ';
    o += convert(action.test, f.indent+2);
    o += ' do'+f.newline;
    o += f.newindent(f.indent+2) + convert(action.body, f.indent+2)+f.newline;
    o += 'end';
    return o;
  });

  handle('DoWhileStatement', function (action, o, f) {
    o += 'repeat'+f.newline;
    o += f.newindent(f.indent+2) + convert(action.body, f.indent+2)+f.newline;
    o += 'until ';
    o += convert(action.test, f.indent+2);
    return o;
  });



  /**
   * Math Stuff
   */
  
  handle('BinaryExpression', function (action, o, f) {
    var left = convert(action.left, 0);
    if (needsParthsRegex.test(left)) {
      left = '(' + left +')';
    }
    var op = meta.luaizeOperator(action.operator);
    var right = convert(action.right, 0);
    if (needsParthsRegex.test(right)) {
      right = '(' + right +')';
    }
    return left + ' ' + op + ' ' + right;
  });
};