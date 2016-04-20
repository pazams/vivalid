var validatorRepo = require('./validator-repo');
var stateEnum = require('./state-enum');
var ValidationState = require('./validation-state');
var InputState = require('./input-state');
var constants = require('./constants');
var $$ = require('./dom-helpers');

var validInputTagNames = constants.validInputTagNames;
var keyStrokedInputTypes = constants.keyStrokedInputTypes;

/**
 * creates a new Input object wrapping around a DOM object.
 * @memberof! vivalid 
 * @class
 * @example new Input(document.getElementById('Name'), [['required',{msg: 'custom required message'}],['max',{max: 10}]])
 * @param {HTMLElement} el the DOM object to wrap. For radios and checkboxes, pass only 1 element- the class will find it's siblings with the same name attribute.
 * @param {_internal.validatorsNameOptionsTuple[]} validatorsNameOptionsTuples <b> the order matters- the input's state is the first {@link _internal.validatorsNameOptionsTuple validatorsNameOptionsTuple} that evulates to a non-valid (pending or invalid) state. </b>
 * @param {function} [onInputValidationResult] Signature of {@link _internal.onInputValidationResult onInputValidationResult}. A function to handle an input state or message change. If not passed, {@link _internal.defaultOnInputValidationResult defaultOnInputValidationResult} will be used.
 * @param {boolean} isBlurOnly if true, doesn't not trigger validation on 'input' or 'change' events.
 */
function Input(el, validatorsNameOptionsTuples, onInputValidationResult, isBlurOnly) {

    if (validInputTagNames.indexOf(el.nodeName.toLowerCase()) === -1) {
        throw 'only operates on the following html tags: ' + validInputTagNames.toString();
    }

    this._el = el;
    this._validatorsNameOptionsTuples = validatorsNameOptionsTuples;
    this._onInputValidationResult = onInputValidationResult || defaultOnInputValidationResult;
    this._isBlurOnly = isBlurOnly;

    this._validators = buildValidators();

    this._inputState = new InputState();

    this._elName = el.nodeName.toLowerCase();
    this._elType = el.type;
    this._isKeyed = (this._elName === 'textarea' || keyStrokedInputTypes.indexOf(this._elType) > -1);

    this._runValidatorsBounded = this._runValidators.bind(this);

    this._initListeners();

    function buildValidators() {
        var result = [];
        validatorsNameOptionsTuples.forEach(function(validatorsNameOptionsTuple) {
            var validatorName = validatorsNameOptionsTuple[0];
            var validatorOptions = validatorsNameOptionsTuple[1];

            result.push({
                name: validatorName,
                run: validatorRepo.build(validatorName, validatorOptions)
            });

        });

        return result;
    }

    /** The default {@link _internal.onInputValidationResult onInputValidationResult} used when {@link vivalid.Input} is initiated without a 3rd parameter
     *  @name defaultOnInputValidationResult
     *  @function
     *  @memberof! _internal
     */
    function defaultOnInputValidationResult(el, validationsResult, validatorName, stateEnum) {

        var errorDiv;

        // for radio buttons and checkboxes:  get the last element in group by name
        if ((el.nodeName.toLowerCase() === 'input' && (el.type === 'radio' || el.type === 'checkbox'))) {

            var getAllByName = el.parentNode.querySelectorAll('input[name="' + el.name + '"]');

            el = getAllByName.item(getAllByName.length - 1);
        }

        if (validationsResult.stateEnum === stateEnum.invalid) {

            errorDiv = getExistingErrorDiv(el);
            if (errorDiv) {
                errorDiv.textContent = validationsResult.message;
            } else {
                appendNewErrorDiv(el, validationsResult.message);
            }

            el.style.borderStyle = "solid";
            el.style.borderColor = "#ff0000";
            $$.addClass(el, "vivalid-error-input");
        } else {
            errorDiv = getExistingErrorDiv(el);
            if (errorDiv) {
                errorDiv.parentNode.removeChild(errorDiv);
                el.style.borderStyle = "";
                el.style.borderColor = "";
                $$.removeClass(el, "vivalid-error-input");
            }
        }

        function getExistingErrorDiv(el) {
            if (el.nextSibling.className === "vivalid-error") {
                return el.nextSibling;
            }

        }

        function appendNewErrorDiv(el, message) {
            errorDiv = document.createElement("DIV");
            errorDiv.className = "vivalid-error";
            errorDiv.style.color = "#ff0000";
            var t = document.createTextNode(validationsResult.message);
            errorDiv.appendChild(t);
            el.parentNode.insertBefore(errorDiv, el.nextSibling);
        }

    }

}

