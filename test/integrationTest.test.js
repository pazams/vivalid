'use strict';

describe('validations', function() {

    var Name,Email,SendButton,ResetButton,Form;

    var clickEvent = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    var blurEvent = new MouseEvent('blur', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    var inputEvent = new MouseEvent('input', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    function selectFormElements(formNumber) {
        Name = document.getElementById('Name'+formNumber);
        Email = document.getElementById('Email'+formNumber);
        SendButton = document.getElementById('SendButton'+formNumber);
        ResetButton = document.getElementById('ResetButton'+formNumber);
        Form = document.getElementById('Form'+formNumber);
    }


    function isErrorDisplayed(el) {
        return (el.nextSibling.className === "vivalid-error");
    }

    var addValidatorBuilder = vivalid.validatorRepo.addBuilder;
    var addCallback = vivalid.htmlInterface.addCallback;
    var initAll = vivalid.htmlInterface.initAll;
    var initGroup = vivalid.htmlInterface.initGroup;
    var resetGroup = vivalid.htmlInterface.resetGroup;
    var ERROR = vivalid._ERROR;

    before(function() {

        addValidatorBuilder('required',function(ValidationState,stateEnum,options){

            return function(value) {

                var msg = options.msg || 'this field is required';

                if (!value){
                    return new ValidationState(msg, stateEnum.invalid);
                }

                else{
                    return new ValidationState('', stateEnum.valid);
                }

            };
        });

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

        addValidatorBuilder('exisitingUserBob', function(ValidationState, stateEnum, options) {

            return function(value, callback) {

                var msg = 'user bob exists';

                setTimeout(dummyServiceCall, 0);

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

        addCallback('onValidationSuccess', function(){
        });

        addCallback('onValidationFailure', function(invalid,pending,valid){
            if(typeof invalid !== 'number' || typeof pending !== 'number' || typeof valid !== 'number'){
                throw ERROR+"onValidationFailure";
            }
        });

        addCallback('pendingUiStart', function(inputElems,submitElems,resetElems){ 
            try{
                inputElems.concat(submitElems).concat(resetElems).forEach(function(input) {
                    input.disabled = true;
                });

                this.disabled = true;
            }
            catch(e){
                throw ERROR+"pendingUiStart";
            }
            finally {
                // done();
            }
        });

        addCallback('pendingUiStop' ,function(inputElems,submitElems,resetElems){
            try{
                inputElems.concat(submitElems).concat(resetElems).forEach(function(input) {
                    input.disabled = true;
                });

                this.disabled = true;
            }
            catch(e){
                throw ERROR+"pendingUiStop";
            }
            finally {
                // done();
            }
        });

        addCallback('onBeforeValidation' ,function(input){

        });

        addCallback('onAfterValidation' ,function(input){

        });

    });


describe('Sanity', function() {

    // inject the HTML fixture for the tests
    beforeEach(function() {
        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(1);
        initGroup(Form);

    });

    // remove the html fixture from the DOM
    afterEach(function() {
        fixture.cleanup();
    });


    // UX/UI

    it('should not display any errors before interacting with the inputs', function() {
        expect(!isErrorDisplayed(Name) && !isErrorDisplayed(Email)).to.be.ok;
    });

    it('should display all invalid errors after submitting, even without interacting with the inputs', function() {
        SendButton.click();
        expect(isErrorDisplayed(Name) && isErrorDisplayed(Email)).to.be.ok;
    });

    it('should not display an error before first blur (focus out)', function() {

        Name.dispatchEvent(clickEvent);
        Name.value = "John Doe";

        expect(!isErrorDisplayed(Name)).to.be.ok;
    });

    it('should display an error after first blur (focus out)', function() {

        Name.dispatchEvent(clickEvent);

        Name.value = "John Doe";
        Name.dispatchEvent(blurEvent);

        expect(isErrorDisplayed(Name)).to.be.ok;
    });

    it('should respond to fixes as they are typed, after first blur (focus out)', function() {

        Name.dispatchEvent(clickEvent);

        Name.value = "John Doe";
        Name.dispatchEvent(blurEvent);

        Name.value = "John";
        Name.dispatchEvent(inputEvent);

        expect(!isErrorDisplayed(Name)).to.be.ok;
    });

});


// TODO: the function returned from _getUpdateInputValidationResultAsync does not get called- since tests do not wait for done()
describe('Async', function() {

    // inject the HTML fixture for the tests
    beforeEach(function() {
        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(6);
        initGroup(Form);

    });

    // remove the html fixture from the DOM
    afterEach(function() {
        fixture.cleanup();
    });


    // UX/UI

    it('should call pendingUiStart and pendingUiStop, and executes them without errors', function() {

        Name.dispatchEvent(clickEvent);
        Name.value = "John Doe";

        Email.dispatchEvent(clickEvent);
        Email.value = "bob@email.com";

        SendButton.click();

        // relays on done() inside these functions to test no errors
        // TODO: use sinon...
        expect(true).to.be.ok;
    });

    it('should call pendingUiStart and pendingUiStop, if pending resolved to be valid, and there are more validation to run, run them', function() {

        Name.dispatchEvent(clickEvent);
        Name.value = "John Doe";

        Email.dispatchEvent(clickEvent);
        Email.value = "john@email.com";

        SendButton.click();

        // relays on done() inside these functions to test no errors
        // TODO: use sinon...
        expect(true).to.be.ok;
    });

});

describe('optional & required callbacks', function() {

    it('should not require passing pendingUi or onBefore/onAfterValidation callbacks', function() {

        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(2);
        initGroup(Form);

        fixture.cleanup();

        // works, but improve to test the throws of initAll();
        // instead of dummy test below
        expect(true).to.be.ok;
    });

    it('should require passing onValidation callbacks', function() {

        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(3);

        expect(initGroup.bind(this,Form)).to.throw(ERROR.mandatorySuccessFailure);

        fixture.cleanup();
    });


});

/* use sinon to test these callbacks */
/*
   describe('onBefore/onAfter Validation', function() {

   it('should call onBeforeValidation', function() {

        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(5);
        initGroup(Form);

        Name.dispatchEvent(clickEvent);

        Name.value = "John Doe";
        Name.dispatchEvent(blurEvent);


        // works, but improve to test the throws of initAll();
        // instead of dummy test below
        expect(true).to.be.ok;

        fixture.cleanup();
        });

        it('should call onAfterValidation', function() {

        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(5);
        initGroup(Form);

        Name.dispatchEvent(clickEvent);

        Name.value = "John Doe";
        Name.dispatchEvent(blurEvent);


    // works, but improve to test the throws of initAll();
    // instead of dummy test below
    expect(true).to.be.ok;

    fixture.cleanup();
    });



    });
    */

describe('Blur-only inputs', function() {


    // inject the HTML fixture for the tests
    beforeEach(function() {
        // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
        fixture.base = 'test';
        fixture.load('integrationTest.fixture.html');

        selectFormElements(4);
        initGroup(Form);

    });

    // remove the html fixture from the DOM
    afterEach(function() {
        fixture.cleanup();
    });


    // UX/UI

    it('Blur-only: should not display any errors before interacting with the inputs', function() {
        expect(!isErrorDisplayed(Name) && !isErrorDisplayed(Email)).to.be.ok;
    });

    it('Blur-only: should display all invalid errors after submitting, even without interacting with the inputs', function() {
        SendButton.click();
        expect(isErrorDisplayed(Name) && isErrorDisplayed(Email)).to.be.ok;
    });

    it('Blur-only: should not display an error before first blur (focus out)', function() {

        Name.dispatchEvent(clickEvent);
        Name.value = "John Doe";

        expect(!isErrorDisplayed(Name)).to.be.ok;
    });

    it('Blur-only: should display an error after first blur (focus out)', function() {

        Name.dispatchEvent(clickEvent);

        Name.value = "John Doe";
        Name.dispatchEvent(blurEvent);

        expect(isErrorDisplayed(Name)).to.be.ok;
    });

    it('Blur-only: should ***NOT*** respond to fixes as they are typed, after first blur (focus out)', function() {

        Name.dispatchEvent(clickEvent);

        Name.value = "John Doe";
        Name.dispatchEvent(blurEvent);

        Name.value = "John";
        Name.dispatchEvent(inputEvent);

        expect(isErrorDisplayed(Name)).to.be.ok;
    });

});


describe('Group reset', function() {

    resetMode('groupName');
    resetMode('button');

    function resetMode(mode){

        // inject the HTML fixture for the tests
        beforeEach(function() {
            // Why this line? See: https://github.com/billtrik/karma-fixture/issues/3
            fixture.base = 'test';
            fixture.load('integrationTest.fixture.html');

            selectFormElements(1);
            initGroup(Form);

            interactAndReset();

        });


        // remove the html fixture from the DOM
        afterEach(function() {
            fixture.cleanup();
        });

        function interactAndReset(){

            Name.dispatchEvent(clickEvent);

            Name.value = "John Doe";
            Name.dispatchEvent(blurEvent);
            Name.value = "John Doe2";
            Name.dispatchEvent(inputEvent);

            switch(mode){
                case "groupName": 
                    resetGroup('FirstGroup');
                    break;

                case "button":
                    ResetButton.click();
                    break;
            }

        }


        // UX/UI

        it('after error displayed and reset- should not display any errors before interacting with the inputs', function() {
            expect(!isErrorDisplayed(Name) && !isErrorDisplayed(Email)).to.be.ok;
        });

        it('after error displayed and reset- should display all invalid errors after submitting, even without interacting with the inputs', function() {
            SendButton.click();
            expect(isErrorDisplayed(Name) && isErrorDisplayed(Email)).to.be.ok;
        });

        it('after error displayed and reset- should not display an error before first blur (focus out)', function() {

            Name.dispatchEvent(clickEvent);
            Name.value = "John Doe";

            expect(!isErrorDisplayed(Name)).to.be.ok;
        });

        it('after error displayed and reset- should display an error after first blur (focus out)', function() {

            Name.dispatchEvent(clickEvent);

            Name.value = "John Doe";
            Name.dispatchEvent(blurEvent);

            expect(isErrorDisplayed(Name)).to.be.ok;
        });

        it('after error displayed and reset- should respond to fixes as they are typed, after first blur (focus out)', function() {

            Name.dispatchEvent(clickEvent);

            Name.value = "John Doe";
            Name.dispatchEvent(blurEvent);

            Name.value = "John";
            Name.dispatchEvent(inputEvent);

            expect(!isErrorDisplayed(Name)).to.be.ok;
        });

    }

});



});
