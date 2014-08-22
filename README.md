# pinecone: A JavaScript->Lua converter

So, I wrote a JS->Lua converter. Instead of being based on regex or some other dumb idea, it's based on [acorn][acorn], an awesome and superfast JavaScript Annotated Source Tree (AST) generator. Pinecone takes that and turns it into mostly-valid Lua.

It was written by running `$ acorn try.js > try.json` and looking at the JSON over and over, so don't expect very good standard conformity.

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

## What doesn't
* Comments
* For loops
* Everything else


## Usage
Don't.

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
Not to be rude, but good luck. The codebase is in sore shape.  
I tried to comment as much as possible, but it's not that great, and badly organized.
But if you do decide to contribute, make sure you code passes a jshint lint.
Outputted Lua code made from JS code that passes jshint (that pinecone fully supports) should pass luac.

## License
MIT licensed. Refer to `LICENSE`.


  [acorn]: https://github.com/marijnh/acorn