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