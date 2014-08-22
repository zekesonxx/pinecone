'use strict';

exports.failedConvert = function (action, reason) {
  return '--[[ Unable to convert code from ' + 
  action.start + ' to ' + action.end + 
  (reason ? ' ('+reason+') ]]' : ' ]]');
};

exports.luaizeOperator = function(operator) {
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
  if (changes.hasOwnProperty(operator)) {
    return changes[operator];
  } else {
    return operator;
  }
};