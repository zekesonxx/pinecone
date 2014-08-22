//jshint ignore:start
var fs = require('fs');
var acorn = require('acorn');

var convert = require('./compiler');

var input = fs.readFileSync('./try.js', 'utf8');
var parsed = acorn.parse(input, {});
var converted = convert(parsed.body);

fs.writeFileSync('./try.lua', converted.join('\n'), 'utf8');