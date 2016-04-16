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
 * @param {HTMLElement[]} [resetElems] an array of elements that should trigger the group's validation reset.

 */
function InputGroup(inputsArray,submitElems,onValidationSuccess,onValidationFailure,pendingUiStart,pendingUiStop, groupStatesChanged, groupPendingChanged, onBeforeValidation, onAfterValidation,resetElems){

    if(!onValidationSuccess || !onValidationFailure) throw ERROR.mandatorySuccessFailure;

    this.inputs = [];
    this.inputElems = [];
    this.submitElems = [];


    this.onValidationSuccess = onValidationSuccess;
    this.onValidationFailure = onValidationFailure;
    this.pendingUiStart = pendingUiStart;
    this.pendingUiStop = pendingUiStop;
    this.groupStatesChanged = groupStatesChanged;
    this.onBeforeValidation = onBeforeValidation;
    this.onAfterValidation = onAfterValidation;


    this.groupPendingChangedListeners = [];
    this.groupPendingChangedListeners.push(
        function(isPending){
            if(!isPending){
                if(this.isPendingUiStartRun){

                    this.pendingUiStop.call(this.pendingUiLastSubmitElem,this.inputElems,this.submitElems);

                    this.getOnSubmit.call(this).call(this.pendingUiLastSubmitElem);

                    this.isPendingUiStartRun = false;
                    this.pendingUiLastSubmitElem = {};
                }
            }
        }.bind(this)      
    );

    if (groupPendingChanged) 
        this.groupPendingChangedListeners.push(groupPendingChanged);

    this.stateCounters = {};
    this.stateCounters[stateEnum.invalid] = 0;
    this.stateCounters[stateEnum.pending] = 0;
    this.stateCounters[stateEnum.valid] = 0;

    this.isPendingChangeTrueRun = false;

    this.isPendingUiStartRun = false;

    this.pendingUiLastSubmitElem = {};

    this.inputs = inputsArray.map(function(input){
        input.setGroup(this);
        return input;
    },this);

    this.inputElems = inputsArray
    .map(function(input){
        return input.el;
    });


    this.stateCounters[stateEnum.valid] = inputsArray.length;

    this.submitElems = Array.prototype.slice.call(submitElems);

    this.submitElems.forEach(function(submit){
        submit.addEventListener('click',this.getOnSubmit.call(this));
    },this);

    if (resetElems){
        Array.prototype.slice.call(resetElems).forEach(function(submit){
            submit.addEventListener('click',this.reset.bind(this));
        },this);
    }
    

}

InputGroup.prototype = (function(){

    return {
        isValid: isValid,
        isPending: isPending,
        getOnSubmit:  getOnSubmit,
        triggerInputsValidation: triggerInputsValidation,
        updateGroupListeners: updateGroupListeners,
        updateGroupStates: updateGroupStates,
        reset: reset
    };

    function isValid(){
        this.triggerInputsValidation();

        return (this.stateCounters[stateEnum.invalid] === 0 &&
                this.stateCounters[stateEnum.pending] === 0);

    }

    function isPending(){
        this.triggerInputsValidation();

        return (this.stateCounters[stateEnum.invalid] === 0 &&
                this.stateCounters[stateEnum.pending] > 0);

    }

    function getOnSubmit() {

        var self = this;

        return function (e) {
            if(e) e.preventDefault();

            if(self.isPending()){
                self.pendingUiStart.call(this,self.inputElems,self.submitElems);
                self.isPendingUiStartRun = true;
                self.pendingUiLastSubmitElem = this;
            }

            else if(!self.isValid()){
                self.onValidationFailure.call(this,
                                              self.stateCounters[stateEnum.invalid],
                                              self.stateCounters[stateEnum.pending],
                                              self.stateCounters[stateEnum.valid]);
            }

            else {
                self.onValidationSuccess.call(this); 
            }

            if (DEBUG){
                console.debug('cuurent states:');
                console.debug("invalid: " + self.stateCounters[stateEnum.invalid]);
                console.debug("pending: " + self.stateCounters[stateEnum.pending]);
                console.debug("valid: " + self.stateCounters[stateEnum.valid]);
            }

        }

    }

    function triggerInputsValidation(){
        this.inputs.forEach(function(input){
            input.triggerValidation();
        });
    }

    function updateGroupStates(fromInputState, toInputState){
        if (fromInputState.stateEnum === toInputState.stateEnum) return;

        this.stateCounters[fromInputState.stateEnum]--;
        this.stateCounters[toInputState.stateEnum]++;

    }

    function updateGroupListeners(){
        if (this.groupStatesChanged) this.groupStatesChanged();

        // run both internal and user groupPendingChange functions
        this.groupPendingChangedListeners.forEach(function(listener){

            if (!this.isPendingChangeTrueRun && this.stateCounters[stateEnum.invalid] === 0 && this.stateCounters[stateEnum.pending] > 0)
                {
                    listener(true);
                    this.isPendingChangeTrueRun = true;
                }
                else if (this.isPendingChangeTrueRun && this.stateCounters[stateEnum.pending] === 0)
                    {
                        listener(false);
                        this.isPendingChangeTrueRun = false;
                    }
        },this);
    }

    function reset(e){

        if(e && e.preventDefault) e.preventDefault();

        this.inputs.forEach(function(input){
            input.reset();
        });

        this.stateCounters[stateEnum.valid] = this.inputs.length;
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
 */

/** <b> IMPORTANT - the 'this' context inside: {HTMLElement} of the original submitElem that triggered the validation </b>
 *  @name pendingUiStop
 *  @function
 *  @memberof! _internal
 *  @param {HTMLElement[]} inputElems the group's input elements
 *  @param {HTMLElement[]} submitElems the group's submit elements
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
