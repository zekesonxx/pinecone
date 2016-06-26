'use strict';
var meta = require('../meta');
var needsParthsRegex = /(?:\=|\>|\<|\+|\-|\/|\*)/; //jshint ignore:line
module.exports = function (handle, convert) {
  handle('IfStatement', function (action, o, f) {
    o += 'if ';
    o += convert(action.test, 0);
    o += ' then\n';
    o += f.newindent(f.indent+2) + convert(action.consequent, f.indent+2);
    if (action.alternate === null) {
      if (action.__no_end !== true) {
        o += f.newline + 'end';
      }
    } else {
      action.alternate.__no_end = true;
      o = o.substr(0, o.length-2); //make the else behave correctly
      o += 'else\n';
      o += f.newindent(f.indent+2)+convert(action.alternate, f.indent+2)+ f.newline;
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

  handle('ThrowStatement', function (action, o, f) {
    o += 'error(';
    if (action.argument.type === 'Literal') {
      //throwing a raw string, which is bad in js.
      o += '"'+action.argument.value+'"';
    } else if (action.argument.type === 'NewExpression') {
      //throwing an error object. We're making that assumption because sanity.
      o += '"JS ' + action.argument.callee.name + ': ' + action.argument.arguments[0].value + '"';
    } else {
      //the fuck are you throwing
      o += convert(action.argument, 0);
    }
    o += ')';
    return o;
  });

  handle('ForStatement', function (action, o, f) {
    if (action.init) {
      o += convert(action.init, f.indent+2)+f.newline;
    }
    /**
     * The comment isn't a warning
     * It's an apology
     */
    if (action.test) {
      o += 'while '+convert(action.test, f.indent+2)+' do --[[pinecone converted for statement]]\n'+f.newindent(f.indent+2);
    } else {
      o += 'while true do --[[pinecone converted for statement]]'+f.newline;
    }
    if (action.update) {
      o += convert(action.update, f.indent+2) + '\n'+f.newindent(f.indent+2);
    }
    o += convert(action.body, f.indent+2)+f.newline;
    o += 'end';
    return o;
  });

  //for _ in pairs(T) do count = count + 1 end
  /**/
  handle('ForInStatement', function (action, o, f) {
    var left = convert(action.left, f.indent+2);
    var right = convert(action.right, f.indent+2);
    o += 'for '+left+' in '+right+' do\n';
    o += f.newindent(f.indent+2) + convert(action.body, f.indent+2);
    o += 'end';
    return o;
  });
  /**/

  handle('ConditionalExpression', function (action, o, f) {
    var test = convert(action.test, f.indent+2);
    var consequent = convert(action.consequent, f.indent+2);
    var alternate = convert(action.alternate, f.indent+2);
    o += '(function (a) if (';
    o += test;
    o += ') then return (';
    o += consequent;
    o += ') else return (';
    o += alternate;
    o += ') end end)()';
    return o;
  });



  /**
   * Math Stuff
   */

  handle(['BinaryExpression', 'LogicalExpression'], function (action, o, f) {
    var left = convert(action.left, 0);
    if (needsParthsRegex.test(left)) {
      left = '(' + left +')';
    }
    var op = meta.luaizeOperator(action.operator);
    var right = convert(action.right, 0);
    if (needsParthsRegex.test(right)) {
      right = '(' + right +')';
    }
    if (op == '+') {
      return 'PineconeRuntime.concat(' + left + ', ' + right + ')';
    } else {
      return left + ' ' + op + ' ' + right;
    }
  });
};
