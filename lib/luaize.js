'use strict';

exports.operator = function(op) {
  //this function exists because lua should not
  var changes = {
    //the okay one
    '===': '==',

    //the stupid ones
    '!=' : '~=',
    '!==' : '~=',
    '||' : 'or',
    '&&' : 'and'
  };
  if (changes.hasOwnProperty(op)) {
    return changes[op];
  } else {
    return op;
  }
};

exports.failed = function(node, reason) {
  if (reason) reason = ': '+reason;
  return `--[[Failed to convert ${node.start} to ${node.end}${reason}]]`;
};

exports.idents = function(op) {
  var changes = {
    'undefined': 'nil'
  };
  if (changes.hasOwnProperty(op)) {
    return changes[op];
  } else {
    return op;
  }
};
