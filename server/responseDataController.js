// var app = require('./index.js');
var requestify = require('requestify');

module.exports = {

  getQuestionsBySurveyId:  (event, arg) => {
    console.log('getting survey questions')
    let { url, token, surveyId, filterXml } = arg;
    requestify.post(url, {
      token: token,
      surveyId: surveyId,
      filterXml: filterXml
    })
    .then(function(response){
        var data = response.getBody();
        console.log(data)
        event.sender.send('getQuestionsBySurveyIdResult', {data: data});
    },
      function(err){
        console.log(err);
        event.sender.send('getQuestionsBySurveyIdResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token.');
      }
    );
  },

  getAnswersBySurveyId:  (event, arg) => {
    console.log('getting survey answers')
    let { url, token, surveyId, filterXml } = arg;
    requestify.post(url, {
      token: token,
      surveyId: surveyId,
      filterXml: filterXml
    })
    .then(function(response){
        var data = response.getBody();
        console.log(data)
        event.sender.send('getAnswersBySurveyIdResult', {data: data});
    },
      function(err){
        console.log(err);
        event.sender.send('getAnswersBySurveyIdResult', 'Error occurred. Please check that you are authenticated for the correct company and passing the correct authentication token.');
      }
    );
  },

  getResponsesBySurveyId:  (event, arg) => {
    console.log('getting survey responses')
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
        console.log(data)
        event.sender.send('getResponsesBySurveyIdResult', {data: data});
      },
      //error function
      function(err){
        console.log(err);
        event.sender.send('getResponsesBySurveyIdResult', 'Error occurred. Please check that you are authenticated and also note that large requests might cause an error as well.');
      }
    );
  }
  
};
