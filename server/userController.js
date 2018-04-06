var requestify = require('requestify');

module.exports = {

    authenticateUser: (event, arg) => {
        let { url, userName, password, companyName } = arg;
        requestify.post(url, {
            userName: userName,
            password: password,
            companyName: companyName
        })
        .then(
            function(response){
                var data = response.getBody();
                event.sender.send('authenticateUserResult', {data: data});
            },
            function(err){
                event.sender.send('authenticateUserResult', 'Error occurred. Please check username and password and try again. Error: ' + JSON.stringify(err));
            }
        );
    },

    getSurveyList: (event, arg) => {
        let { url, token } = arg;
        requestify.post(url, {
            token: token
        })
        .then(
        function(response){
            var data = response.getBody();
            event.sender.send('getSurveyListResult', {data: data});
        },
        function(err){
            event.sender.send('getSurveyListResult', 'Error occurred: ' + JSON.stringify(err));
            }
        );
    }

}