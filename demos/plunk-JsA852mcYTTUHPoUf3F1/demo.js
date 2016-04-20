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

// used to display custom UI
addCallback('onInputValidationResult', function(el, validationsResult, validatorName, stateEnum) {

  var msgEl = el.parentNode.querySelector('.js-message');
  var displayEl = msgEl;

  if (validationsResult.stateEnum === stateEnum.invalid) {
    displayEl.style.display = 'block';
    msgEl.innerHTML = validationsResult.message;
  } else {
    displayEl.style.display = 'none';
    msgEl.innerHTML = '';
  }

});


initAllValidations();

}();

}())