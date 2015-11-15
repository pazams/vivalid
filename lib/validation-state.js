/**
 * {constructor} creates a new ValidationState object with a validation message and state.
 * @memberof! _internal
 * @class
 * @example new ValidationState('required',stateEnum.invalid)
 * @param {string} message the validation message.
 * @param {number} stateEnum the int value of the enum.
 */
function ValidationState(message, stateEnum){
    this.message = message;
    this.stateEnum = stateEnum;
}

module.exports = ValidationState;

/**
 * @namespace _internal
 */
