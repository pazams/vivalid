(function(){
  
"use strict";

window.demoUtils = function(){

var log, cleanLog;

documentReady(init);

return{
  messageLog: messageLog
}

function init() {

  log = document.getElementById('Log');
  cleanLog = document.getElementById('CleanLog');

  cleanLog.addEventListener('click', function() {
    log.innerHTML = '';
  })


}

function messageLog(message) {
  var spacer = log.innerHTML !== '' ? '<br/><br/>' : '';
  log.innerHTML = log.innerHTML + spacer + message;
}



function documentReady(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

}();

}())