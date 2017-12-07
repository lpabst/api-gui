// var app = require('./index.js');
var requestify = require('requestify');

module.exports = {

  getCaseView:  (event, arg) => {
    let { url, token, caseId } = arg;
    console.log({ url, token, caseId })
    requestify.post(url, {
      token: token,
      caseId: caseId
    })
    .then(
      function (response) {
        var data = response.getBody();
        console.log(data);
        event.sender.send('getCaseViewResult', {data: data});
        return console.log('done');
      },
      function (err) {
        console.log(err);
        return event.sender.send('getCaseViewResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token.');
      }
    );
  },

  getMessages:  (event, arg) => {
    let { url, token, caseId } = arg;
    console.log({ url, token, caseId })
    requestify.post(url, {
      token: token,
      caseId: caseId
    })
    .then(
      function (response) {
        var data = response.getBody();
        console.log(data);
        return event.sender.send('getMessagesResult', {data: data});
      },
      function (err) {
        console.log(err);
        return event.sender.send('getMessagesResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token.');
      }
    );
  },

  getUserList:  (event, arg) => {
    let { url, token, searchTerm, caseSensitiveSearch } = arg;
    console.log({ url, token, searchTerm, caseSensitiveSearch });
    requestify.post(url, {
      token: token,
      searchTerm: searchTerm,
      caseSensitiveSearch: caseSensitiveSearch
    })
    .then(
      function (response) {
        var data = response.getBody();
        console.log(data);
        return event.sender.send('getUserListResult', {data: data});
      },
      function (err) {
        console.log(err);
        return event.sender.send('getUserListResult', 'Error in retrieving user list');
      }
    );
  },

}