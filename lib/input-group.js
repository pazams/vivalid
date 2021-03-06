var Input = require('./input');
var stateEnum = require('./state-enum');
var DEBUG = require('./constants').DEBUG;
var ERROR = require('./constants').ERROR;

/**
 * creates a new InputGroup
 * @memberof! vivalid 
 * @class
 * @param {vivalid.Input[]} inputsArray <b> the group's state is evalutated by: <br/> </b> <b>invalid:</b> if at least 1 inputs in inputsArray is invalid <br/> <b>pending:</b> if all inputs in inputsArray are valid/pending and at least 1 is pending <br/> <b>valid:</b> if all inputs in inputsArray are valid
 * @param {HTMLElement[]} submitElems an array of elements that should trigger the group's validation. The elements click event will either immediately trigger onValidationSuccess / onValidationFailure, or go through pendingUiStart and pendingUiStop if the group is in 'pending' mode.
 * @param {function} onValidationSuccess signature of {@link _internal.onValidationSuccess onValidationSuccess}. A function called when a submitElem is clicked and group state is valid or as a callback after it reaches a valid state from a pending state. Use this function to proceed with the application flow.
 * @param {function} onValidationFailure signature of {@link _internal.onValidationFailure onValidationFailure}. A function called when a submitElem is clicked and group state is invalid or as a callback after it reaches an invalid state from a pending state. Use this function to show message about the form state for the user.
 * @param {function} [pendingUiStart] signature of {@link _internal.pendingUiStart pendingUiStart}. highly recommneded when using asyc client-server validations. A function called when a submitElem is clicked and group state is pending. Use this function to show a loader or disable inputs while the group waits for the pending validations to complete.
 * @param {function} [pendingUiStop] signature of {@link _internal.pendingUiStop pendingUiStop}. highly recommneded when using asyc client-server validations. A function called when leaving a group pending state after a submitElem is clicked. Use this function to undo the UX effects taken inside pendingUiStart.
 * @param {function} [groupStatesChanged]
 * @param {function} [groupPendingChanged]
 * @param {function} [onBeforeValidation] Signature of {@link _internal.onBeforeValidation onBeforeValidation}. A function to be called before triggering any of the input's validators
 * @param {function} [onAfterValidation] Signature of {@link _internal.onAfterValidation onAfterValidation}. A function to be called after triggering all of the input's validators
 * @param {HTMLElement[]} [resetElems] an array of elements that should trigger the group's validation _reset.

 */
function InputGroup(inputsArray, submitElems, onValidationSuccess, onValidationFailure, pendingUiStart, pendingUiStop, groupStatesChanged, groupPendingChanged, onBeforeValidation, onAfterValidation, resetElems) {

    if (!onValidationSuccess || !onValidationFailure) throw ERROR.mandatorySuccessFailure;

    this._inputs = [];
    this._inputElems = [];
    this._submitElems = [];
    this._resetElems = [];

    this._onValidationSuccess = onValidationSuccess;
    this._onValidationFailure = onValidationFailure;
    this._pendingUiStart = pendingUiStart;
    this._pendingUiStop = pendingUiStop;
    this._groupStatesChanged = groupStatesChanged;
    this._onBeforeValidation = onBeforeValidation;
    this._onAfterValidation = onAfterValidation;

    this._groupPendingChangedListeners = [];
    this._groupPendingChangedListeners.push(
        function(_isPending) {
            if (!_isPending) {
                if (this._isPendingUiStartRun) {

                    this._pendingUiStop.call(this._pendingUiLastSubmitElem, this._inputElems, this._submitElems, this._resetElems);

                    this._getOnSubmit.call(this).call(this._pendingUiLastSubmitElem);

                    this._isPendingUiStartRun = false;
                    this._pendingUiLastSubmitElem = {};
                }
            }
        }.bind(this)
    );

    if (groupPendingChanged)
        this._groupPendingChangedListeners.push(groupPendingChanged);

    this._stateCounters = {};
    this._stateCounters[stateEnum.invalid] = 0;
    this._stateCounters[stateEnum.pending] = 0;
    this._stateCounters[stateEnum.valid] = 0;

    this._isPendingChangeTrueRun = false;

    this._isPendingUiStartRun = false;

    this._pendingUiLastSubmitElem = {};

    this._inputs = inputsArray.map(function(input) {
        input.setGroup(this);
        return input;
    }, this);

    this._inputElems = inputsArray
        .map(function(input) {
            return input.getDomElement();
        });

    this._stateCounters[stateEnum.valid] = inputsArray.length;

    this._submitElems = Array.prototype.slice.call(submitElems);

    this._submitElems.forEach(function(submit) {
        submit.addEventListener('click', this._getOnSubmit.call(this));
    }, this);

    if (resetElems) {
        this._resetElems = Array.prototype.slice.call(resetElems);
        this._resetElems.forEach(function(submit) {
            submit.addEventListener('click', this.reset.bind(this));
        }, this);
    }

}

