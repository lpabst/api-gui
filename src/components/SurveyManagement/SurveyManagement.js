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
import emailListImg from './../../media/questionsHelp.png';

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
const {ipcRenderer, remote} = require('electron');  
const server = remote.require("./main.js");

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
  }
  
  changeForm(newForm){
    this.setState({
      formToShow: newForm
    })
  }

  updateState(e, key){
    var newState = Object.assign({}, this.state);
    console.log(newState);
    console.log(e.target.value);
    newState[key] = e.target.value;
    console.log(newState);
    this.setState(newState);
  }

  setLoading(newVal){
    this.setState({
      showLoadingGif: newVal
    })
  }

  authenticateUser(e){
    e.preventDefault();
    console.log('authenticating user');
    var baseURL = this.state.baseURL[this.props.server];
    console.log(this.props);
    this.setLoading(true);

    axios.post(`/api/authenticate`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/authenticate`,
      "userName": this.props.username,
      "password": this.props.password,
      "companyName": this.props.company
    })
    .then(res => {
      this.setLoading(false);
      if (!res.data.AuthenticateResult){
        console.log(res);
        return alert('Error, no Auth token came back. Please check your spelling')
      }
      if (res.data.AuthenticateResult.match(/00000000/)){
        console.log(res);
        alert('Authentication failed. Double check your username, password, and that the company you are trying to access exists on the platform you have selected.')
      }
      console.log(res)
      this.setState({
        token: res.data.AuthenticateResult
      })
    })
    .catch( err => {
      this.setLoading(false);
      return alert(err + '. Server is down.')
    });
  }
  
  getSurveyList(e){
    e.preventDefault();
    console.log('GetSurveyList sent')
    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);

    axios.post(`/api/getSurveyList`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getSurveyList`,
      "token": this.state.token
    })
    .then(res => {
      this.setLoading(false);
      console.log(res)
      if (!res.data.GetSurveyListResult){
        return alert(res.data);
      }
      this.setState({
        surveyList: res.data.GetSurveyListResult
      })
    })
    .catch( err => {
      this.setLoading(false);
      return alert(err + '. Server is down.')
    });
  }

  getOptOuts(e){
    e.preventDefault();
    console.log('getOptOuts sent')
    var baseURL = this.state.baseURL[this.props.server];

    //This ensures that if the user checks opt outs for the site/domain, no surveyId is passed
    let surveyId = this.state.sOptOutType === 'Survey' ? this.state.surveyId : null

    //Pre-error handling
    if (this.state.sOptOutType === 'Survey' && (!this.state.surveyId || Number(this.state.surveyId) <= 0)){
      return alert('If sOptOut type is set to "Survey", a valid surveyId must be provided.')
    }
    
    this.setLoading(true);
    axios.post(`/api/getOptOuts`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/GetOptOuts`,
      "token": this.state.token,
      "sOptOutType": this.state.sOptOutType,
      "filterXml": this.state.filterXml,
      "surveyId": surveyId
    })
    .then(res => {
      this.setLoading(false);
      console.log(res)
      //Error handling
      if (!res.data.GetOptOutsResult){
        if (res.data.GetOptOutsResult === ''){
          return alert('An empty response was returned, meaning there are no opt outs for this query.');
        }else{
          return alert(res.data);
        }
      } 
      if (res.data.GetOptOutsResult.match(/Error:/)){
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
      console.log(arr);
      this.setState({
        optOutList: arr
      })
    })
    .catch( err => {
      this.setLoading(false);
      return alert(err + '. Server is down.')
    });
  }

  sendInvitationForNewRecipients(e){
    e.preventDefault();
    var baseURL = this.state.baseURL[this.props.server];
    
    //pre-error handling
    if (this.state.recipients.length < 1){
      return alert('No email addresses were entered. Please enter an email address.');
    }
    for (let i = 0; i < this.state.prepopData.length; i++){
      if (this.state.prepopData[i].ScaleId && !this.state.prepopData[i].Value){
        return alert('Prepop #' + (i+1) + ' has a question tag listed, but no value. Please include a value or delete this question tag.');
      }
      if (!this.state.prepopData[i].ScaleId && this.state.prepopData[i].Value){
        return alert('Prepop #' + (i+1) + ' has a value listed, but no question tag. Please include a question tag or delete this value.');
      }
    }
    
    //Set loading screen and send axios call to get question scale ids
    console.log('Getting Question Scale IDs...')
    this.setLoading(true);
    axios.post('/api/getQuestionsBySurveyId', {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getQuestionsBySurveyId`,
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "filterXml": this.state.filterXml
    })
    .then( res => {
      //Error Handling
      if (!res.data.GetQuestionsBySurveyIdResult){
        console.log(res);
        this.setLoading(false);
        return alert(res.data);
      }
      if (res.data.GetQuestionsBySurveyIdResult.match(/Error:/)){
        console.log(res);
        this.setLoading(false);
        return alert(res.data.GetQuestionsBySurveyIdResult);
      }

      //update prepop array to have Scale IDs instead of question tags
      let arr = res.data.GetQuestionsBySurveyIdResult.split('<Question>');
      arr.shift();
      let prepop = this.state.prepopData.slice();
      for (let i = 0; i < prepop.length; i++){
            for (let k = 0; k < arr.length; k++){
              let questionId = arr[k].match(/<QuestionId>/) ? arr[k].split('<QuestionId>')[1].split('</QuestionId>')[0] : 'None';
              let questionShortCode = arr[k].match(/<QuestionShortCode>/) ? arr[k].split('<QuestionShortCode>')[1].split('</QuestionShortCode>')[0] : 'None';
              if (questionShortCode == prepop[i].ScaleId){
                prepop[i].ScaleId = questionId;
              }
            }
      }

      //Error handling checks if any question tag's weren't able to convert to Scale ID
      for (let i = 0; i < prepop.length; i++){
        if (Number(prepop[i].ScaleId) != prepop[i].ScaleId){
          this.setLoading(false);
          return alert('Unable to find a question in the survey with the question tag listed in prepop #' + (i+1) + ' (failed to send). **Note: The question tag listed here is case sensitive, double check your spelling and capitalizations.');
        }
      }

      //Add prepop data to email invites
      let recipients = this.state.recipients.slice();
      for (var i = 0; i < recipients.length; i++){
        recipients[i].PrepopData = this.state.prepopData;
      }
      
      //now that we have the scale Id's, send the invites out
      console.log('Sending Invites to new recipients')
      console.log(recipients);
      axios.post(`/api/sendInvitationForNewRecipients`, {
        "url": `${baseURL}/EmailImport.HttpService.svc/web/sendInvitationForNewRecipients`,
        "token": this.state.token,
        "surveyId": this.state.surveyId,
        "recipients": recipients,
        "sampleDeDuplicationRule": this.state.deDupeLegend[this.state.deDupeRule],
        "sampleErrorHandlingRule": this.state.errorHandlingLegend[this.state.errorHandlingRule]
      })
      .then( res => {
        console.log(res);
        this.setLoading(false);
        //Error handling
        if (res.data.message){
          return alert(res.data.message);
        }
        let result = JSON.parse(res.data.SendInvitationForNewRecipientsResult);
        if (result.Errors.length){
          return alert('Error in sending the invite. Common causes: 1. Please make sure you are authenticated 2. Please make sure that this survey has an invite already built in the platform that it can send 3. Only one API call can be made per minute to send invites')
        }else{
          return alert('Success!')
        }
      })
      .catch( err => {
        this.setLoading(false);
        return alert(err + '. Server is down.')
      });
    })
    .catch( err => {
      this.setLoading(false);
      return alert(err + '. Server is down.')
    })
  }

  getEmailListsBySurveyId(e){
    e.preventDefault();
    console.log('Getting email list for survey# ' + this.state.surveyId);
    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);

    axios.post(`/api/getEmailListsBySurveyId`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getEmailListsBySurveyId`,
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "filterXml": this.state.filterXml
    })
    .then( res => {
      console.log(res);
      this.setLoading(false);
      if (res.data.GetEmailListsBySurveyIdResult.match('Error:')){
        console.log(res);
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
      console.log(arr);
      this.setState({
        emailList: arr
      })
    })
    .catch( err => {
      this.setLoading(false);
      return alert(err + '. Server is down.')
    });
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


              <a rel='noopener noreferrer' href='https://developer.maritzcx.com/api/#cat-2' target='_blank' id='header_docs_link'>See The Docs</a>
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