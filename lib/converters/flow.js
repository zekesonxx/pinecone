'use strict';
const luaize = require('../luaize');

module.exports = function(h) {
  h('IfStatement', function(node, state, c) {
    c([node.test, node.consequent], state);
    var start = (node.IfStatement_nested) ? 'elseif' : 'if';
    var end = (node.IfStatement_nested) ? '' : '\nend';
    var test = node.test.code;
    var consequent = node.consequent.code.replace(/\n/g, '\n  ');
    if (node.alternate && node.alternate.type == 'IfStatement') {
      node.alternate.IfStatement_nested = true;
      c(node.alternate, state);
      node.code = `${start} ${test} then\n  ${consequent}\n${node.alternate.code}${end}`;
    } else if (node.alternate) {
      c(node.alternate, state);
      node.code = `${start} ${test} then\n  ${consequent}\nelse\n  ${node.alternate.code}${end}`;
    } else {
      node.code = `${start} ${test} then\n  ${consequent}${end}`;
    }
  });
  h('WhileStatement', function(node, state, c) {
    c([node.test, node.body], state);
    var body = node.body.code.replace(/\n/g, '\n  ');
    node.code = `while ${node.test.code} do\n  ${body}\nend`;
  });
  h('DoWhileStatement', function(node, state, c) {
    //TODO detect negation and auto-optimize the double negation out of it.
    c([node.test, node.body], state);
    var body = node.body.code.replace(/\n/g, '\n  ');
    node.code = `repeat\n  ${body}\nuntil not (${node.test.code})`;
  });
  h('ForStatement', function(node, state, c) {
    node.code = '';
    if (node.init) {
      c(node.init, state);
      node.code += node.init.code+'\n';
    }
    var test;
    if (node.test) {
      c(node.test, state);
      test = node.test.code;
    } else {
      test = 'true';
    }
    node.code += `while ${test} do --[[pinecone converted for statement]]\n  `;
    c(node.body, state);
    node.code += node.body.code.replace(/\n/g, '\n  ');
    if (node.update) {
      if (node.update.type == 'UpdateExpression') {
        node.update.isStatement = true;
      }
      c(node.update, state);
      node.code += '\n  '+node.update.code;
    }
    node.code += '\nend';
  });
  h(['FunctionDeclaration', 'FunctionExpression'], function(node, state, c) {
    c(node.body, state);
    var id = '', args = [], body;
    if (node.body.code && node.body.code.length > 0) {
       body = '\n  ' + node.body.code.replace(/\n/g, '\n  ')+'\n';
    } else {
      body = ' ';
    }
    if (node.id) {
      c(node.id, state);
      id = node.id.code;
    }
    if (node.params) {
      c(node.params, state);
      node.params.forEach((i) => args.push(i.code));
    }
    if (node.type == 'FunctionDeclaration') {
      node.code = `function ${id}(${args.join(', ')})${body}end`;
    } else /* if (node.type == FunctionExpression) */ {
      id = id ? '--[[' + id + ']]' : '';
      node.code = `(function ${id}(${args.join(', ')})${body}end)`;
    }
  });
  h('ReturnStatement', function(node, state, c) {
    if (node.argument) {
      c(node.argument, state);
      node.code = 'return '+node.argument.code;
    } else {
      node.code = 'return';
    }
  });
  h('ThrowStatement', function(node, state, c) {
    if (node.argument.type == 'NewExpression') { // throw new Error("something!");
      c([node.argument.callee, node.argument.arguments], state);
      var args = [];
      node.argument.arguments.forEach((i) => args.push(i.code));
      node.code = `error("JS ${node.argument.callee.code}: "..${args.join('')})`;
    } else {
      c(node.argument, state);
      node.code = `error("BAD JS"..${node.argument.code})`;
    }
  });
};
