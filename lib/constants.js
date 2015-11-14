module.exports = {
    VERSION: '0.1.0',
    DEBUG: false,
    validInputTagNames: ['input', 'textarea', 'select'],
    keyStrokedInputTypes: ['text', 'email', 'password', 'search'],
    ERROR: {
        mandatorySuccessFailure: 'passing callbacks for onValidationSuccess and onValidationFailure is mandatory'
    } 
};
