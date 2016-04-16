var ValidationState = require('./validation-state');
var stateEnum = require('./state-enum');

function InputState() {

    this.isNoneChecked = false;
    this.validationState = new ValidationState('', stateEnum.valid);
    this.validationCycle = 0;
    this.isChanged = false;
    this.activeEventType = '';
}

module.exports = InputState;