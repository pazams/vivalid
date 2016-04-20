# ViValid [![Build Status](https://travis-ci.org/pazams/vivalid.svg)](https://travis-ci.org/pazams/vivalid)

## Overview
This library was created to address client side validations that needs also an AJAX server response to verify an input constraint.  
Consider a case of a registration form where a user needs to fill out his personal details while also choosing a username.  
For data integrity- all input constraints are validated on the server side upon data submission.  
For user experience- it is also worthy to validate all input constraints on the client side as the user interacts with your application.  
Some constraints, such as "existing user" or "valid location", need to be validated at the background, and this is where this library plays well. It is also especially useful for SPAs.

## Main features
### Consolidates Sync and Async validations
Sync rules return with `stateEnum.invalid` or `stateEnum.valid`  
Async rules return with `stateEnum.pending`, and also call a callback with `stateEnum.invalid` or `stateEnum.valid` when ready. Callbacks from previous cycles get filtered out, which helps when AJAX responses are out of order from multiple parallel requests.


Demo: https://embed.plnkr.co/daGXkk1RrdRxjFWhQgwX/

### Full UI control 
Either edit the UI through a CSS rule for `.vivalid-error` and `.vivalid-error-input` classes , or gain complete control by passing a [callback](http://pazams.github.io/vivalid/documentation/-_internal.html#..onInputValidationResult) that will be called with a DOM element, validation message, and validation state.

Demo: https://embed.plnkr.co/JsA852mcYTTUHPoUf3F1/

### JS api or data attributes interface
Use this library with full [javascript api](http://pazams.github.io/vivalid/documentation/vivalid.html), or the data attributes html interface (with js to only define callbacks).

Data attribute | defined on    | notes
-------------- | --------------| -----
data-vivalid-group | group | defines an input group. may be applied on (but not restricted to) `<form>` elements. the value may used with [htmlInterface api](http://www.pazams.com/vivalid/documentation/vivalid.htmlInterface.html) in resetGroup.
data-vivalid-on-validation | group | references success and failure callbacks.
data-vivalid-pending-ui | group | references start and stop pending ui callbacks. used only in groups which contain async validators.
data-vivalid-after-validation | group | references before and after validation callbacks. Defined on group level, but gets called on each input individually.
data-vivalid-tuples | input | an array of [validatorsNameOptionsTuple] (http://www.pazams.com/vivalid/documentation/-_internal.html#..validatorsNameOptionsTuple) in JSON format.
data-vivalid-blur-only | input | marks an input to be evaluated on `blur` event only, as opposed to default way: first evaluated on `blur` event, and after one event, evaluate on `input` event.
data-vivalid-submit | button | triggers the group validation. Taking further action such as submitting a form, should be defined on the group's validation success callback. `preventDefault()` is applied to the DOM event. 
data-vivalid-reset | button | resets the state of the validation. this does not reset the form/group or clear its contents. This functionality, through the js api, is useful for SPA's. `preventDefault()` is applied to the DOM event.


### Separation of validator rules
No validator rules are included. Choose to include common ones from https://github.com/pazams/vivalid-rules-core, or write your own.

Demo: https://embed.plnkr.co/Q6bTpj7PhqbQTBUZt166/

### Support for radio buttons and checkboxes
Demo: https://embed.plnkr.co/xtxe1YfsmxRR9hacZ3sn/


## Installation

### Manual:
* save and include: https://cdn.rawgit.com/pazams/vivalid/master/dist/vivalid-bundle.min.js
* (optional) https://cdn.rawgit.com/pazams/vivalid-rules-core/master/dist/vivalid-rules-core-bundle.min.js

### npm:
* `npm install vivalid`
* (optional) `npm install vivalid-rules-core`

### bower:
* `bower install vivalid`
* (optional) `bower install vivalid-rules-core`

## Contributors
read [this](https://github.com/pazams/vivalid/issues/1) before attempting to `gulp build`
