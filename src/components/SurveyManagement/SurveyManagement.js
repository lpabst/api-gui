import React, { Component } from 'react';
import axios from 'axios';
import './SurveyManagement.css';

// Form Components
import Authenticate from './Forms/Authenticate.js';
import GetSurveyList from './Forms/GetSurveyList.js';
import SendInvitationForNewRecipients from './Forms/SendInvitationForNewRecipients.js';
import GetEmailListsBySurveyId from './Forms/GetEmailListsBySurveyId.js';
import GetOptOuts from './Forms/GetOptOuts.js';

//Images for results
import emailListImg from './../../media/email_list_img.png';

//Results Components
import AuthenticateResults from './Results/AuthenticateResults.js';
import GetSurveyListResults from './Results/GetSurveyListResults.js';
import SendInvitationForNewRecipientsResults from './Results/SendInvitationForNewRecipientsResults.js';
import GetEmailListsBySurveyIdResults from './Results/GetEmailListsBySurveyIdResults.js';
import GetOptOutsResults from './Results/GetOptOutsResults.js';

//Loading Gif
import LoadingGif from './../Common/LoadingGif.js';

//Redux
import {connect} from 'react-redux';
import {updateReduxState} from './../../ducks/reducer.js';

// import server from the backend for "API" calls
import {ipcRenderer, remote} from 'electron';
import { prependOnceListener } from 'cluster';

// console.logs the messages, makes sure it's a string, then adds it to the app's console as well
import log from './../../utils/log.js';
import { request } from 'https';

class SurveyManagement extends Component {

  constructor(props){
    super(props);
    this.state = {
      formToShow: 'authenticate',
      baseURL: {
        'US': 'https://sampleapi.allegiancetech.com',
        'EMEA/DE': 'https://sampleapi.mcxplatform.de',
        'AUS': 'https://sampleapi.mcxplatform.com.au'
      },
      token: 'No token received. Please send Authenticate API call first.',
      surveyId: 1,
      sOptOutType: 'Survey',
      filterXml: '',
      recipients: [],
      prepopData: [{}],
      deDupeRule: 'Import first occurence, ignore later occurences',
      deDupeLegend:{
        'Import first occurence, ignore later occurences': 0,
        'Import last occurence, ignore earlier occurrences': 1,
        'Import all occurrences of an email address': 2
      },
      errorHandlingRule: 'Still send to recipient, but leave out fields with errors',
      errorHandlingLegend:{
        'Still send to recipient, but leave out fields with errors': 0,
        'Don\'t send to recipients that have any errors': 1,
        'Don\'t send to anyone if there are any errors': 2
      },
      surveyList: [{CreatedDate:''}],
      optOutList: [{}],
      emailList: [{}],
      showLoadingGif: false
    }
    
    this.ipcRenderer = ipcRenderer;
    this.remote = remote;

    this.changeForm = this.changeForm.bind(this);
    this.updateState = this.updateState.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.getSurveyList = this.getSurveyList.bind(this);
    this.getOptOuts = this.getOptOuts.bind(this);
    this.sendInvitationForNewRecipients = this.sendInvitationForNewRecipients.bind(this);
    this.getEmailListsBySurveyId = this.getEmailListsBySurveyId.bind(this);
  }

