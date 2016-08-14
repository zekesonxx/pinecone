/**
 * Pinecone AST Walker
 * Based on a modified version of acorn's `recursive` walker.
 * Acorn (C) 2012-2016 by various contributors; MIT licensed
 */
'use strict';

module.exports = function walker(node, state, funcs, fallback) {
  (function c(node, st) {
    if (st === undefined) {
      //to catch developer trip-ups
      throw new Error('No state passed down!');
    }
    if (Array.isArray(node)) {
      node.forEach(function(i) {
        c(i, st, c);
      });
    } else if (funcs[node.type] !== undefined) {
      funcs[node.type](node, st, c);
    } else {
      fallback(node, st, c);
    }
  })(node, state);
};
