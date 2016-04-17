var stateEnum = require('./state-enum');
var ValidationState = require('./validation-state');

var validatorBuildersRepository = {};

/**
 * Adds validator builder. Use to create custom validation rules.
 * @memberof! vivalid.validatorRepo
 * @function
 * @example vivalid.validatorRepo.addBuilder('required',fn);
 * @param {string} name validator name.
 * @param {function} fn a validation builder see *** for  more details.
 */
function addBuilder(name, fn) {
    if (typeof fn !== 'function') throw 'error while trying to register a Validator: argument must be a function';
    validatorBuildersRepository[name] = fn;
}

/**
 * Adds validator builder. Use to create custom validation rules.
 * @memberof! vivalid.validatorRepo
 * @function
 * @private
 * @param {validatorName} name validator name.
 * @param {object} validatorOptions.
 */
function build(validatorName, validatorOptions) {

    if (typeof validatorBuildersRepository[validatorName] !== 'function') {
        throw validatorName + ' does not exists. use addValidatorBuilder to add a new validation rule';
    }

    return validatorBuildersRepository[validatorName](ValidationState, stateEnum, validatorOptions);
}

/**
 * The interface to use when using data attributes to define Inputs And Groups.
 * @memberof! vivalid 
 * @namespace validatorRepo
 */
module.exports = {
    addBuilder: addBuilder,
    build: build
};