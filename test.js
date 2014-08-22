var pinecone = require('./lib');
var acorn = require('acorn');
var fs = require('fs');

var input = fs.readFileSync('./try.js', 'utf8');
var parsed = acorn.parse(input, {});
var converted = pinecone(parsed);

fs.writeFileSync('./try.lua', converted, 'utf8');
//console.log(converted);