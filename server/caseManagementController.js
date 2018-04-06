// var app = require('./index.js');
var requestify = require('requestify');

module.exports = {

  getCaseView:  (event, arg) => {
    let { url, token, caseId } = arg;
    
    requestify.post(url, {
      token: token,
      caseId: caseId
    })
    .then(
      function (response) {
        var data = response.getBody();
        event.sender.send('getCaseViewResult', {data: data});
      },
      function (err) {
        event.sender.send('getCaseViewResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token. Full error: ' + JSON.stringify(err));
      }
    );
  },

  getMessages:  (event, arg) => {
    let { url, token, caseId } = arg;
    
    requestify.post(url, {
      token: token,
      caseId: caseId
    })
    .then(
      function (response) {
        var data = response.getBody();
        event.sender.send('getMessagesResult', {data: data});
      },
      function (err) {
        event.sender.send('getMessagesResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token. Full error: ' + JSON.stringify(err));
      }
    );
  },

  getUserList:  (event, arg) => {
    let { url, token, searchTerm, caseSensitiveSearch } = arg;
    
    requestify.post(url, {
      token: token,
      searchTerm: searchTerm,
      caseSensitiveSearch: caseSensitiveSearch
    })
    .then(
      function (response) {
        var data = response.getBody();
        event.sender.send('getUserListResult', {data: data});
      },
      function (err) {
        event.sender.send('getUserListResult', 'Error in retrieving user list. Full error: ' + JSON.stringify(err));
      }
    );
  },

}