# ViValid [![Build Status](https://travis-ci.org/pazams/vivalid.svg)](https://travis-ci.org/pazams/vivalid)
validation rules are seperated from this library. for common validation rules, see https://github.com/pazams/vivalid-rules-core

## Documentation
see [here](http://pazams.github.io/vivalid/documentation/vivalid.html)

## Demos
* [sanity](http://pazams.github.io/vivalid/demos/sanity.html)
* more demos with advance functionality and custom UI - cooming soon.

## Quick start
save these and include them in the same order:

https://raw.githubusercontent.com/pazams/vivalid/master/dist/vivalid-bundle.min.js
https://raw.githubusercontent.com/pazams/vivalid-rules-core/master/dist/vivalid-rules-core-bundle.min.js

## Include from package managers
more info coming soon

## Custom sync rule example
```js
var addValidatorBuilder = vivalid.validatorRepo.addBuilder;
addValidatorBuilder('maxlength',function(ValidationState,stateEnum,options){

    return function(value) {

        var msg = options.msg || 'maximum ' + options.max + ' characters allowed';

        if (value.length > options.max){
            return new ValidationState(msg, stateEnum.invalid);
        }

        else{
            return new ValidationState('', stateEnum.valid);
        }

    };
});
```

## Custom Async rule example (dummy asyc with setTimeout, in place of real word AJAX).
```js
var addValidatorBuilder = vivalid.validatorRepo.addBuilder;
addValidatorBuilder('exisitingUserBob',function(ValidationState,stateEnum,options){

    return function(value, callback){

        var msg = 'user bob exists';

        setTimeout(dummyServiceCall, 5000);

        return new ValidationState('', stateEnum.pending);

        function dummyServiceCall() {

            if (value.indexOf('bob')!==-1) {
                callback(new ValidationState(msg, stateEnum.invalid));
            }
            else {
                callback(new ValidationState('', stateEnum.valid));
            }

        }

    };
});
```






