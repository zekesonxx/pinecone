'use strict';
var pinecone = require('./lib');
var fs = require('fs');

var input = fs.readFileSync('./try.js', 'utf8');
var converted = pinecone.convert(input);

fs.writeFileSync('./try.lua', converted, 'utf8');
//console.log(converted);