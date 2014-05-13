/**
 * My attempt at creating a JavaScript -> Lua converter.
 * It's not perfect, and the code is weird looking, but it is correct.
 * Based on the acorn AST parser.
 * @author Zeke Sonxx
 * @license MIT
 */

var acorn = require('acorn');
var fs = require('fs');

var input = fs.readFileSync('./try.js', 'utf8');
var parsed = acorn.parse(input, {});
var output = [
  '--# Converted using js2lua',''
];

function variableConvert (inp) {
  var out = "";
  switch (typeof inp) {
    case "string":
      out = '"'+inp+'"';
      break;
    case "number":
      out = inp.toString();
      break;
  }
  return out;
}

function failedToConvert (action, reason) {
  return '-- Unable to convert code from ' + 
  action.start + ' to ' + action.end + 
  (reason ? " ("+reason+")" : " ");
}

parsed.body.forEach(function (action) {
  var o = '';
  switch (action.type) {
    case "VariableDeclaration": // var a = 1
      var decls = action.declarations;
      decls.forEach(function (decl, i) {
        //@TODO check for reserved words
        o += 'local ' + decl.id.name;
        if (decl.init !== null) {
          o += ' = ';
          o += variableConvert(decl.init.value);
        }
        if (i !== decls.length-1) { 
          //if not the last variable add a linebreak
          o += '\n';
        }
      });
      break;
    case "ExpressionStatement": //doing something
      var expr = action.expression;
      switch (expr.type) {
        case "AssignmentExpression": // a = 1
          //If you forget `var` your Lua won't have `local`, dumbass.
          o += expr.left.name;
          o += ' = ';
          o += variableConvert(expr.right.value);
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
          var totalargs = expr.arguments.length-1;
          expr.arguments.forEach(function (arg, i) {
            o += variableConvert(arg.value);
            if (totalargs > i) {
              //not the last argument
              o += ', ';
            }
          });
          o += ')';
          break;
        default:
          o = failedToConvert(action, 'Unknown expression');
          break;
      }
      break;
    default:
      //stop using the 99% of JS that we don't support, dammit.
      o = failedToConvert(action, 'Unknown action');
  }
  output.push(o);
});

fs.writeFileSync('./try.lua', output.join('\n'), 'utf8');