InputGroup.prototype = (function() {

    return {
        updateGroupListeners: updateGroupListeners,
        updateGroupStates: updateGroupStates,
        reset: reset,
        getOnBeforeValidation: getOnBeforeValidation, 
        getOnAfterValidation: getOnAfterValidation,
        _isValid: _isValid,
        _isPending: _isPending,
        _getOnSubmit: _getOnSubmit,
        _triggerInputsValidation: _triggerInputsValidation
    };

    function _isValid() {
        this._triggerInputsValidation();

        return (this._stateCounters[stateEnum.invalid] === 0 &&
            this._stateCounters[stateEnum.pending] === 0);

    }

    function _isPending() {
        this._triggerInputsValidation();

        return (this._stateCounters[stateEnum.invalid] === 0 &&
            this._stateCounters[stateEnum.pending] > 0);

    }

    function _getOnSubmit() {

        var self = this;

        return function(e) {
            if (e) e.preventDefault();

            if (self._isPending()) {
                self._pendingUiStart.call(this, self._inputElems, self._submitElems, self._resetElems);
                self._isPendingUiStartRun = true;
                self._pendingUiLastSubmitElem = this;
            } else if (!self._isValid()) {
                self._onValidationFailure.call(this,
                    self._stateCounters[stateEnum.invalid],
                    self._stateCounters[stateEnum.pending],
                    self._stateCounters[stateEnum.valid]);
            } else {
                self._onValidationSuccess.call(this);
            }

            if (DEBUG) {
                console.debug('cuurent states:');
                console.debug("invalid: " + self._stateCounters[stateEnum.invalid]);
                console.debug("pending: " + self._stateCounters[stateEnum.pending]);
                console.debug("valid: " + self._stateCounters[stateEnum.valid]);
            }

        }

    }

    function _triggerInputsValidation() {
        this._inputs.forEach(function(input) {
            input.triggerValidation();
        });
    }

    function getOnBeforeValidation(){
        return this._onBeforeValidation;
    }

    function getOnAfterValidation(){
        return this._onAfterValidation;
    }

    function updateGroupStates(fromInputState, toInputState) {
        if (fromInputState.stateEnum === toInputState.stateEnum) return;

        this._stateCounters[fromInputState.stateEnum]--;
        this._stateCounters[toInputState.stateEnum]++;

    }

    function updateGroupListeners() {
        if (this._groupStatesChanged) this._groupStatesChanged();

        // run both internal and user groupPendingChange functions
        this._groupPendingChangedListeners.forEach(function(listener) {

            if (!this._isPendingChangeTrueRun && this._stateCounters[stateEnum.invalid] === 0 && this._stateCounters[stateEnum.pending] > 0) {
                listener(true);
                this._isPendingChangeTrueRun = true;
            } else if (this._isPendingChangeTrueRun && this._stateCounters[stateEnum.pending] === 0) {
                listener(false);
                this._isPendingChangeTrueRun = false;
            }
        }, this);
    }

    function reset(e) {

        if (e && e.preventDefault) e.preventDefault();

        this._inputs.forEach(function(input) {
            input.reset();
        });

        this._stateCounters[stateEnum.invalid] = 0;
        this._stateCounters[stateEnum.pending] = 0;
        this._stateCounters[stateEnum.valid] = this._inputs.length;
    }

})();

module.exports = InputGroup;

/*
 * 
 * @param {vivalid.Input[]} onValidationSuccess
 * @param {vivalid.Input[]} onValidationFailure
 * @param {vivalid.Input[]} pendingUiStart
 * @param {vivalid.Input[]} pendingUiStop
 *
 */

/** <b> IMPORTANT - the 'this' context inside: {HTMLElement} of the original submitElem that triggered the validation </b>
 *  @name onValidationSuccess
 *  @function
 *  @memberof! _internal
 */

/** <b> IMPORTANT - the 'this' context inside: {HTMLElement} of the original submitElem that triggered the validation </b>
 *  @name onValidationFailure
 *  @function
 *  @memberof! _internal
 *  @param {number} invalid number of invalid inputs
 *  @param {number} pending number of pending inputs
 *  @param {number} valid number of valid inputs
 */

/** <b> IMPORTANT - the 'this' context inside: {HTMLElement} of the original submitElem that triggered the validation </b>
 *  @name pendingUiStart
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement[]} inputElems the group's input elements
 *  @param {HTMLElement[]} submitElems the group's submit elements
 *  @param {HTMLElement[]} resetElems the group's _reset elements
 */

/** <b> IMPORTANT - the 'this' context inside: {HTMLElement} of the original submitElem that triggered the validation </b>
 *  @name pendingUiStop
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement[]} inputElems the group's input elements
 *  @param {HTMLElement[]} submitElems the group's submit elements
 *  @param {HTMLElement[]} resetElems the group's _reset elements
 */

/** A function to be called before triggering any of the input's validators
 *  @name onBeforeValidation
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement} el the input's DOM object.
 */

/** A function to be called after triggering all of the input's validators
 *  @name onAfterValidation
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement} el the input's DOM object.
 */