Input.prototype = (function() {

    return {
        triggerValidation: triggerValidation,
        setGroup: setGroup,
        reset: reset,
        _reBindCheckedElement: _reBindCheckedElement,
        _runValidators: _runValidators,
        _changeEventType: _changeEventType,
        _initListeners: _initListeners,
        _addChangeListener: _addChangeListener,
        _addEventType: _addEventType,
        _removeActiveEventType: _removeActiveEventType,
        _getUpdateInputValidationResultAsync: _getUpdateInputValidationResultAsync,
        _updateInputValidationResult: _updateInputValidationResult
    };

    function _reBindCheckedElement() {

        // reBind only radio and checkbox buttons
        if (!(this._el.nodeName.toLowerCase() === 'input' && (this._el.type === 'radio' || this._el.type === 'checkbox'))) {
            return;
        }

        var checkedElement = document.querySelector('input[name="' + this._el.name + '"]:checked');
        if (checkedElement) {
            this._el = checkedElement;
            this._inputState.isNoneChecked = false;
        } else {
            this._inputState.isNoneChecked = true;
        }

    }

    function triggerValidation() {
        if (this._inputState.validationCycle === 0 || this._inputState.isChanged) {
            this._runValidatorsBounded();
        }
    }

    function _changeEventType(eventType) {
        if (!this._isKeyed) return;
        if (eventType === this._inputState.activeEventType) return;
        this._removeActiveEventType();
        this._addEventType(eventType);
    }

    function setGroup(value) {
        this._group = value;
    }

    function _initListeners() {

        this._addChangeListener();
        if (this._isKeyed) {
            this._addEventType('blur');
        } else {
            this._addEventType('change');
        }

    }

    function _runValidators(event, fromIndex) {

        this._inputState.validationCycle++;
        this._reBindCheckedElement();

        if (typeof this._group.onBeforeValidation === 'function') {
            this._group.onBeforeValidation(this._el);
        }

        var validationsResult, validatorName;

        var i = fromIndex || 0;
        for (; i < this._validators.length; i++) {
            var validator = this._validators[i];
            var elementValue = this._inputState.isNoneChecked ? '' : this._el.value;
            // if async, then return a pending enum with empty message and call the callback with result once ready
            var validatorResult = validator.run(elementValue, this._getUpdateInputValidationResultAsync(validator.name, i, this._inputState.validationCycle));
            if (validatorResult.stateEnum !== stateEnum.valid) {
                validationsResult = validatorResult;
                validatorName = validator.name;
                if (!this._isBlurOnly) {
                    this._changeEventType('input'); //TODO: call only once?
                }
                break;
            }

        }

        validationsResult = validationsResult || new ValidationState('', stateEnum.valid);
        this._updateInputValidationResult(validationsResult, validatorName);

        // new...
        this._inputState.isChanged = false; // TODO: move to top of function

        if (typeof this._group.onAfterValidation === 'function') {
            this._group.onAfterValidation(this._el);
        }

    }

    function reset() {
        this._removeActiveEventType();
        this._initListeners();
        this._inputState = new InputState();
        this._onInputValidationResult(this._el, stateEnum.valid, '', stateEnum); // called with valid state to clear any previous errors UI
    }

    function _addChangeListener() {

        var self = this;

        if (this._isKeyed) {
            if (this._isBlurOnly) {
                return;
            } else {
                this._el.addEventListener('input', function() {
                    self._inputState.isChanged = true;
                }, false);
            }
        } else if (this._elName === 'input' && (this._elType === 'radio' || this._elType === 'checkbox')) {

            var groupElements = document.querySelectorAll('input[name="' + this._el.name + '"]');

            var i = 0;
            for (; i < groupElements.length; i++) {
                groupElements[i].addEventListener('change', function() {
                    self._inputState.isChanged = true;
                }, false);
            }
        } else if (this._elName === 'select') {
            this._el.addEventListener('change', function() {
                self._inputState.isChanged = true;
            }, false);
        }
    }

    function _addEventType(eventType) {
        if (this._isKeyed) {
            this._el.addEventListener(eventType, this._runValidatorsBounded, false);
        } else if (this._elName === 'input' && (this._elType === 'radio' || this._elType === 'checkbox')) {

            var groupElements = document.querySelectorAll('input[name="' + this._el.name + '"]');

            var i = 0;
            for (; i < groupElements.length; i++) {
                groupElements[i].addEventListener(eventType, this._runValidatorsBounded, false);
            }
        } else if (this._elName === 'select') {
            this._el.addEventListener(eventType, this._runValidatorsBounded, false);
        }

        this._inputState.activeEventType = eventType;
    }

    function _removeActiveEventType() {
        this._el.removeEventListener(this._inputState.activeEventType, this._runValidatorsBounded, false);
    }

    function _getUpdateInputValidationResultAsync(validatorName, validatorIndex, asyncValidationCycle) {

        var self = this;

        return function(validatorResult) {

            // guard against updating async validations from old cycles
            if (asyncValidationCycle && asyncValidationCycle !== self._inputState.validationCycle) {
                return;
            }

            // if pending turned to be valid, and there are more validation to run, run them:
            if (validatorResult.stateEnum === stateEnum.valid && validatorIndex + 1 < self._validators.length) {
                self._runValidatorsBounded(null, validatorIndex + 1);
            } else {
                self._updateInputValidationResult(validatorResult, validatorName);
            }
        };

    }

    function _updateInputValidationResult(validationsResult, validatorName) {

        this._group.updateGroupStates(this._inputState.validationState, validationsResult); // filter equal state at caller
        this._group.updateGroupListeners();

        this._inputState.validationState = validationsResult;
        this._onInputValidationResult(this._el, validationsResult, validatorName, stateEnum);

    }

})();

module.exports = Input;

/** An Array where Array[0] is the validator {string} name, and Array[1] is the validator {object} options 
 *  @name validatorsNameOptionsTuple
 *  @type {array}
 *  @memberof! _internal
 *  @example ['required',{msg: 'custom required message'}]
 */

/** A function to handle an input state or message change
 *  @name onInputValidationResult
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement} el the input's DOM object.
 *  @param {object} validationsResult A {@link _internal.ValidationState ValidationState} instance containing the state and validation message.
 *  @param {string} validatorName The name of validator that triggered an 'invalid' state.
 *  @param {object} stateEnum {@link _internal.stateEnum stateEnum}
 */
