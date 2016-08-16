#!/usr/bin/env bash
acorn try.js > try.json
"${PWD}/bin/pinecone" try.js -o try.lua
