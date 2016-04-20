(function(){
  
"use strict";

window.demo = function(){

var addValidatorBuilder = vivalid.validatorRepo.addBuilder;
var addCallback = vivalid.htmlInterface.addCallback;
var initAllValidations = vivalid.htmlInterface.initAll;
var demoUtils = window.demoUtils;

addCallback('onValidationSuccess', function() {
  demoUtils.messageLog('<span class="label label-success">valid group</span> and form will submit');
  // form.submit() ...
});

addCallback('onValidationFailure', function(invalid, pending, valid) {
  demoUtils.messageLog('<span class="label label-danger">invalid group</span> (  ' + invalid + ' invalid, ' + pending + ' pending, and ' + valid + ' valid )');
});

addCallback('pendingUiStart', function(inputElems, submitElems, resetElems) {
  demoUtils.messageLog('<span class="label label-warning">pendingUiStart</span>');
  inputElems.concat(resetElems).forEach(function(input) {
    input.disabled = true;
  });

  submitElems.forEach(function(submit) {
    submit.disabled = true;
  });

  this.disabled = true;
});

addCallback('pendingUiStop', function(inputElems, submitElems, resetElems) {
  demoUtils.messageLog('<span class="label label-warning">pendingUiStop</span>');
  inputElems.concat(resetElems).forEach(function(input) {
    input.disabled = false;
  });

  submitElems.forEach(function(submit) {
    submit.disabled = false;
  });

  this.disabled = false;
});

addValidatorBuilder('exisitingUserBob', function(ValidationState, stateEnum, options) {

  return function(value, callback) {

    var msg = 'user bob exists';

    setTimeout(dummyServiceCall, 5000);

    return new ValidationState('', stateEnum.pending);

    function dummyServiceCall() {

      if (value.indexOf('bob') !== -1) {
        callback(new ValidationState(msg, stateEnum.invalid));
      } else {
        callback(new ValidationState('', stateEnum.valid));
      }


    }

  };
});

initAllValidations();

}();

}())