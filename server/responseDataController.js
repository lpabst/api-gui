// var app = require('./index.js');
var requestify = require('requestify');

module.exports = {

  getQuestionsBySurveyId:  (event, arg) => {
    let { url, token, surveyId, filterXml } = arg;

    requestify.post(url, {
      token: token,
      surveyId: surveyId,
      filterXml: filterXml
    })
    .then(function(response){
        var data = response.getBody();
        event.sender.send('getQuestionsBySurveyIdResult', {data: data});
    },
      function(err){
        event.sender.send('getQuestionsBySurveyIdResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token. Full error: ' + JSON.stringify(err));
      }
    );
  },

  getAnswersBySurveyId:  (event, arg) => {
    let { url, token, surveyId, filterXml } = arg;

    requestify.post(url, {
      token: token,
      surveyId: surveyId,
      filterXml: filterXml
    })
    .then(function(response){
        var data = response.getBody();
        event.sender.send('getAnswersBySurveyIdResult', {data: data});
    },
      function(err){
        event.sender.send('getAnswersBySurveyIdResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token. Full error: ' + JSON.stringify(err));
      }
    );
  },

  getResponsesBySurveyId:  (event, arg) => {
    let { url, token, surveyId, filterXml } = arg;

    requestify.post(url, {
      token: token,
      surveyId: surveyId,
      filterXml: filterXml
    })
    .then(
      //success function
      function(response){
        var data = response.getBody();
        event.sender.send('getResponsesBySurveyIdResult', {data: data});
      },
      //error function
      function(err){
        event.sender.send('getResponsesBySurveyIdResult', 'Error occurred. Please check that you are authenticated and also note that large requests might cause an error as well. Full error: ' + JSON.stringify(err));
      }
    );
  }
  
};
