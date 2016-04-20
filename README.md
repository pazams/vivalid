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
Asyc rules return with `stateEnum.pending`, and also call a callback with `stateEnum.invalid` or `stateEnum.valid` when ready. Callbacks from previous cycles get filtered out, which helps when AJAX responses are out of order from multiple parallel requests.


Demo: https://embed.plnkr.co/daGXkk1RrdRxjFWhQgwX/

### Full UI control 
Either edit the UI through a CSS rule for `.vivalid-error` and `.vivalid-error-input` classes , or gain complete control by passing a [callback](http://pazams.github.io/vivalid/documentation/-_internal.html#..onInputValidationResult) that will be called with a DOM element, validation message, and validation state.

Demo: https://embed.plnkr.co/JsA852mcYTTUHPoUf3F1/

### JS api or data attributes interface
Use this library with full [javascript api](http://www.pazams.com/vivalid/documentation/vivalid.html), or the data attributes html interface (with js to only define callbacks).



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

## JS interface
See js [documentation](http://pazams.github.io/vivalid/documentation/vivalid.html)

## Data attributes html interface
See js [documentation](http://pazams.github.io/vivalid/documentation/vivalid.html), plus a short example ([live here](http://pazams.github.io/vivalid/demos/1/)):

## Contributers
read [this](https://github.com/pazams/vivalid/issues/1) before attempting to `gulp build`
