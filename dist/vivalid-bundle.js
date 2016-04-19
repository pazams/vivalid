(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vivalid = f()}})(function(){var define,module,exports;return (require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    VERSION: '0.1.0',
    DEBUG: false,
    validInputTagNames: ['input', 'textarea', 'select'],
    keyStrokedInputTypes: ['text', 'email', 'password', 'search', 'hidden'],
    ERROR: {
        mandatorySuccessFailure: 'passing callbacks for onValidationSuccess and onValidationFailure is mandatory'
    }
};
},{}],2:[function(require,module,exports){
var isDataSetSupport = testIsDataSetSupport();

function toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function getElementsByTagNames(tagsArray, obj) {
    if (!obj) obj = document;
    var results = [];
    var i = 0;
    for (; i < tagsArray.length; i++) {
        var tags = obj.getElementsByTagName(tagsArray[i]);
        var j = 0;
        for (; j < tags.length; j++) {
            results.push(tags[j]);
        }
    }
    return results;
}

function getClosestParentByAttribute(elem, attr) {

    // Get closest match
    for (; elem && elem !== document; elem = elem.parentNode) {

        if (hasDataSet(elem, attr)) {
            return elem;
        }

    }
    return false;
}

function getChildrenByAttribute(elem, attr) {
    return toArray(elem.getElementsByTagName('*'))
        .filter(function(el) {
            if (hasDataSet(el, attr)) return true;
        });
}

// based on modrenizer test
function testIsDataSetSupport() {
    var n = document.createElement('div');
    n.setAttribute('data-a-b', 'c');
    return !!(n.dataset && n.dataset.aB === 'c');
}

function getDataSet_unsupported(node, attr) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;

    return node.getAttribute('data-' + toDashed(attr));
}

function getDataSet(node, attr) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;

    return node.dataset[attr];
}

function hasDataSet(node, attr) {
    return (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-' + toDashed(attr)));
}

function toDashed(name) {
    return name.replace(/([A-Z])/g, function(u) {
        return "-" + u.toLowerCase();
    });
}

// from http://jaketrent.com/post/addremove-classes-raw-javascript/
// used instead of classList because of lacking browser support
function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}

