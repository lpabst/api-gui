import React, { Component } from 'react';
import axios from 'axios';
import './ResponseData.css';
import questionsHelp from './../../media/questionsHelp.png';
import answersHelp from './../../media/answersHelp.png';
import responsesHelp from './../../media/responsesHelp.png';

//Loading Gif
import LoadingGif from './../Common/LoadingGif.js';

//Redux
import {connect} from 'react-redux';
import {updateReduxState} from './../../ducks/reducer.js';

// import server from the backend for "API" calls
import {ipcRenderer, remote} from 'electron';

// console.logs the messages, makes sure it's a string, then adds it to the app's console as well
import log from './../../utils/log.js';

class ResponseData extends Component {

  constructor(props){
    super(props);
    this.state = {
      formToShow: 'authenticate',
      xmlBoxToShow: 'raw',
      xmlDateFilter: 'CompletedDate',
      xmlBeginDate: '',
      xmlEndDate: '',
      xmlIdFilter: 'RespondentId',
      xmlIdFilterId: '',
      baseURL: {
        'US': 'https://sampleapi.allegiancetech.com',
        'EMEA/DE': 'https://sampleapi.mcxplatform.de',
        'AUS': 'https://sampleapi.mcxplatform.com.au'
      },
      token: 'No token received. Please send Authenticate API call first.',
      surveyId: 1,
      filterXml: '',
      surveyList: [],
      listOfQuestionsBySurveyId: [],
      listOfAnswersBySurveyId: [],
      listOfResponsesBySurveyId: [],
      showLoadingGif: false
    }

    this.ipcRenderer = ipcRenderer;
    this.remote = remote;

    this.changeForm = this.changeForm.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateXMLBoxToShow = this.updateXMLBoxToShow.bind(this);
    this.updateXML = this.updateXML.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.getSurveyList = this.getSurveyList.bind(this);
    this.getQuestionsBySurveyId = this.getQuestionsBySurveyId.bind(this);
    this.getAnswersBySurveyId = this.getAnswersBySurveyId.bind(this);
    this.getResponsesBySurveyId = this.getResponsesBySurveyId.bind(this);
  }
  
  componentDidMount(){
    window.scrollTo(0, 0);
    this.mounted = true;
    document.getElementById('username').focus();
    
    // if we have already authenticated during this session, grab the auth token from window
    if (window.surveyAuthToken){
      this.setState({ token: window.surveyAuthToken });
    }

    // if we already have a survey List on window, get it
    if (window.surveyList){
      this.setState({ surveyList: window.surveyList });
    }
    
    //This sets the event listeners for responses from the back end
    this.ipcRenderer.on('authenticateUserResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping authenticateUserResult result function'); 
        return;
      }

      this.setLoading(false);
      log(res);

      if (!res.data || !res.data.AuthenticateResult){
        return alert('Error, no Auth token came back. Please check your spelling')
      }
      if (res.data.AuthenticateResult.match(/00000000/)){
        alert('Authentication failed. Double check your username, password, and that the company you are trying to access exists on the platform you have selected.')
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
        log('Response Data Component Not Mounted, stopping getSurveyListResult result function'); 
        return;
      }

      this.setLoading(false);
      log(res);
      
      if (!res.data || !res.data.GetSurveyListResult){
        return alert(JSON.stringify(res));
      }
      this.setState({
        surveyList: res.data.GetSurveyListResult
      })