  componentDidMount(){
    window.scrollTo(0, 0);
    this.mounted = true;
    
    // if we have already authenticated during this session, grab the auth token from window
    if (window.surveyAuthToken){
      this.setState({token: window.surveyAuthToken});
    }
    // if we have already retrieved the survey List for this company, put it on state
    if (window.surveyList){
      this.setState({surveyList: window.surveyList});
    }

    //This sets all of the event listeners for the results that come from the back end
    this.ipcRenderer.on('authenticateUserResult', (event, res) => {
      if (!this.mounted) {
        return log('Survey Mgt Component Not Mounted, stopping authenticateUserResult result function'); 
      }

      this.setLoading(false);
      log(res);

      if (!res.data){
        return alert('Unexpected error. Please check the console for more details.');
      }
      if (!res.data.AuthenticateResult){
        return alert('Error, no Auth token came back. Please check your spelling');
      }
      if (res.data.AuthenticateResult.match(/00000000/)){
        alert('Authentication failed. Double check your username, password, and that the company you are trying to access exists on the platform you have selected.');
      }

      this.setState({
        token: res.data.AuthenticateResult
      })

      window.surveyAuthToken = res.data.AuthenticateResult;
      // any time the user re-authenticates, clear out the survey list in case it's a new company they authenticated for
      window.surveyList = null;
    })

    this.ipcRenderer.on('getSurveyListResult', (event, res) => {
      if (!this.mounted) {
        return log('Survey Mgt Component Not Mounted, stopping getSurveyListResult result function'); 
      }

      this.setLoading(false);
      log(res);

      if (!res.data){
        return alert('Unexpected Error, please check the console to see the error');
      }else if (!res.data.GetSurveyListResult){
        return alert(res.data);
      }else{
        this.setState({
          surveyList: res.data.GetSurveyListResult
        })
        // save the surveyList to the window for future component mounts
        window.surveyList = res.data.GetSurveyListResult;
      }
      
    })

    this.ipcRenderer.on('getOptOutsResult', (event, res) => {
      if (!this.mounted) {
        return log('Survey Mgt Component Not Mounted, stopping getOptOutsResult result function');
      }

      this.setLoading(false);
      log(res);

      //Error handling
      if (!res.data){
        return alert('Unexpected Error, please check the console to see the error');
      }else if (!res.data.GetOptOutsResult){
        if (res.data.GetOptOutsResult === ''){
          return alert('An empty response was returned, meaning there are no opt outs for this query.');
        }else{
          return alert(res.data);
        }
      }else if (res.data.GetOptOutsResult.match(/Error:/)){
        return alert(res.data.GetOptOutsResult);
      }
      
      var arr = res.data.GetOptOutsResult.split('<OptOutRecipient>');
      arr.shift();
      for (var i = 0; i < arr.length; i++){
        let item = {};
        item.OptOutEmail = arr[i].match(/<OptOutEmail>/) ? arr[i].split('<OptOutEmail>')[1].split('</OptOutEmail>')[0] : 'None';
        item.OptOutType = arr[i].match(/<OptOutType>/) ? arr[i].split('<OptOutType>')[1].split('</OptOutType>')[0] : 'None';
        item.SurveyId = arr[i].match(/<SurveyId>/) ? arr[i].split('<SurveyId>')[1].split('</SurveyId>')[0] : 'None';
        item.RequestedDate = arr[i].match(/<RequestedDate>/) ? arr[i].split('<RequestedDate>')[1].split('</RequestedDate>')[0] : 'None';
        item.EmailListId = arr[i].match(/<EmailListId>/) ? arr[i].split('<EmailListId>')[1].split('</EmailListId>')[0] : 'None';
        item.Description = arr[i].match(/<Description>/) ? arr[i].split('<Description>')[1].split('</Description>')[0] : 'None';
        arr[i] = item;
      }

      log(arr);
      this.setState({
        optOutList: arr
      })
    })

    this.ipcRenderer.on('sendInvitationForNewRecipientsResult', (event, res) => {
      if (!this.mounted) {
        return log('Survey Mgt Component Not Mounted, stopping sendInvitationForNewRecipientsResult result function');
      }

      log(res);
      this.setLoading(false);

      //Error handling
      if (!res.data || !res.data.SendInvitationForNewRecipientsResult){
        return alert('Unexpected Error, please check the console to see the error');
      }else if (res.data.message){
        return alert(res.data.message);
      }

      let result = JSON.parse(res.data.SendInvitationForNewRecipientsResult);
      if (result && result.Errors && result.Errors.length){
        log(JSON.stringify(result.Errors));
        return alert('Error in sending the invite. Common causes: 1. Please make sure you are authenticated 2. Please make sure that this survey has an invite already built in the platform that it can send 3. Only one API call can be made per minute to send invites. Check the console for more details.')
      }else{
        return alert('Success!')
      }
    })
    
    this.ipcRenderer.on('getEmailListsBySurveyIdResult', (event, res) => {
      if (!this.mounted) {
        return log('Survey Mgt Component Not Mounted, stopping getEmailListsBySurveyIdResult result function');
      }

      log(res);
      this.setLoading(false);

      if (!res.data || !res.data.GetEmailListsBySurveyIdResult){
        return alert('Unexpected error. Please check the console for more details');
      }else if (res.data.GetEmailListsBySurveyIdResult.match('Error:')){
        return alert('Error retrieving the email list. Check the console for more information');
      }

      let arr = res.data.GetEmailListsBySurveyIdResult.split('<EmailListId>');
      arr.shift();
      if (arr.length < 1){
        return alert('Empty response was returned, meaning this survey has no email list(s).');
      }
      for (var i = 0; i < arr.length; i++){
        let item = {};
        item.EmailListId = arr[i].match(/<\/EmailListId>/) ? arr[i].split('</EmailListId>')[0] : 'None';
        item.Description = arr[i].match(/<Description>/) ? arr[i].split('<Description>')[1].split('</Description>')[0] : 'None';
        item.SurveyId = arr[i].match(/<SurveyId>/) ? arr[i].split('<SurveyId>')[1].split('</SurveyId>')[0] : 'None';
        item.UploadedOn = arr[i].match(/<UploadedOn>/) ? arr[i].split('<UploadedOn>')[1].split('</UploadedOn>')[0].substring(0,10) : 'None';
        item.InvitedOn = arr[i].match(/<InvitedOn>/) ? arr[i].split('<InvitedOn>')[1].split('</InvitedOn>')[0].substring(0,10) : 'None';
        item.IsRolling = arr[i].match(/<IsRolling>/) ? arr[i].split('<IsRolling>')[1].split('</IsRolling>')[0] : 'None';
        arr[i] = item;
      }
      
      this.setState({
        emailList: arr
      })
    })
  }

