## JS vs Lua: A solution story
This document is full of stuff that isn't immediately obvious about how pinecone behaves, both for my own documentation and for anyone who tries to use it (may your respective diety help you).

##### A reminder
Pinecone is not designed to 1:1 match how your code appears or functions. It's designed to 1:1 match the intended results of running your code.

If you're annoyed about the PineconeRuntime turning your 4 line JS file into a 40+ line Lua file, why the hell are you running a 4 line JS file through pinecone? Surely you can just write the Lua manually.

### Adding strings
**Problem**: JS concats strings `stringa+stringb`. Lua concats strings `stringa..stringb`. Doing `string+string` in Lua results in a runtime error.

**Solution**: The `+` operator is compiled into `PineconeRuntime.concat`, which checks if either variable is a string and concats them if so, otherwise it just adds them.

### Lua and JavaScript name things differently
Namely, `nil` vs `undefined` and `table` vs `object`

**Problem**: `typeof {}` in JavaScript returns `object`. `type({})` in Lua returns `table`

**Solution**: Instead of compiling `typeof k` to `type(k)`, compile it to `PineconeRuntime.typeof(k)`, which rewrites nil to undefined and table to object. Pinecone doesn't stop you from calling `type()` if you need the added speed or Lua compatibility for something.

### console.log doesn't work
**Problem**: `console.log()` doesn't exist in Lua (as you would expect)

**Solution**: Use Lua's `print()` instead

**Eventual Long-Term Solution**: Allow loading in an extended runtime to handle things like that

### Code compatible in both languages
**Problem**: I want to write code that works in JS and Lua, but how do I detect which language I'm in?

**Solution**: While you could certainly do it the ghetto way (`"4" == 4` is true in JS and false in Lua) a more formal way of checking is just to check for the existence of the PineconeRuntime global (`if (_G.PineconeRuntime) {...}`).  
This has the added benefit of adding more indication if you forget to `pinecone__runtime()` :D.


### object:func()
**Problem**: Lua has objects that you can call functions of, ex `LocalizationManager:text`

**Solution**: Compile `thinga.$thingb` into `thinga:thingb`. Additionally, for function definitions, compile `function thinga$$thingb` into `thinga:thingb` (only works on functions, nothing else).
