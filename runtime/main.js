'use strict';
/* globals _G, PineconeRuntime, pinecone__comment, pinecone__version, pinecone__rawlua*/
/**
 * Pinecone Runtime
 * Some notes:
 * * The runtime cannot depend on itself.
 *   This means more usage of pinecone__rawlua then you would think to avoid compiler runtiming
 * * Speed (in lua) should be prioritized over speed (in js) or code cleanliness
 * * Inlining tricks into the compiler isn't abhorrent, and helps keep the runtime lightweight
 */

if (!_G.PineconeRuntime) {
  pinecone__comment('Pinecone Runtime, LGPL3 licensed');
  _G.PineconeRuntime = {};
  PineconeRuntime.version = pinecone__version();

  PineconeRuntime.concat = function (a, b) {
    if (type(a) !== 'string' && type(b) !== 'string' ) {
      return pinecone__rawlua('a+b');
    } else {
      return pinecone__rawlua('a..b');
    }
  };

  PineconeRuntime.typeReplacements = {
    'nil': 'undefined',
    'table': 'object'
  };
  PineconeRuntime.typeof = function(variable) {
    /* globals type */
    var luaType = type(variable);
    return PineconeRuntime.typeReplacements[luaType] || luaType;
  };
}