  componentWillUnmount(){
    this.mounted = false;
    this.ipcRenderer.removeAllListeners('authenticateUserResult');
    this.ipcRenderer.removeAllListeners('getSurveyListResult');
    this.ipcRenderer.removeAllListeners('getOptOutsResult');
    this.ipcRenderer.removeAllListeners('sendInvitationForNewRecipientsResult');
    this.ipcRenderer.removeAllListeners('getEmailListsBySurveyIdResult');
  }
  
  changeForm(newForm){
    this.setState({
      formToShow: newForm
    })
  }

  updateState(e, key){
    var newState = Object.assign({}, this.state);
    // log(newState);
    // log(e.target.value);
    newState[key] = e.target.value;
    // log(newState);
    this.setState(newState);
  }

  setLoading(newVal){
    this.setState({
      showLoadingGif: newVal
    })
  }

  authenticateUser(e){
    e.preventDefault();
    
    var baseURL = this.state.baseURL[this.props.server];
    let requestUrl = `${baseURL}/EmailImport.HttpService.svc/web/authenticate`;
    let {company, username, password} = this.props;

    // pre-request error handling
    if (!company || !username || !password){
      return alert('A valid username, password, and company name are required for this call.');
    }

    log('Authenticating User for survey management.');

    // allows user to type 'gi' or 'test' for generalindustries
    if (company === 'gi' || company === 'test'){
      company = 'generalindustries.allegiancetech.com';
    }
    // allows user to type shortcut company name and leave off the .allegiancetech.com
    if (!company.match(/\./)){
      company += '.allegiancetech.com';
    }
    // allows user to type shortcut email if they are a maritzcx employee
    if (!username.match(/@/)){
      username += '@maritzcx.com';
    }

    // puts the loading gif on the screen
    this.setLoading(true);

    // this is all of the info we will need for the authenticate API call
    let authenticateConfig = {
      "userName": username,
      "password": password,
      "companyName": company
    }

    // removes the user's password, then logs the config so we can check it in case of errors, 
    // then sends the API request to the back end along with the config
    log(`POST request to URL: ${requestUrl}\n
    body/payload: ${JSON.stringify(authenticateConfig).replace(/"password":(.*)?\,/, '"password":"*******",')}`);

    authenticateConfig.url = requestUrl;

    this.ipcRenderer.send('/api/authenticate', authenticateConfig);
  }
  
