// console.logs the messages, makes sure it's a string, then adds it to the app's console as well
function log(message){
  console.log(message);
  if (typeof message !== 'string'){
    message = JSON.stringify(message);
  }

  if (!window.consoleUpdated){
    window.consoleContent = message;
    window.consoleUpdated = true;
  }else{
    window.consoleContent += '\n\n' + message;
  }

  if (document.getElementById('consoleContent')){
    document.getElementById('consoleContent').value = window.consoleContent;
  }
}

export default log
