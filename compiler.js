/**
 * My attempt at creating a JavaScript -> Lua converter.
 * It's not perfect, and the code is weird looking, but it is correct.
 * Based on the acorn AST parser.
 * @author Zeke Sonxx
 * @license MIT
 */

var nil = 'nil';
var h = require('./helper');

function ifStatement (action, newline, offset, nested) {
  var o = '';
  o += 'if ';
  o += h.testConvert(action.test);
  o += ' then'+newline;
  o += convert(action.consequent.body, 2+offset, true).join('\n')+newline; //call self
  if (action.alternate !== null) { //there's an else or an elseif
    if (action.alternate.type === 'IfStatement') { //elseif
      o += 'else' + ifStatement(action.alternate, newline, offset, true);
    } else if (action.alternate.type === 'BlockStatement') { //else
      o += 'else'+newline;
      o += convert(action.alternate.body, 2+offset, true).join('\n')+newline;
    }
  }
  if (!nested) o += 'end';
  return o;
}


function convert (code, offset, nested) {
  var indent, totalargs = 0;
  if (!offset) {
    offset = 0;
    indent = '';
  } else {
    indent = new Array(offset+1).join(' ');
  }
  var newline = '\n'+indent;
  var output = [];
  if (!nested){
    //The watermark at the top of the code
    output = [
      '--# Converted using pinecone',''
    ];
  }
  code.forEach(function (action) {
    var o = '';
    switch (action.type) {
      case "VariableDeclaration": // var a = 1
        var decls = action.declarations;
        totalargs = decls.length-1;
        o += 'local ';
        var values = [];
        decls.forEach(function (decl, i) {
          //@TODO check for reserved words
          o += decl.id.name;
          if (decl.init !== null) {
            if (decl.init.type == 'Literal') {
              values.push(h.variableConvert(decl.init.value));
            } else if (decl.init.type == 'FunctionExpression') {
              var fn = '';
              fn += 'function' + ((decl.init.id) ? ' ' + decl.init.id.name : '') + '(';
              var functionargs = decl.init.params.length-1;
              decl.init.params.forEach(function (arg, i) {
                fn += arg.name;
                if (functionargs > i) {
                  //not the last argument
                  fn += ', ';
                }
              });
              fn += ')'+newline;
              fn += convert(decl.init.body.body, 2+offset, true).join('\n')+newline;
              fn += 'end';
              values.push(fn);
            }
          } else {
            values.push('nil');
          }
          if (totalargs > i) {
            o += ', ';
          }
        });
        o += ' = ';
        values.forEach(function (value, i) {
          o += value;
          if (totalargs > i) {
            o += ', ';
          }
        });

        break;
      case "ExpressionStatement": //doing something
        var expr = action.expression;
        switch (expr.type) {
          case "AssignmentExpression": // a = 1
            o += expr.left.name;
            o += ' = ';
            o += h.variableConvert(expr.right.value);
            break;
          case "UpdateExpression": //a++
            var prefix = expr.prefix;
            var comment = true;
            switch (expr.operator) {
              case "++":
                o += expr.argument.name + ' = ' + expr.argument.name + ' + 1';
                break;
              case "--":
                o += expr.argument.name + ' = ' + expr.argument.name + ' - 1';
                break;
              default:
                o = h.failedConvert(action, 'Unknown UpdateExpression');
                comment = false;
            }
            if (comment) {
              o += ' --#'+expr.operator;
            }
            break;
          case "CallExpression": // a(1)
            var callee = expr.callee;
            if (callee.type === "Identifier") {
              o += callee.name;
            } else if (callee.type === "MemberExpression") {
              o += callee.object.name + '.';
              o += callee.property.name;
            }
            o += '(';
            totalargs = expr.arguments.length-1;
            expr.arguments.forEach(function (arg, i) {
              o += h.variableConvert(arg.value);
              if (totalargs > i) {
                //not the last argument
                o += ', ';
              }
            });
            o += ')';
            break;
          default:
            o = h.failedConvert(action, 'Unknown expression');
            break;
        }
        break;
      case "IfStatement": // if (a) { print(1); }
        o = ifStatement(action, newline, offset, false);
        break;
      case "FunctionDeclaration": // function a() { return 1 }
        o += 'function ' + action.id.name + '(';
        totalargs = action.params.length-1;
        action.params.forEach(function (arg, i) {
          o += arg.name;
          if (totalargs > i) {
            //not the last argument
            o += ', ';
          }
        });
        o += ')'+newline;
        o += convert(action.body.body, 2+offset, true).join('\n')+newline;
        o += 'end';
        break;
      case "ReturnStatement": //return 1;
        o += 'return ';
        o += h.testConvert(action.argument);
        break;
      case "WhileStatement": // while (1) {a();}
         o += 'while ';
         o += h.testConvert(action.test);
         o += ' do'+newline;
         o += convert(action.body.body, 2+offset, true).join('\n')+newline;
         o += 'end';
        break;
      case "DoWhileStatement": // do {a();} while (1)
        o += 'repeat'+newline;
        o += convert(action.body.body, 2+offset, true).join('\n')+newline;
        o += 'until ';
        o += h.testConvert(action.test)+newline;
        break;

      case "ForStatement":
        o += h.failedConvert(action, 'For loops aren\'t supported yet');
        break;
      default:
        //stop using the 99% of JS that we don't support, dammit.
        o = h.failedConvert(action, 'Unknown action');
    }
    output.push(indent+o);
  });
  return output;
}


module.exports = convert;