  getSurveyList(e){
    e.preventDefault();
    log('GetSurveyList sent.');

    var baseURL = this.state.baseURL[this.props.server];
    let requestUrl = `${baseURL}/EmailImport.HttpService.svc/web/getSurveyList`;
    this.setLoading(true);

    let requestBody = {
      "token": this.state.token
    };

    log(`POST request to URL: ${requestUrl}\n
    body/paylod:${JSON.stringify(requestBody)}`);

    requestBody.url = requestUrl;

    this.ipcRenderer.send(`/api/getSurveyList`, requestBody);
  }

  getOptOuts(e){
    e.preventDefault();
    log('getOptOuts sent');

    var baseURL = this.state.baseURL[this.props.server];
    let requestUrl = `${baseURL}/EmailImport.HttpService.svc/web/GetOptOuts`;

    //This ensures that if the user checks opt outs for the site/domain, no surveyId is passed
    let surveyId = this.state.sOptOutType === 'Survey' ? this.state.surveyId : null

    //Pre-error handling
    if (this.state.sOptOutType === 'Survey' && (!this.state.surveyId || Number(this.state.surveyId) <= 0)){
      return alert('If sOptOut type is set to "Survey", a valid surveyId must be provided.')
    }

    let requestBody = {
      "token": this.state.token,
      "sOptOutType": this.state.sOptOutType,
      "filterXml": this.state.filterXml,
      "surveyId": surveyId
    };

    log(`POST request to URL: ${requestUrl}\n
    body/payload: ${JSON.stringify(requestBody)}`);

    requestBody.url = requestUrl;
    
    this.setLoading(true);
    this.ipcRenderer.send(`/api/getOptOuts`, requestBody);
  }

  sendInvitationForNewRecipients(e){
    e.preventDefault();

    var baseURL = this.state.baseURL[this.props.server];
    let requestUrl = `${baseURL}/HttpService.svc/web/sendInvitationForNewRecipients`;
    
    //pre-error handling
    if (this.state.recipients.length < 1){
      return alert('No email addresses were entered. Please enter an email address.');
    }
    for (let i = 0; i < this.state.prepopData.length; i++){
      if (this.state.prepopData[i].QuestionTag && !this.state.prepopData[i].Value){
        return alert('Prepop #' + (i+1) + ' has a question tag listed, but no value. Please include a value or delete this question tag.');
      }
      if (!this.state.prepopData[i].QuestionTag && this.state.prepopData[i].Value){
        return alert('Prepop #' + (i+1) + ' has a value listed, but no question tag. Please include a question tag or delete this value.');
      }
    }

    let prepop = this.state.prepopData.slice();

    //Remove prepops that aren't being used
    for (let i = 0; i < prepop.length; i++){
      if (!prepop[i].QuestionTag){
        prepop.splice(i--, 1);
      }
    }

    // Add prepop data to each email in the list
    let recipients = this.state.recipients.slice();
    for (var i = 0; i < recipients.length; i++){
      recipients[i].PrepopData = prepop;
    }

    let sendInvitationConfig = {
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "recipients": recipients,
      "sampleDeDuplicationRule": this.state.deDupeLegend[this.state.deDupeRule],
      "sampleErrorHandlingRule": this.state.errorHandlingLegend[this.state.errorHandlingRule]
    }

    log(`Sending email invitations...\n
    POST request to URL: ${requestUrl}\n
    body/payload: ${JSON.stringify(sendInvitationConfig)}`);

    sendInvitationConfig.url = requestUrl;
    
    this.ipcRenderer.send(`/api/sendInvitationForNewRecipients`, sendInvitationConfig);
  }

