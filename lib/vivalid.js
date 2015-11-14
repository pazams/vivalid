'use strict';

var Input = require('./input');
var InputGroup = require('./input-group');
var validatorRepo = require('./validator-repo');
var stateEnum = require('./state-enum');
var htmlInterface = require('./html-interface');
var constants = require('./constants');

/**
 * @namespace vivalid 
 */
module.exports = {
    VERSION: constants.VERSION,
    Input: Input,
    InputGroup: InputGroup,
    validatorRepo: validatorRepo,
    htmlInterface: htmlInterface,
    _ERROR: constants.ERROR
};
