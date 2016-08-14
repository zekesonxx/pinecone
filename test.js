'use strict';
var compiler = require('./lib');
var acorn = require('acorn');
var fs = require('fs');

var input = fs.readFileSync('./try.js', 'utf8');
var converted = compiler.compile(acorn.parse(input, {}));

fs.writeFileSync('./try.lua', converted, 'utf8');
console.log(converted);