module.exports = {
    getDataSet: isDataSetSupport ? getDataSet : getDataSet_unsupported,
    hasDataSet: hasDataSet,
    getElementsByTagNames: getElementsByTagNames,
    getClosestParentByAttribute: getClosestParentByAttribute,
    getChildrenByAttribute: getChildrenByAttribute,
    ready: ready,
    toArray: toArray,
    addClass: addClass,
    removeClass: removeClass
};
},{}],3:[function(require,module,exports){
var Input = require('./input');
var InputGroup = require('./input-group');
var $$ = require('./dom-helpers');
var constants = require('./constants');

var validInputTagNames = constants.validInputTagNames;

var callbacks = {}; // custom user defined callbacks
var groupNameToVivalidGroup = {};

/**
 * Adds functional parameters, to be referenced at html data attributes.
 * @memberof! vivalid.htmlInterface
 * @function
 * @example vivalid.htmlInterface.addCallback('onValidationFailure', function(invalid,pending,valid){ alert('input group is invalid!: '+invalid+ ' invalid, ' +pending+' pending, and ' +valid+' valid ' ); });
 * @param {string} name
 * @param {function} fn
 */
function addCallback(name, fn) {
    if (typeof fn !== 'function') throw 'error while trying to add a custom callback: argument must be a function';
    if (callbacks[name]) throw 'error while trying to add a custom callback: ' + name + ' already exists';
    callbacks[name] = fn;
}

/**
 * Bootstraps a group by the group's DOM HTMLElement when using the html data attributes interface. Provides more control over vivalid.htmlInterface.init. Usefull when some of the elements are not present when DOMContentLoaded fires, but rather are appended at some later stage in the application flow.
 * @memberof! vivalid.htmlInterface
 * @function
 * @example vivalid.htmlInterface.initGroup(document.getElementById('FormId'));
 * @param {HTMLElement} groupElem
 */
function initGroup(groupElem) {
    $$.ready(registerGroupFromDataAttribtues);

    function registerGroupFromDataAttribtues() {

        inputElems = $$.getElementsByTagNames(validInputTagNames, groupElem)
            .filter(function(el) {
                return $$.hasDataSet(el, 'vivalidTuples');
            });

        var vivalidGroup = createGroupFromDataAttribtues(groupElem, inputElems);
        addToGroupNameDictionairy(groupElem, vivalidGroup);

    }
}

/**
 * Bootstraps all groups when using the html data attributes interface. Will work on all groups present at initial page load.
 * @memberof! vivalid.htmlInterface
 * @function
 * @example vivalid.htmlInterface.initAll();
 */
function initAll() {

    $$.ready(registerAllFromDataAttribtues);

    function registerAllFromDataAttribtues() {

        var _nextGroupId = 1;

        // es6 map would have been nice here, but this lib is intended to run on es5 browsers. integrating Babel might work.
        var groupIdToInputs = {};
        var groupIdToGroup = {};

        $$.getElementsByTagNames(validInputTagNames)
            .filter(function(el) {
                return $$.hasDataSet(el, 'vivalidTuples');
            })
            .forEach(function(el) {
                addGroupInputs($$.getClosestParentByAttribute(el, 'vivalidGroup'), el);
            });

        for (var groupId in groupIdToInputs) {
            var vivalidGroup = createGroupFromDataAttribtues(groupIdToGroup[groupId], groupIdToInputs[groupId]);
            addToGroupNameDictionairy(groupIdToGroup[groupId], vivalidGroup);
        }

        function addGroupInputs(group, input) {

            if (!group) {
                throw 'an input validation is missing a group, input id: ' + input.id;
            }

            if (!group._groupId) group._groupId = _nextGroupId++;

            if (!groupIdToInputs[group._groupId]) {
                groupIdToInputs[group._groupId] = [];
                groupIdToGroup[group._groupId] = group;
            }

            groupIdToInputs[group._groupId].push(input);
        }

    }

}

/**
 * Allow's an application to reset the validations state and event listeners of a group
 * @memberof! vivalid.htmlInterface
 * @function
 * @example vivalid.htmlInterface.resetGroup('contactGroup');
 * @param {string} groupName
 */
function resetGroup(groupName) {

    var vivalidGroup = groupNameToVivalidGroup[groupName];

    if (vivalidGroup) {
        vivalidGroup.reset();
    } else {
        console.log('could not find group named ' + groupName);
    }

}

/**
 * @private
 */

function addToGroupNameDictionairy(groupElem, vivalidGroup) {
    groupName = $$.getDataSet(groupElem, 'vivalidGroup');
    groupNameToVivalidGroup[groupName] = vivalidGroup;
}

function createGroupFromDataAttribtues(groupElem, inputElems) {
    var inputs = inputElems.map(vivalidInputFromElem);

    var onValidation = [null, null];
    var pendingUi = [null, null];
    var groupStatesChanged;
    var groupPendingChanged;
    var onBeforeValidation;
    var onAfterValidation;

    if ($$.hasDataSet(groupElem, 'vivalidOnValidation')) {
        onValidation = JSON.parse($$.getDataSet(groupElem, 'vivalidOnValidation'));
        if (!Array.isArray(onValidation) || onValidation.length !== 2) throw 'data-vivalid-on-validation value should be an array of size 2';
    }

    if ($$.hasDataSet(groupElem, 'vivalidPendingUi')) {
        pendingUi = JSON.parse($$.getDataSet(groupElem, 'vivalidPendingUi'));
        if (!Array.isArray(pendingUi) || pendingUi.length !== 2) throw 'data-vivalid-pending-ui value should be an array of size 2';
    }

    if ($$.hasDataSet(groupElem, 'vivalidStatesChanged')) {
        groupStatesChanged = $$.getDataSet(groupElem, 'vivalidStatesChanged');
    }

    if ($$.hasDataSet(groupElem, 'vivalidPendingChanged')) {
        groupPendingChanged = $$.getDataSet(groupElem, 'vivalidPendingChanged');
    }

    if ($$.hasDataSet(groupElem, 'vivalidBeforeValidation')) {
        onBeforeValidation = $$.getDataSet(groupElem, 'vivalidBeforeValidation');
    }

    if ($$.hasDataSet(groupElem, 'vivalidAfterValidation')) {
        onAfterValidation = $$.getDataSet(groupElem, 'vivalidAfterValidation');
    }

    return new InputGroup(inputs,
        $$.getChildrenByAttribute(groupElem, 'vivalidSubmit'),
        callbacks[onValidation[0]],
        callbacks[onValidation[1]],
        callbacks[pendingUi[0]],
        callbacks[pendingUi[1]],
        groupStatesChanged,
        groupPendingChanged,
        callbacks[onBeforeValidation],
        callbacks[onAfterValidation],
        $$.getChildrenByAttribute(groupElem, 'vivalidReset')
    );
}

/**
 * @private
 */
function vivalidInputFromElem(el) {
    var tuplesArray = JSON.parse($$.getDataSet(el, 'vivalidTuples'));
    var onInputValidationResult;
    if ($$.hasDataSet(el, 'vivalidResult')) {
        onInputValidationResult = $$.getDataSet(el, 'vivalidResult');
    }

    var isBlurOnly = $$.hasDataSet(el, 'vivalidBlurOnly');

    return new Input(el, tuplesArray, callbacks[onInputValidationResult], isBlurOnly);
}

/**
 * The interface to use when using data attributes to define Inputs And Groups.
 * @memberof! vivalid 
 * @namespace htmlInterface
 */
module.exports = {
    addCallback: addCallback,
    initAll: initAll,
    initGroup: initGroup,
    resetGroup: resetGroup
};
},{"./constants":1,"./dom-helpers":2,"./input":6,"./input-group":4}],4:[function(require,module,exports){
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
 * @param {HTMLElement[]} [_resetElems] an array of elements that should trigger the group's validation _reset.

 */
function InputGroup(inputsArray, submitElems, onValidationSuccess, onValidationFailure, pendingUiStart, pendingUiStop, groupStatesChanged, groupPendingChanged, onBeforeValidation, onAfterValidation, _resetElems) {

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
    this.onBeforeValidation = onBeforeValidation;
    this.onAfterValidation = onAfterValidation;

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
            return input.el;
        });

    this._stateCounters[stateEnum.valid] = inputsArray.length;

    this._submitElems = Array.prototype.slice.call(submitElems);

    this._submitElems.forEach(function(submit) {
        submit.addEventListener('click', this._getOnSubmit.call(this));
    }, this);

    if (_resetElems) {
        this._resetElems = Array.prototype.slice.call(_resetElems);
        this._resetElems.forEach(function(submit) {
            submit.addEventListener('click', this.reset.bind(this));
        }, this);
    }

}