  getEmailListsBySurveyId(e){
    e.preventDefault();
    log('Getting email list for survey# ' + this.state.surveyId);

    var baseURL = this.state.baseURL[this.props.server];
    let requestUrl = `${baseURL}/EmailImport.HttpService.svc/web/getEmailListsBySurveyId`;
    this.setLoading(true);

    let requestBody = {
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "filterXml": this.state.filterXml
    }

    log(`POST request to URL: ${requestUrl}\n
    body/payload: ${JSON.stringify(requestBody)}`);

    requestBody.url = requestUrl;

    this.ipcRenderer.send(`/api/getEmailListsBySurveyId`, requestBody);
  }
  
  render() {
    const match = {
      'authenticate': [Authenticate, null, AuthenticateResults],
      'getSurveyList': [GetSurveyList, null, GetSurveyListResults],
      'sendInvitationForNewRecipients': [SendInvitationForNewRecipients, null, SendInvitationForNewRecipientsResults],
      'getEmailListsBySurveyId': [GetEmailListsBySurveyId, emailListImg, GetEmailListsBySurveyIdResults],
      'getOptOuts': [GetOptOuts, null, GetOptOutsResults]
    }
    
    //This dynamically loads whichever form/img/results components are supposed to show
    let ComponentName = match[this.state.formToShow][0];
    let imgToShow = null;
    let ResultsToShow = match[this.state.formToShow][2];

    if (match[this.state.formToShow][1]){
      imgToShow = <img src={match[this.state.formToShow][1]} alt='instructions for results' />;
    }

    return (
      <div className="survey_management">
          <div className="response_data_top">

              <ul className='sidenav'>
                <li onClick={ () => this.changeForm('authenticate') }>Authenticate (Start Here)</li>
                <li onClick={ () => this.changeForm('getSurveyList') }>getSurveyList</li>
                <li onClick={ () => this.changeForm('sendInvitationForNewRecipients') }>sendInvitationForNewRecipients</li>
                <li onClick={ () => this.changeForm('getEmailListsBySurveyId') }>getEmailListsBySurveyId</li>
                <li onClick={ () => this.changeForm('getOptOuts') }>getOptOuts</li>
              </ul>


              <a rel='noopener noreferrer' href='https://developer.maritzcx.com/api' target='_blank' id='header_docs_link'>See The Docs</a>
              <h2>Survey Management API</h2>

              <ComponentName token={this.state.token} surveyId={this.state.surveyId} sOptOutType={this.state.sOptOutType} filterXml={this.state.filterXml} surveyList={this.state.surveyList} deDupeRule={this.state.deDupeRule} errorHandlingRule={this.state.errorHandlingRule} recipients={this.state.recipients} prepopData={this.state.prepopData} updateState={this.updateState} authenticateUser = {this.authenticateUser} getSurveyList={this.getSurveyList} getOptOuts={this.getOptOuts} sendInvitationForNewRecipients={this.sendInvitationForNewRecipients} getEmailListsBySurveyId={this.getEmailListsBySurveyId} />

          </div>

          <div className='response_data_results'>

              <h3>Results</h3>

              { imgToShow }

              <ul className='results'>
                  
                <ResultsToShow token={this.state.token} surveyList={this.state.surveyList} optOutList={this.state.optOutList} emailList={this.state.emailList} invitationScheduleList={this.state.invitationScheduleList} reminderScheduleList={this.state.reminderScheduleList} />
                  
              </ul>

          </div>

          { this.state.showLoadingGif ? <LoadingGif /> : null }

      </div>
    );
  }
}


function mapStateToProps(state){
  return {
    username: state.username,
    password: state.password,
    company: state.company,
    server: state.server,
  }
}

export default connect(mapStateToProps, {updateReduxState})(SurveyManagement);