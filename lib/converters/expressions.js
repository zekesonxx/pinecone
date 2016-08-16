'use strict';
const luaize = require('../luaize');

module.exports = function(h) {
  h('ExpressionStatement', function(node, state, c) {
    if (node.expression.type == 'UpdateExpression') {
      node.expression.isStatement = true;
    }
    c(node.expression, state);
    node.code = node.expression.code;
  });

  h('CallExpression', function(node, state, c) {
    c([node.callee, node.arguments], state);
    var args = [];
    if (node.arguments.length > 0) {
      node.arguments.forEach(function(i) {
        args.push(i.code);
      });
    }
    node.code = `${node.callee.code}(${args.join(', ')})`;
  });

  h('AssignmentExpression', function(node, state, c) {
     c([node.left, node.right], state);
     node.code = `${node.left.code} ${luaize.operator(node.operator)} ${node.right.code}`;
  });

  h('ThisExpression', function(node, state, c) {
    node.code = 'self';
  });

  h('UnaryExpression', function (node, state, c) {
    if (node.operator !== 'void') {
      c(node.argument, state);
    }
    switch (node.operator) {
      case 'typeof':
        //TODO: Handle incompatability
        node.code = `type(${node.argument.code})`;
        break;
      case 'void':
        node.code = 'nil';
        break;
      case '!':
        node.code = 'not ' + node.argument.code;
        break;
      case '-':
        node.code = '-' + node.argument.code;
        break;
      case '+':
        node.code = '+' + node.argument.code;
        break;
      case '~':
        node.code = '~' + node.argument.code;
        break;
      case 'delete':
        node.code = luaize.failed(node, 'No Lua equivalent to `delete x`.');
        break;
      default:
        throw new Error(`Malformed AST, got UnaryExpression operator ${node.operator}`);
    }
  });

  h('UpdateExpression', function (node, state, c) {
    //TODO detect if the whole function is needed or a basic a = a+1 can be done.
    c(node.argument, state);
    var arg = node.argument.code;
    var op = node.operator.substr(0,1);
    if (node.isStatement) {
      node.code = `${arg} = ${arg} ${op} 1`;
    } else if (node.prefix) {
      node.code = `(function()${arg}=${arg}${op}1;return ${arg} end)(--[[${node.operator}${arg}]])`;
    } else {
      node.code = `(function()local a = ${arg};${arg}=${arg}${op}1;return a end)(--[[${arg}${node.operator}]])`;
    }
  });

  h('LogicalExpression', function(node, state, c) {
    state.parths_test_nesting = (state.parths_test_nesting || 0) + 1;
    c([node.left, node.right], state);
    state.parths_test_nesting--;
    var left = node.left.code, right = node.right.code;
    var op = luaize.operator(node.operator);
    if (state.parths_test_nesting > 0) {
      node.code = `(${left} ${op} ${right})`;
    } else {
      node.code = `${left} ${op} ${right}`;
    }
  });

  h('MemberExpression', function(node, state, c) {
    c([node.object, node.property], state);
    node.code = (node.computed) ? `${node.object.code}[${node.property.code}]`
                                : `${node.object.code}.${node.property.code}`;
  });

  h('ConditionalExpression', function(node, state, c) {
    state.parths_test_nesting = (state.parths_test_nesting || 0) + 1;
    c([node.test, node.consequent, node.alternate], state);
    state.parths_test_nesting--;
    //TODO add a compile option to use the below function
    // It doesn't have the caviats of `test and consequent or alternate`
    //node.code = `(function() if (${node.test.code}) then return (${node.consequent.code}) else return (${node.alternate.code}) end end)()`;
    node.code = `${node.test.code} and ${node.consequent.code} or ${node.alternate.code}`;
  });

  h('NewExpression', function(node, state, c) {
    //TODO actually implement making objects (htf does lua work?)
    node.code = luaize.failed(node, 'pinecone can\'t convert new obj(); statements');
  });

  h('BinaryExpression', function(node, state, c) {
    //TODO handle strings
    state.parths_test_nesting = (state.parths_test_nesting || 0) + 1;
    c([node.left, node.right], state);
    state.parths_test_nesting--;
    var left = node.left.code, right = node.right.code;
    var op = luaize.operator(node.operator);
    if (node.operator === '>>>') {
      node.code = `bit32.rshift(${left}, ${right})`;
    } else if (node.operator === '^') {
      node.code = `bit32.bxor(${left}, ${right})`;
    } else if (state.parths_test_nesting > 0) {
      node.code = `(${left} ${op} ${right})`;
    } else {
      node.code = `${left} ${op} ${right}`;
    }
  });

  h('EmptyExpression', function(node, state, c) {
    node.code = '';
  });
  h('ArrayExpression', function (node, state, c) {
    c(node.elements, state);
    var elements = [];
    node.elements.forEach((element) => elements.push(element.code));
    node.code = '{'+ elements.join(', ') + '}';
  });
  h('ObjectExpression', function (node, state, c) {
    if (node.properties.length === 0) {
      node.code = '{}';
    } else {
      var properties = [];
      node.properties.forEach(function(property) {
        c([property.key, property.value], state);
        var key = property.key.code;
        if (property.key.type == 'Literal') {
          key = '["'+ property.key.value + '"]';
        }
        properties.push(`${key} = ${property.value.code}`);
      });
      node.code = '{\n  '+properties.join(',\n  ')+'\n}';
    }
  });
};
