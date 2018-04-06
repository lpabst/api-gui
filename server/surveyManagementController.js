var requestify = require('requestify');

module.exports = {

  sendInvitationForNewRecipients: (event, arg) => {
        let { url, token, surveyId, recipients, sampleDeDuplicationRule, sampleErrorHandlingRule } = arg;
        
        requestify.post(url, { token, surveyId, recipients, sampleDeDuplicationRule, sampleErrorHandlingRule })
        .then(
          function(response){
            var data = response.getBody();
            event.sender.send('sendInvitationForNewRecipientsResult', {data: data});
          },
          function(err){
            let error = {
              message: 'Error in sending the invite. Please make sure you are authenticated, and that this surveyId has an invite already built in the platform that it can send.',
              error: err
            };
            event.sender.send('sendInvitationForNewRecipientsResult', error);
          }
        );
    },

    getEmailListsBySurveyId: (event, arg) => {
        let { url, token, surveyId, filterXml } = arg;
        
        requestify.post(url, {
          token: token,
          surveyId: surveyId,
          filterXml: filterXml
        })
        .then(function(response){
          var data = response.getBody();
          event.sender.send('getEmailListsBySurveyIdResult', {data: data});
        },
          function(err){
            event.sender.send('getEmailListsBySurveyIdResult', 'Error in retrieving email list. Check the auth token you are passing in. Full error: ' + JSON.stringify(err));
          }
        );
    },

    getOptOuts: (event, arg) => {
      let { url, token, sOptOutType, filterXml, surveyId } = arg;

      requestify.post(url, { token, sOptOutType, filterXml, surveyId })
      .then(
        function(response){
          var data = response.getBody();
          event.sender.send('getOptOutsResult', {data: data});
        },
        function(err){
          event.sender.send('getOptOutsResult', 'Error in retrieving opt out list. Check the auth token you are passing in. Full error: ' + JSON.stringify(err));
        }
      );
    },

}