InputGroup.prototype = (function() {

    return {
        _isValid: _isValid,
        _isPending: _isPending,
        _getOnSubmit: _getOnSubmit,
        _triggerInputsValidation: _triggerInputsValidation,
        updateGroupListeners: updateGroupListeners,
        updateGroupStates: updateGroupStates,
        reset: reset
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
 *  @param {HTMLElement[]} _resetElems the group's _reset elements
 */

/** <b> IMPORTANT - the 'this' context inside: {HTMLElement} of the original submitElem that triggered the validation </b>
 *  @name pendingUiStop
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement[]} inputElems the group's input elements
 *  @param {HTMLElement[]} submitElems the group's submit elements
 *  @param {HTMLElement[]} _resetElems the group's _reset elements
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

},{"./constants":1,"./input":6,"./state-enum":7}],5:[function(require,module,exports){
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
},{"./state-enum":7,"./validation-state":8}],6:[function(require,module,exports){
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
        _reBindCheckedElement: _reBindCheckedElement,
        triggerValidation: triggerValidation,
        _runValidators: _runValidators,
        _changeEventType: _changeEventType,
        _initListeners: _initListeners,
        setGroup: setGroup,
        _addChangeListener: _addChangeListener,
        _addEventType: _addEventType,
        _removeActiveEventType: _removeActiveEventType,
        _getUpdateInputValidationResultAsync: _getUpdateInputValidationResultAsync,
        _updateInputValidationResult: _updateInputValidationResult,
        reset: reset
    };

    // public

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

    // private

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
            if (validatorResult.stateEnum === stateEnum.valid && validatorIndex + 1 < self.validators.length) {
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

},{"./constants":1,"./dom-helpers":2,"./input-state":5,"./state-enum":7,"./validation-state":8,"./validator-repo":9}],7:[function(require,module,exports){
/**
 * An Enum with 3 states: invalid , pending , valid .
 * @memberof! _internal
 * @type {object}
 * @example stateEnum.invalid
 */
var stateEnum = {
    invalid: 1,
    pending: 2,
    valid: 3
};

module.exports = stateEnum;
},{}],8:[function(require,module,exports){
/**
 * {constructor} creates a new ValidationState object with a validation message and state.
 * @memberof! _internal
 * @class
 * @example new ValidationState('required',stateEnum.invalid)
 * @param {string} message the validation message.
 * @param {number} stateEnum the int value of the enum.
 */
function ValidationState(message, stateEnum) {
    this.message = message;
    this.stateEnum = stateEnum;
}

module.exports = ValidationState;

/**
 * @namespace _internal
 */
},{}],9:[function(require,module,exports){
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
},{"./state-enum":7,"./validation-state":8}],"vivalid":[function(require,module,exports){
'use strict';

var Input = require('./input');
var InputGroup = require('./input-group');
var validatorRepo = require('./validator-repo');
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

},{"./constants":1,"./html-interface":3,"./input":6,"./input-group":4,"./validator-repo":9}]},{},["vivalid"]))("vivalid")
});