'use strict';

module.exports = function(h) {
  h('VariableDeclaration', function(node, state, c) {
    // var k = 1, b = 2;
    if (node.declarations.length > 1) {
      var ids = [], inits = [];
      node.declarations.forEach(function(v) {
        c(v.id, state);
        ids.push(v.id.code);
        if (v.init !== null) {
          c(v.init, state);
          inits.push(v.init.code);
        } else {
          inits.push('nil');
        }
      });
      node.code = `local ${ids.join(', ')} = ${inits.join(', ')}`;
    } else {
      var v = node.declarations[0];
      c(v.id, state);
      var init = '';
      if (v.init !== null) {
        c(v.init, state);
        init = ' = '+v.init.code;
      }
      node.code = `local ${v.id.code}${init}`;
    }
  });
};
