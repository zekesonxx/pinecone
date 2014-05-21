var h = {};
h.variableConvert = function (inp) {
  var out = "";
  switch (typeof inp) {
    case "string":
      out = '"'+inp+'"';
      break;
    case "number":
      out = inp.toString();
      break;
    case "boolean":
      out = (inp) ? 'true' : 'false';
      break;
  }
  return out;
};

h.failedConvert = function (action, reason) {
  return '--[[ Unable to convert code from ' + 
  action.start + ' to ' + action.end + 
  (reason ? " ("+reason+") ]]" : " ]]");
};

h.luaizeOperator = function (operator) { 
  //this function exists because lua should not
  var changes = {
    '!=' : '~=',
    '||' : 'or',
    '&&' : 'and'
  };
  if (changes.hasOwnProperty(operator)) {
    return changes[operator];
  } else {
    return operator;
  }
};

h.testConvert = function (test, nested) {
  var out = "";
  var needsNesting = false;
  //@TODO make this not shit
  switch (test.type) {
    case "BinaryExpression":
    case "LogicalExpression":
      out = h.testConvert(test.left, true) + ' ' + h.luaizeOperator(test.operator);
      out += ' ' + h.testConvert(test.right, true);
      needsNesting = true;
      break;
    case "Literal":
      out = h.variableConvert(test.value);
      break;
    case "Identifier":
      out = test.name;
      break;
    case "UnaryExpression":
      if (test.operator == 'typeof') {
        out = "type(" + h.testConvert(test.argument) + ")";
      } else if (test.operator == 'void') {
        out = "nil";
      } else {
        out = h.failedConvert(test, 'Unknown Unary Expression');
      }
      break;
  }
  if (nested && needsNesting) {
    return '(' + out + ')';
  } else {
    return out;
  }
};

module.exports = h;