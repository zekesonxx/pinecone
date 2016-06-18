# pinecone: A JavaScript->Lua converter

So, I wrote a JS->Lua converter. Instead of being based on regex or some other dumb idea, it's based on [acorn][acorn], an awesome and superfast JavaScript Annotated Source Tree (AST) generator. Pinecone takes that and turns it into mostly-valid Lua.

It was written by running `$ acorn try.js > try.json` and looking at the JSON over and over, so don't expect very good standard conformity.

## Some notes
Pinecone is designed for writing JavaScript that's written with the intention of being compiled in pinecone. It's not designed to handle any arbitrary JavaScript code, and as such will not be self-compiling anytime soon. :(

A relatively small runtime is required, you can choose where it goes using `pinecone__runtime()` to embed it in that location. (note this isn't actually implemented yet)

Please read `JSVSLUA.md` before trying to use pinecone so you at least have some idea of how it works. Eventually I'll write a user guide but right now I'm just concerned about getting pinecone functional.

## What works
* Variables `var a = 1`
* Multiple Variables `var a = 1, b = 2`
* Changing variables `a = 2`
* Functions `function a() { return 1 }`
* Functions declared as variables `var a = function () { return 1 }`
* If/ifelse/else
* `typeof thing` (turned into `type(thing)`)
* Graceful failing
* While loops
* Do While loops (converted to `repeat` loops)
* for..in.. loops

## What doesn't
* Comments
* Other types of for loops
* Everything else


## Usage
**CLI**
````text
$ npm install -g pinecone
$ pinecone file.js -o file.lua
````

**Programmically**
````js
var pinecone = require('pinecone'); // npm install pinecone
var input = "var k = 9;";

pinecone.convert(input);
//Alternatively, if you already have the AST:
pinecone.convertFromAST(require('acorn').parse(input, {}));

````


## Example
````js
var k = 'blue', b, f = 12;

var p = 4;

if (typeof k == 'string') {
  print('String!');
}

function bacon() {
  return 'bacon';
}

var f = function () {

};
````
turns into
````lua
--# Converted using pinecone v0.1.0

local k, b, f = "blue", nil, 12
local p = 4
if type(k) == "string" then
  print("String!")

end
function bacon()
  return "bacon"

end
local f = function() end
````

## Contributing
Contributions are welcome. Use two spaces for tabs, and try to keep your code looking like the rest of it.
Make sure your code passes a jshint lint. Outputted Lua code made from JS code that passes jshint (that pinecone fully supports) should pass luac.

## License
LGPL3 licensed. This means that any modifications to Pinecone must be released under the (L)GPL3, but that anything you compile with pinecone isn't bound by the (L)GPL3.

Refer to `LICENSE`.


  [acorn]: https://github.com/marijnh/acorn
