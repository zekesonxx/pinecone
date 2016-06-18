# JavaScript vs Lua, a ~~love~~ hate story

## The Wall
Pinecone sat unused and unloved for quite a while due to the relatively small but still irritating wall of differences between JS and Lua. Mainly:
* `..` used for concatenating strings
* How JS/Lua handle types
* `typeof k === 'object'` -> `type(k) == 'object'`. Lua doesn't have that.
* JS object literals and Lua tables
* `"4" == 4` is true in JS, but false in Lua.
* Should things like `console.log` be turned into `print`?
* Lua object calls (ex `io:open()`), JS has no comparable syntax

This required making a decision that I didn't really want to have to make, choosing one of the following:
* Only compile code in pinecone that's designed to compiled in pinecone
* Bundle a big-ass runtime
* Behave closer to how Rust's compiler operates instead of as a relatively thin translator: keep careful track of every variable's type and how that variable gets used everywhere

Option B would make the resulting code shit, and option C would be very hard and was outside my skill level.
And option A meant that there would never be any way of self-compiling or doing really cool stuff with pinecone.

So, this repo got abandoned for about a year and a half.

## Reminder
After using Lua to make a couple Payday 2 mods, I remember why I started this (I hate Lua).

## A solution
So, my solution was a combination of option A and option B.

### Short Term
Get pinecone completely practical. This includes things like being able to inject raw Lua (pinecone__rawlua).

My main vision here is to be able to rewrite [SSC](https://github.com/zekesonxx/ssc) completely in JavaScript, and add some pineconeing to the Makefile. So, that's a clear set of goals.

Pinecone *will* have a runtime, but it will be very light. And the runtime will, of course, be written in JavaScript and compiled to Lua with Pinecone.

### Long Term
Long-term I'd like to sort-of have 2 'modes' to pinecone:
* pinecone mode: compiles code designed for Pinecone, and would be light and fast, only a very light bundled runtime
* compatibility mode: compiles any JS code, but the resulting code would be heavier and have a larger bundled runtime

Compatibility mode would include things like shimming the type function and might even go as far as doing things like rewriting console.log to print; but that's a decent ways off.
