'use strict';
var convert = require('./convert');
var acorn = require('acorn');

exports.convert = function (js) {
  var ast = acorn.parse(js, {});
  return exports.convertFromAST(ast);
};

exports.convertFromAST = function (ast) {
  return convert.convert(ast);
};