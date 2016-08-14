# pinecone: A JavaScript->Lua converter

pinecone converts JavaScript to Lua using the [ESTree standard][estree], converted by default using [acorn][acorn]. Pinecone takes that and turns it into mostly-valid Lua.

This is the second version of pinecone, the first version was written back in mid-2014, rewritten in late-2014, and added on to in early 2016. It wasn't very well designed, but you can still see it preserved in the git branch `orig-pinecone`.

##### *missing the rest of the readme; I'm still converting pinecone to the new system*

## License
LGPL3 licensed. This means that any modifications to Pinecone must be released under the (L)GPL3, but that anything you compile with pinecone isn't bound by the (L)GPL3.

Refer to `LICENSE`.


  [acorn]: https://github.com/marijnh/acorn
  [estree]: https://github.com/estree/estree/
