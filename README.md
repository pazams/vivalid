# ViValid [![Build Status](https://travis-ci.org/pazams/vivalid.svg)](https://travis-ci.org/pazams/vivalid)
validation rules are seperated from this library. for common validation rules, see https://github.com/pazams/vivalid-rules-core

## Overview
This library was created to address client side validations that needs also an AJAX server response to verify an input constraint.
Consider a case of a registration form where a user needs to fill out his personal details while also choosing a username.
For data integrity- all input constraints are validated on the server side upon data submission.
For user experience- it is also worthy to validate all input constraints on the client side as the user interacts with your application. Some constraints, such as "existing user" or "valid location", needs to be validated at the background.
The library is especially useful for SPAs.

## Main features
### Consolidates Sync and Async validations
### Full UI control 
Either edit the UI through a CSS rule for .vivalid-error , or gain complete control by passing a [callback](http://pazams.github.io/vivalid/documentation/-_internal.html#..onInputValidationResult) that will be called with a DOM element, validation message, and validation state.
### Data attributes interface
Use this library with full javascript interface, or the data attributes html interface (with js to only define callbacks).
### Separation of validator rules
No validator rules are included. Write your own, or also choose to include common ones from https://github.com/pazams/vivalid-rules-core


## Installation

### Manual:
* save and include: https://raw.githubusercontent.com/pazams/vivalid/master/dist/vivalid-bundle.min.js
* (optional) https://raw.githubusercontent.com/pazams/vivalid-rules-core/master/dist/vivalid-rules-core-bundle.min.js

### npm:
* `npm install vivalid`
* (optional) `npm install vivalid-rules-core`

### bower:
* `bower install vivalid`
* (optional) `bower install vivalid-rules-core`

## JS interface
See js [documentation](http://pazams.github.io/vivalid/documentation/vivalid.html)

## Data attributes html interface
See js [documentation](http://pazams.github.io/vivalid/documentation/vivalid.html), plus a short example ([live here](http://pazams.github.io/vivalid/demos/1/)):

**index.html**
```html
<!DOCTYPE html>
<html>

<head>
  <script src="https://rawgit.com/pazams/vivalid/master/dist/vivalid-bundle.js"></script>
  <script src="https://rawgit.com/pazams/vivalid-rules-core/master/dist/vivalid-rules-core-bundle.min.js"></script>
  <script src="script.js"></script>
</head>

<body>
<!-- inline css styles to make the exmaple work as a standalone without a css file -->
  <h1>Html data attributes interface</h1>

  <form id="MainForm" data-vivalid-group data-vivalid-on-validation='["onValidationSuccess", "onValidationFailure"]' data-vivalid-pending-ui='["pendingUiStart", "pendingUiStop"]'>

    <div>
      <input type="text" placeholder="First Name" data-vivalid-tuples='[["required",{}],["betweenlength",{"min": 4, "max": 10}]]' />
    </div>

      <div style="position: relative;">
      
      <input type="text" placeholder="User Name (type 'bob' and press send)" 
      data-vivalid-tuples='[["required",{}],["exisitingUserBob",{}]]'
      data-vivalid-result='onInputValidationResult'
      />

      <div class="js-message" style="background-color: blue; color: white; display: none; position: absolute; z-index: 1; padding: 6px; left: 122px; top: 0;">
      </div>
      
    </div>

    <div>
      <input id="SendButton" type="button" value="send" data-vivalid-submit />
    </div>
    
    <div id="MessageLogs">
      
    </div>

  </form>

</body>

</html>
```

**script.js**
```javascript
var addValidatorBuilder = vivalid.validatorRepo.addBuilder;
    var addCallback = vivalid.htmlInterface.addCallback;
    var initAll = vivalid.htmlInterface.initAll;
    
    function messageLog(message){
      var log = document.getElementById('MessageLogs');
      log.innerHTML = log.innerHTML +'<br/>' + message;
    }

    addValidatorBuilder('exisitingUserBob', function(ValidationState, stateEnum, options) {

      return function(value, callback) {

        var msg = 'user bob exists';

        setTimeout(dummyServiceCall, 3000);

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

    addCallback('onValidationSuccess', function() {
      messageLog('HOORAY!!!! input group is valid and form will submit');
    });

    addCallback('onValidationFailure', function(invalid, pending, valid) {
      messageLog('input group is invalid!: ' + invalid + ' invalid, ' + pending + ' pending, and ' + valid + ' valid ');
    });

    addCallback('pendingUiStart', function(inputElems, submitElems) {
      messageLog('pendingUiStart');
      inputElems.forEach(function(input) {
        input.disabled = true;
      });

      submitElems.forEach(function(submit) {
        submit.disabled = true;
      });

      this.style.backgroundColor = 'green';
    });

    addCallback('pendingUiStop', function(inputElems, submitElems) {
            messageLog('pendingUiStop');
      inputElems.forEach(function(input) {
        input.disabled = false;
      });

      submitElems.forEach(function(submit) {
        submit.disabled = false;
      });

      this.style.backgroundColor = 'blue';
    });

    // show casing a callback for custom UI
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


    initAll();
```

## More demos
Coming soon