      window.surveyList = res.data.GetSurveyListResult;
    })
    
    this.ipcRenderer.on('getQuestionsBySurveyIdResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping getQuestionsBySurveyIdResult result function'); 
        return;
      }

      this.setLoading(false);
      if (!res.data || !res.data.GetQuestionsBySurveyIdResult){
        log(res);
        return alert(res.data);
      }
      if (res.data.GetQuestionsBySurveyIdResult.match(/Error:/)){
        log(res);
        return alert(res.data.GetQuestionsBySurveyIdResult);
      }
      let arr = res.data.GetQuestionsBySurveyIdResult.split('<Question>');
      arr.shift();
      log(arr);
      if (arr.length < 1){
        return alert('No questions/results returned for this query. Double check that your survey ID is correct.');
      }
      if (arr.length > 10000){
        alert('The query returned ' + arr.length + ' responses, but this page will only display the first 10000. Please use the filterXML box to refine your search, or check the console for the full list of responses.')
        arr =  arr.slice(0,10000);
      }
      for (var i = 0; i < arr.length; i++){
        let item = {};
        item.questionId = arr[i].match(/<QuestionId>/) ? arr[i].split('<QuestionId>')[1].split('</QuestionId>')[0] : 'None';
        item.questionText = arr[i].match(/<QuestionText>/) ? arr[i].split('<QuestionText>')[1].split('</QuestionText>')[0] : 'None';
        item.questionShortCode = arr[i].match(/<QuestionShortCode>/) ? arr[i].split('<QuestionShortCode>')[1].split('</QuestionShortCode>')[0] : 'None';
        item.questionAlias = arr[i].match(/<QuestionAlias>/) ? arr[i].split('<QuestionAlias>')[1].split('</QuestionAlias>')[0] : 'None';
        item.questionType = arr[i].match(/<QuestionType>/) ? arr[i].split('<QuestionType>')[1].split('</QuestionType>')[0] : 'None';
        item.questionStatus = arr[i].match(/<QuestionStatus>/) ? arr[i].split('<QuestionStatus>')[1].split('</QuestionStatus>')[0] : 'None';
        item.extendedType = arr[i].match(/<ExtendedType>/) ? arr[i].split('<ExtendedType>')[1].split('</ExtendedType>')[0] : 'None';
        arr[i] = item;
      }
      this.setState({
        listOfQuestionsBySurveyId: arr
      })
    })

    this.ipcRenderer.on('getAnswersBySurveyIdResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping getAnswersBySurveyIdResult result function'); 
        return;
      }

      this.setLoading(false);
      if (!res.data || !res.data.GetAnswersBySurveyIdResult){
        log(res);
        return alert(res.data);
      }
      if (res.data.GetAnswersBySurveyIdResult.match(/Error:/)){
        log(res);
        return alert(res.data.GetAnswersBySurveyIdResult);
      }
      let arr = res.data.GetAnswersBySurveyIdResult.split('<Answer>');
      arr.shift();
      log(arr);
      if (arr.length < 1){
        return alert('No answers/results returned for this query. Double check that your survey ID is correct.')
      }
      if (arr.length > 10000){
        alert('The query returned ' + arr.length + ' responses, but this page will only display the first 10000. Please use the filterXML box to refine your search, or check the console for the full list of responses.')
        arr =  arr.slice(0,10000);
      }
      for (var i = 0; i < arr.length; i++){
        let item = {};
        item.answerId = arr[i].match(/<AnswerId>/) ? arr[i].split('<AnswerId>')[1].split('</AnswerId>')[0] : 'None';
        item.scaleId = arr[i].match(/<ScaleId>/) ? arr[i].split('<ScaleId>')[1].split('</ScaleId>')[0] : 'None';
        item.questionId = arr[i].match(/<QuestionId>/) ? arr[i].split('<QuestionId>')[1].split('</QuestionId>')[0] : 'None';
        item.answerText = arr[i].match(/<AnswerText>/) ? arr[i].split('<AnswerText>')[1].split('</AnswerText>')[0] : 'None';
        item.answerDataType = arr[i].match(/<AnswerDataType>/) ? arr[i].split('<AnswerDataType>')[1].split('</AnswerDataType>')[0] : 'None';
        item.answerWeight = arr[i].match(/<AnswerWeight>/) ? arr[i].split('<AnswerWeight>')[1].split('</AnswerWeight>')[0] : 'None';
        arr[i] = item;
      }
      log(arr);
      this.setState({
        listOfAnswersBySurveyId: arr
      })
    })
    
    this.ipcRenderer.on('getResponsesBySurveyIdResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping getResponsesBySurveyIdResult result function'); 
        return;
      }

      this.setLoading(false);
      log(res);
      //alerts user of errors
      if (typeof res.data === 'string'){
        if (res.data.match(/Error/)){
          return alert(res.data);
        }
      }else{
        if (res.data.GetResponsesBySurveyIdResult.match(/Error/)){
          if (res.data.GetResponsesBySurveyIdResult.match(/XML/)){
            return alert(res.data.GetResponsesBySurveyIdResult + ' Check the filterXML for errors.');
          }else{
            return alert(res.data.GetResponsesBySurveyIdResult + ' Check the server/company that you are trying to access.');
          }
        }
      }

      let arr = res.data.GetResponsesBySurveyIdResult.split('<Response>');
      arr.shift();

      //Truncates results to max of 10000 displayed to avoid long wait times while the GUI parses the data into a table
      if (arr.length > 10000){
        alert('The API returned ' + arr.length + ' responses, but this page will only show the first 10000');
        arr = arr.slice(0,10000);
      }

      //alerts user when no responses come back
      if (arr.length < 1){
        alert('No responses returned for this query');
      }
      
      for (var i = 0; i < arr.length; i++){
        let item = {};
        item.responseId = arr[i].match(/<ResponseId>/) ? arr[i].split('<ResponseId>')[1].split('</ResponseId>')[0] : 'None';
        item.surveyId = arr[i].match(/<SurveyId>/) ? arr[i].split('<SurveyId>')[1].split('</SurveyId>')[0] : 'None';
        item.respondentId = arr[i].match(/<RespondentId>/) ? arr[i].split('<RespondentId>')[1].split('</RespondentId>')[0] : 'None';
        item.questionId = arr[i].match(/<QuestionId>/) ? arr[i].split('<QuestionId>')[1].split('</QuestionId>')[0] : 'None';
        item.scaleId = arr[i].match(/<ScaleId>/) ? arr[i].split('<ScaleId>')[1].split('</ScaleId>')[0] : 'None';
        item.answerId = arr[i].match(/<AnswerId>/) ? arr[i].split('<AnswerId>')[1].split('</AnswerId>')[0] : 'None';
        item.responseText = arr[i].match(/<ResponseText>/) ? arr[i].split('<ResponseText>')[1].split('</ResponseText>')[0] : 'None';
        item.responseMemo = arr[i].match(/<ResponseMemo>/) ? arr[i].split('<ResponseMemo>')[1].split('</ResponseMemo>')[0] : 'None';
        item.responseRank = arr[i].match(/<ResponseRank>/) ? arr[i].split('<ResponseRank>')[1].split('</ResponseRank>')[0] : 'None';
        item.responseState = arr[i].match(/<ResponseState>/) ? arr[i].split('<ResponseState>')[1].split('</ResponseState>')[0] : 'None';
        item.responseDate = arr[i].match(/<ResponseDate>/) ? arr[i].split('<ResponseDate>')[1].split('</ResponseDate>')[0] : 'None';
        // item.languageId = arr[i].match(/<LanguageId>/) ? arr[i].split('<LanguageId>')[1].split('</LanguageId>')[0] : 'None';
        item.responseNum = arr[i].match(/<ResponseNum>/) ? arr[i].split('<ResponseNum>')[1].split('</ResponseNum>')[0] : 'None';
        item.completedDate = arr[i].match(/<CompletedDate>/) ? arr[i].split('<CompletedDate>')[1].split('</CompletedDate>')[0].substring(0, 10) : 'None';
        arr[i] = item;
      }
      log(arr);
      this.setState({
        listOfResponsesBySurveyId: arr
      })
    })
  }

  componentWillUnmount(){
    this.mounted = false;
    this.ipcRenderer.removeAllListeners('authenticateUserResult');
    this.ipcRenderer.removeAllListeners('getSurveyListResult');
    this.ipcRenderer.removeAllListeners('getQuestionsBySurveyIdResult');
    this.ipcRenderer.removeAllListeners('getAnswersBySurveyIdResult');
    this.ipcRenderer.removeAllListeners('getResponsesBySurveyIdResult');
  }

  changeForm(newForm){
    this.setState({
      formToShow: newForm
    })
  }

  updateState(e, key, func){
    var newState = Object.assign({}, this.state);
    newState[key] = e.target.value;
    this.setState(newState);
    if (func){
      func();
    }
  }

  updateXMLBoxToShow(newVal){
    if (newVal == 'raw'){
      this.updateXML();
    }
    this.setState({
      xmlBoxToShow: newVal
    })
  }

  updateXML(callback){
    log('updating XML');
    var {xmlBeginDate, xmlEndDate, xmlDateFilter, xmlIdFilter, xmlIdFilterId, xmlBoxToShow} = this.state;

    //make sure we have a beginning and end date instead of just one
    if (xmlBeginDate && !xmlEndDate){
        xmlEndDate = xmlBeginDate
        this.setState({
          xmlEndDate: xmlBeginDate
        })
    }else if(xmlEndDate && !xmlBeginDate){
        xmlBeginDate = xmlEndDate
        this.setState({
          xmlBeginDate: xmlEndDate
        })
    }

    //Build filterXML
    let dateFilter, idFilter;
    if (xmlBeginDate || xmlEndDate){
      dateFilter = `<FilterCriteria><FilterColumn>${xmlDateFilter}</FilterColumn><FilterOperator>Between</FilterOperator><FilterValue>${xmlBeginDate}T00:00:01Z</FilterValue><FilterValue>${xmlEndDate}T23:59:59Z</FilterValue></FilterCriteria>`;
    }else{
      dateFilter = '';
    }
    if (xmlIdFilterId){
      idFilter = `<FilterCriteria><FilterColumn>${xmlIdFilter}</FilterColumn><FilterOperator>Equals</FilterOperator><FilterValue>${xmlIdFilterId}</FilterValue></FilterCriteria>`;
    }else{
      idFilter = '';
    }

    let filterXml;
    if (dateFilter || idFilter){
      filterXml = `<FilterDefinition><FilterGroup GroupOperator='AND'>${dateFilter}${idFilter}</FilterGroup></FilterDefinition>`;
    }else{
      filterXml = '';
    }
    log(filterXml);
    this.setState({
      filterXml: filterXml,
      xmlBoxToShow: 'raw'
    }, callback)
  }

  setLoading(newVal){
    this.setState({
      showLoadingGif: newVal
    })
  }

  authenticateUser(e){
    e.preventDefault();
    var baseURL = this.state.baseURL[this.props.server];
    let {company, username, password} = this.props;

    // pre-request error handling
    if (!company || !username || !password){
      return alert('A valid username, password, and company name are required for this call.');
    }

    log('Authenticating User for response data');

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
      "url": `${baseURL}/EmailImport.HttpService.svc/web/authenticate`,
      "userName": username,
      "password": password,
      "companyName": company
    }

    // removes the user's password, then logs the config so we can check it in case of errors, 
    // then sends the API request to the back end along with the config
    log(JSON.stringify(authenticateConfig).replace(/"password":(.*)?\,/, '"password":"*******",'));
    this.ipcRenderer.send('/api/authenticate', authenticateConfig);
  }

  getSurveyList(e){
    e.preventDefault();
    log('GetSurveyList sent for response data');
    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);

    this.ipcRenderer.send(`/api/getSurveyList`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getSurveyList`,
      "token": this.state.token
    })
  }

  getQuestionsBySurveyId(e){
    e.preventDefault();
    log('getQuestionsBySurveyId sent');
    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);

    this.ipcRenderer.send(`/api/getQuestionsBySurveyId`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getQuestionsBySurveyId`,
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "filterXml": this.state.filterXml
    })
  }

  getAnswersBySurveyId(e){
    e.preventDefault();
    log('getAnswersBySurveyId sent');
    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);
    
    this.ipcRenderer.send(`/api/getAnswersBySurveyId`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getAnswersBySurveyId`,
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "filterXml": this.state.filterXml
    })
  }

  getResponsesBySurveyId(e){
    if (e){
      e.preventDefault();
    }
    if (this.state.xmlBoxToShow == 'easy'){
      return this.updateXML(this.getResponsesBySurveyId);
    }
    log('getResponsesBySurveyId sent');
    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);
    
    this.ipcRenderer.send(`/api/getResponsesBySurveyId`, {
      "url": `${baseURL}/EmailImport.HttpService.svc/web/getResponsesBySurveyId`,
      "token": this.state.token,
      "surveyId": this.state.surveyId,
      "filterXml": this.state.filterXml
    })
  }

  render() {

    let formToShow, imgToShow, resultsToShow, inputPlaceholder;
    inputPlaceholder = this.state.xmlIdFilter == 'RespondentId' ? 'Respondent ID here' : 'Comma separated list of Question IDs here';

    if (this.state.formToShow === 'authenticate'){
      formToShow =  <form className='login' onSubmit={this.authenticateUser} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>authenticate</h4>
                      <p>Username/Email:</p>
                      <input placeholder='username' value={this.props.username} onChange={(e) => this.props.updateReduxState(e.target.value, 'username')} id='username' />
                      <p>Password:</p>
                      <input placeholder='password' value={this.props.password} onChange={(e) => this.props.updateReduxState(e.target.value, 'password')} type='password' />
                      <p>Company URL: (ex: company.allegiancetech.com)</p>
                      <input placeholder='company' value={this.props.company} onChange={(e) => this.props.updateReduxState(e.target.value, 'company')} />
                      <p>Platform Server</p>
                      <select onChange={(e) => this.props.updateReduxState(e.target.value, 'server')} value={this.props.server}>
                        <option>US</option>
                        <option>EMEA/DE</option>
                        <option>AUS</option>
                      </select>
                      <button className='submit_btn' onClick={this.authenticateUser}>Submit</button>
                    </form>;
      imgToShow = null;
      resultsToShow = <table style={{margin: '0 auto'}}>
                        <tbody>
                          <tr>
                            <td>token:</td>
                            <td>{this.state.token}</td>
                          </tr>
                        </tbody>
                      </table>
    }else if(this.state.formToShow === 'getSurveyList'){
      formToShow =  <form className='get_survey_list' onSubmit={this.getSurveyList} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getSurveyList</h4>
                      <p>Token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <button className='submit_btn' onClick={this.getSurveyList}>Submit</button>
                    </form>
      imgToShow = null;
      resultsToShow = <table style={{margin: '0 auto'}}>
                        <tbody>
                          {
                            this.state.surveyList.map( (item, i) => {
                              return  <tr key={i}>
                                        <td> <p>Survey Id: {item.SurveyId}</p> </td>
                                        <td> <p>Survey Code: {item.SurveyCode}</p> </td>
                                        <td> <p>Title: {item.Description}</p> </td>
                                        <td> <p>Created Date: {item.CreatedDate.substring(0, 10)}</p> </td>
                                        <td> <p>Owner: {item.OwnerFirstName} {item.OwnerLastName}</p> </td>
                                      </tr>
                            })
                          }
                        </tbody>
                      </table>
    }else if(this.state.formToShow === 'getQuestionsBySurveyId'){
      formToShow =  <form className='get_questions_byid' onSubmit={this.getSurveyList} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getQuestionsBySurveyId</h4>
                      <p>token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <p>surveyId:</p>
                      <input placeholder='surveyId' type='number' value={this.state.surveyId} onChange={(e) => this.updateState(e, 'surveyId')} />
                      <p>filterXml:</p>
                      <textarea placeholder='filterXml (Optional)' value={this.state.filterXml} onChange={(e) => this.updateState(e, 'filterXml')} />
                      <button className='submit_btn' onClick={this.getQuestionsBySurveyId}>Submit</button>
                    </form>
      imgToShow = <img src={questionsHelp} alt='Screenshot from API docs' style={{marginBottom: '20px'}} />
      resultsToShow = <table style={{margin: '0 auto'}}>
                        <tbody>
                          {
                            this.state.listOfQuestionsBySurveyId.map( (item, i) => {
                              log(item);
                              return  <tr key={i}>
                                        <td style={{width: '30px'}}>{i+1}</td>
                                        <td style={{width: '130px'}}> <p>QuestionId: {item.questionId}</p> </td>
                                        <td> <p>QuestionText: {item.questionText}</p> </td>
                                        <td> <p>QuestionShortCode: {item.questionShortCode}</p> </td>
                                        <td style={{width: '160px'}}> <p>QuestionAlias: {item.questionAlias}</p> </td>
                                        <td style={{width: '160px'}}> <p>QuestionType: {item.questionType}</p> </td>
                                        <td style={{width: '140px'}}> <p>QuestionStatus: {item.questionStatus}</p> </td>
                                        <td style={{width: '130px'}}> <p>ExtendedType: {item.extendedType}</p> </td>
                                      </tr>
                            })
                          }
                        </tbody>
                      </table>
    }else if(this.state.formToShow === 'getAnswersBySurveyId'){
      formToShow =  <form className='get_questions_byid' onSubmit={this.getSurveyList} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getAnswersBySurveyId</h4>
                      <p>token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <p>surveyId:</p>
                      <input placeholder='surveyId' type='number' value={this.state.surveyId} onChange={(e) => this.updateState(e, 'surveyId')} />
                      <p>filterXml:</p>
                      <textarea placeholder='filterXml (Optional)' value={this.state.filterXml} onChange={(e) => this.updateState(e, 'filterXml')} />
                      <button className='submit_btn' onClick={this.getAnswersBySurveyId}>Submit</button>
                    </form>
      imgToShow = <img src={answersHelp} alt='Screenshot from API docs' style={{marginBottom: '20px'}} />
      resultsToShow = <table style={{margin: '0 auto'}}>
                        <tbody>
                          {
                            this.state.listOfAnswersBySurveyId.map( (item, i) => {
                              return  <tr key={i}>
                                        <td style={{width: '30px'}}>{i+1}</td>
                                        <td style={{width: '120px'}}> <p>AnswerId: {item.answerId}</p> </td>
                                        <td> <p>ScaleId: {item.scaleId}</p> </td>
                                        <td> <p>QuestionId: {item.questionId}</p> </td>
                                        <td> <p>AnswerText: {item.answerText}</p> </td>
                                        <td> <p>AnswerDataType: {item.answerDataType}</p> </td>
                                        <td style={{width: '140px'}}> <p>AnswerWeight: {item.answerWeight}</p> </td>
                                      </tr>
                            })
                          }
                        </tbody>
                      </table>
    }else if(this.state.formToShow === 'getResponsesBySurveyId'){
      formToShow =  <form className='get_questions_byid' onSubmit={this.getSurveyList} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getResponsesBySurveyId</h4>
                      <p>token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <p>surveyId:</p>
                      <input style={{display: 'block'}} placeholder='surveyId' type='number' value={this.state.surveyId} onChange={(e) => this.updateState(e, 'surveyId')} />
                      <p style={{display: 'inline'}}>filterXml:</p>
                      <p className='responsedata_xml_button' onClick={() => this.updateXMLBoxToShow('raw')}>Raw XML</p>
                      <p className='responsedata_xml_button' onClick={() => this.updateXMLBoxToShow('easy')}>Easy XML</p>
                      {
                        this.state.xmlBoxToShow == 'raw' ? 
                          <textarea placeholder='filterXml *Note: although this is optional, it is recommended here to avoid massive responses' value={this.state.filterXml} onChange={(e) => this.updateState(e, 'filterXml')} />
                        : <div className='easy_xml_container'>
                            <select className='easy_xml_select' onChange={(e) => this.updateState(e, 'xmlDateFilter')} value={this.state.xmlDateFilter}>
                              <option>CompletedDate</option>
                              <option>ModifiedDate</option>
                            </select>
                            <input type='date' style={{width: '130px', display: 'inline-block'}} placeholder='begin date' onChange={(e) => this.updateState(e, 'xmlBeginDate')} value={this.state.xmlBeginDate} />
                            <input type='date' style={{width: '130px', display: 'inline-block', marginLeft:'10px'}} placeholder='end date' onChange={(e) => this.updateState(e, 'xmlEndDate')} value={this.state.xmlEndDate} />
                            <select className='easy_xml_select' onChange={(e) => this.updateState(e, 'xmlIdFilter')} value={this.state.xmlIdFilter}>
                              <option>RespondentId</option>
                              <option>QuestionIds</option>
                            </select>
                            <input placeholder={inputPlaceholder} onChange={(e) => this.updateState(e, 'xmlIdFilterId')} value={this.state.xmlIdFilterId} />
                          </div>
                      }
                      <button className='submit_btn' onClick={this.getResponsesBySurveyId}>Submit</button>
                    </form>
      imgToShow = <img src={responsesHelp} alt='Screenshot from API docs' style={{marginBottom: '20px'}} />
      resultsToShow = <table style={{margin: '0 auto'}}>
                        <tbody>
                          {
                            this.state.listOfResponsesBySurveyId.map( (item, i) => {
                              return  <tr key={i}>
                                        <td style={{width: '30px'}}>{i+1}</td>
                                        <td> <p>CompletedDate: {item.completedDate}</p> </td>
                                        <td> <p>ResponseId: {item.responseId}</p> </td>
                                        <td> <p>RespondentId: {item.respondentId}</p> </td>
                                        <td> <p>QuestionId: {item.questionId}</p> </td>
                                        <td> <p>ScaleId: {item.scaleId}</p> </td>
                                        <td> <p>AnswerId: {item.answerId}</p> </td>
                                        <td> <p>ResponseRank: {item.responseRank}</p> </td>
                                        <td> <p>ResponseState: {item.responseState}</p> </td>
                                        <td> <p>ResponseDate: {item.responseDate}</p> </td>
                                        <td> <p>ResponseNum: {item.responseNum}</p> </td>
                                        <td> <p>ResponseText: {item.responseText}</p> </td>
                                        <td> <p>ResponseMemo: {item.responseMemo}</p> </td>
                                      </tr> 
                            })
                          }
                        </tbody>
                      </table>
    }

    let loadingGif = this.state.showLoadingGif ? <LoadingGif /> : null;

    return (
      <section className='response_data'>
        <div className="response_data_top">
        
          <ul className='sidenav'>
            <li onClick={ () => this.changeForm('authenticate') }>Authenticate (Start Here)</li>
            <li onClick={ () => this.changeForm('getSurveyList') }>getSurveyList</li>
            <li onClick={ () => this.changeForm('getQuestionsBySurveyId') }>getQuestionsBySurveyId</li>
            <li onClick={ () => this.changeForm('getAnswersBySurveyId') }>getAnswersBySurveyId</li>
            <li onClick={ () => this.changeForm('getResponsesBySurveyId') }>getResponsesBySurveyId</li>
          </ul>

          <a rel='noopener noreferrer' href='https://developer.maritzcx.com/api/#cat-3' target='_blank' id='header_docs_link'>See The Docs</a>
          <h2>Response Data API</h2>

          { formToShow }

        </div>

        <div className='response_data_results'>

          <h3>Results</h3>

          { imgToShow }

          <ul className='results'>
            { resultsToShow }
          </ul>

        </div>

        { loadingGif }
      </section>
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

export default connect(mapStateToProps, {updateReduxState})(ResponseData);