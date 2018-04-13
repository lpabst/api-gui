import React, { Component } from 'react';
import axios from 'axios';
import './CaseManagement.css';

//Loading Gif
import LoadingGif from './../Common/LoadingGif.js';

//Redux
import {connect} from 'react-redux';
import {updateReduxState} from './../../ducks/reducer.js';

// import server from the backend for "API" calls
import {ipcRenderer, remote} from 'electron';

// console.logs the messages, makes sure it's a string, then adds it to the app's console as well
import log from './../../utils/log.js';

class CaseManagement extends Component {

  constructor(props){
    super(props);
    
    this.state = {
      formToShow: 'authenticate',
      baseURL: {
        'US': 'https://caseapi.allegiancetech.com/CaseManagement.svc',
        'EMEA/DE': 'https://caseapi.mcxplatform.de/CaseManagement.svc',
        'AUS': 'https://caseapi.mcxplatform.com.au/CaseManagement.svc'
      },
      caseId: '',
      surveyId: 1,
      filterXml: '',
      authResult: {
        token: '-',
        userId: '-',
        hasActionPlanFeature: '-',
        hasCaseManagementFeature: '-',
        programsHaveGoals: '-',
        currentUserNotificationMode: ' ',
        activeCompanyName: '-'
      },
      token: '',
      notifactionLegend: {
        0: 'No Notification',
        1: 'New Case Status',
        2: 'New Messages',
        3: 'Both New Case Status and New Message',
      },
      searchTerm: '',
      caseSensitiveSearch: 'No',
      userList: [{}],
      totalSearchCount: 0,
      showLoadingGif: false
    }

    this.ipcRenderer = ipcRenderer;
    this.remote = remote;

    this.changeForm = this.changeForm.bind(this);
    this.updateState = this.updateState.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.getCaseView = this.getCaseView.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.getUserList = this.getUserList.bind(this);
  }
  
  componentDidMount(){
    window.scrollTo(0, 0);
    this.mounted = true;
    
    // if we have already authenticated during this session, grab the auth token from window
    if (window.caseAuthToken){
      this.setState({token: window.surveyAuthToken});
    }

    //This sets the event listeners for the respones from the back end
    this.ipcRenderer.on('authenticateUserResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping authenticateUserResult result function'); 
        return;
      }

      this.setLoading(false);
      if (!res.data || !res.data.AuthenticateResult){
        log(res);
        return alert('Error, no Auth token came back. Please check your spelling')
      }
      log(res);
      this.setState({
        authResult: res.data.AuthenticateResult,
        token: res.data.AuthenticateResult.token
      })

      window.caseAuthToken = res.data.AuthenticateResult;
    })
    
    this.ipcRenderer.on('getCaseViewResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping getCaseViewResult result function'); 
        return;
      }
      
      this.setLoading(false);
      log(res);
    })

    this.ipcRenderer.on('getMessagesResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping getMessagesResult result function'); 
        return;
      }
      
      this.setLoading(false);
      log(res);
    })
    
    this.ipcRenderer.on('getUserListResult', (event, res) => {
      if (!this.mounted) {
        log('Response Data Component Not Mounted, stopping getUserListResult result function'); 
        return;
      }
      
      this.setLoading(false);
      log(res);
      if (!res.data || !res.data.GetUserListResult || res.data.GetUserListResult.statusMessage.match(/Error/)){
        return alert('Error occurred. Please check you are logged in and passing the correct auth token!')
      }else if (res.data.GetUserListResult.totalSearchCount == '0'){
        return alert('Zero users returned for that search. Try adjusting the search term or turning off case sensitivity');
      }else{
        this.setState({
          totalSearchCount: res.data.GetUserListResult.totalSearchCount,
          userList: res.data.GetUserListResult.userAccount
        })
      }
    })

  }

  componentWillUnmount(){
    this.mounted = false;
    this.ipcRenderer.removeAllListeners('authenticateUserResult');
    this.ipcRenderer.removeAllListeners('getCaseViewResult');
    this.ipcRenderer.removeAllListeners('getMessagesResult');
    this.ipcRenderer.removeAllListeners('getUserListResult');
  }

  changeForm(newVal){
    this.setState({
      formToShow: newVal
    })
  }

  updateState(e, key){
    var newState = Object.assign({}, this.state);
    newState[key] = e.target.value;
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
    let {company, username, password} = this.props;

    // pre-request error handling
    if (!company || !username || !password){
      return alert('A valid username, password, and company name are required for this call.');
    }

    log('Authenticating User for case mgt');

    // allows user to type shortcut company name and leave off the .allegiancetech.com
    if (!company.match(/\./)){
      company += '.allegiancetech.com';
    }
    // allows user to type shortcut email if they are a maritzcx employee
    if (!username.match(/@/)){
      username += '@maritzcx.com';
    }
    
    // this is all of the info we will need for the authenticate API call
    let authenticateConfig = {
      "url": `${baseURL}/authenticate`,
      "userName": username,
      "password": password,
      "companyName": company
    }    

    // puts the loading gif on the screen
    this.setLoading(true);

    this.ipcRenderer.send(`/api/authenticate`, authenticateConfig);
  }

  getCaseView(e){
    e.preventDefault();

    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);

    this.ipcRenderer.send(`/api/getCaseView`, {
      "url": `${baseURL}/getCaseView`,
      "token": this.state.token,
      "caseId": parseInt(this.state.caseId, 10)
    })
  }

  getMessages(e){
    e.preventDefault();

    var baseURL = this.state.baseURL[this.props.server];
    this.setLoading(true);

    this.ipcRenderer.send(`/api/getMessages`, {
      "url": `${baseURL}/getMessages`,
      "token": this.state.token,
      "caseId": parseInt(this.state.caseId, 10)
    })
  }

  getUserList(e){
    e.preventDefault();

    var baseURL = this.state.baseURL[this.props.server];
    let caseSensitiveSearch = (this.state.caseSensitiveSearch === 'Yes') ? true : false
    this.setLoading(true);

    this.ipcRenderer.send(`/api/getUserList`, {
      "url": `${baseURL}/getUserList`,
      "token": this.state.token,
      "searchTerm": this.state.searchTerm,
      "caseSensitiveSearch": caseSensitiveSearch
    })
  }

  render() {
    
    let formToShow = null;
    let imgToShow = null;
    let resultsToShow = null;

    if (this.state.formToShow === 'authenticate'){
        formToShow = <form className='login' onSubmit={this.authenticateUser} >
                      <p>Username/Email:</p>
                      <input placeholder='username' value={this.props.username} onChange={(e) => this.props.updateReduxState(e.target.value, 'username')} />
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
                    </form>
        imgToShow = null;
        resultsToShow = <table style={{margin: '0 auto'}}>
                          <tbody>
                            <tr>
                              <td> Company Name: </td>
                              <td> {this.state.authResult.activeCompanyName} </td>
                            </tr>
                            <tr>
                              <td> Company Has Case Management: </td>
                              <td> {this.state.authResult.hasCaseManagementFeature.toString()} </td>
                            </tr>
                            <tr>
                              <td> Company Has Action Plan Feature: </td>
                              <td> {this.state.authResult.hasActionPlanFeature.toString()} </td>
                            </tr>
                            <tr>
                              <td> Programs Have Goals: </td>
                              <td> {this.state.authResult.programsHaveGoals.toString()} </td>
                            </tr>
                            <tr>
                              <td> Auth Token: </td>
                              <td> {this.state.authResult.token} </td>
                            </tr>
                            <tr>
                              <td> userId: </td>
                              <td> {this.state.authResult.userId} </td>
                            </tr>
                            <tr>
                              <td> Current User Notification Mode: </td>
                              <td> {this.state.authResult.currentUserNotificationMode}- {this.state.notifactionLegend[this.state.authResult.currentUserNotificationMode]} </td>
                            </tr>
                          </tbody>
                        </table>
    }else if (this.state.formToShow === 'getCaseView'){
      formToShow =  <form className='get_survey_list' onSubmit={this.getCaseView} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getSurveyList</h4>
                      <p>Token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <p>Case ID:</p>
                      <input placeholder='Case ID' value={this.state.caseId} onChange={(e) => this.updateState(e, 'caseId')} />
                      <button className='submit_btn' onClick={this.getCaseView}>Submit</button>
                    </form>
      imgToShow = null;
      resultsToShow = null;
    }else if (this.state.formToShow === 'getMessages'){
      formToShow =  <form className='get_survey_list' onSubmit={this.getMessages} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getSurveyList</h4>
                      <p>Token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <p>Case ID:</p>
                      <input placeholder='Case ID' value={this.state.caseId} onChange={(e) => this.updateState(e, 'caseId')} />
                      <button className='submit_btn' onClick={this.getMessages}>Submit</button>
                    </form>
      imgToShow = null;
      resultsToShow = null;
    }else if (this.state.formToShow === 'getUserList'){
      formToShow =  <form className='get_survey_list' onSubmit={this.getUserList} >
                      <h4 style={{width: '100%', textAlign: 'center'}}>getSurveyList</h4>
                      <p>Token:</p>
                      <input placeholder='token' value={this.state.token} onChange={(e) => this.updateState(e, 'token')} />
                      <p>What do you want to search for?</p>
                      <input placeholder='first name, last name, or partial (ex: Ada)' value={this.state.searchTerm} onChange={(e) => this.updateState(e, 'searchTerm')} />
                      <p>Search Case Sensitive?</p>
                      <select onChange={ (e) => this.updateState(e, 'caseSensitiveSearch') } value={this.state.caseSensitiveSearch} >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                      <button className='submit_btn' onClick={this.getUserList}>Submit</button>
                    </form>
      imgToShow = null;
      resultsToShow = <table style={{margin: '0 auto'}}>
                        <tbody>
                          <tr>
                            <td>{this.state.totalSearchCount} results</td>
                            <td>Name</td>
                            <td>Username</td>
                            <td>User Id</td>
                          </tr>
                          {
                            this.state.userList.map( (item, i) => {
                              return  <tr key={i}>
                                        <td>{i+1}</td>
                                        <td>{item.FullName}</td>
                                        <td>{item.UserName}</td>
                                        <td>{item.UserId}</td>
                                      </tr>
                            })
                          }
                        </tbody>
                      </table>
    }


    return (
      <div className="case_management">
        
        <div className='case_management_top'>
          <ul className='sidenav'>
            <li onClick={ () => this.changeForm('authenticate') }>Authenticate (Start Here)</li>
            <li onClick={ () => this.changeForm('getUserList') }>getUserList</li>
          </ul>
      
          <a rel='noopener noreferrer' href='https://developer.maritzcx.com/api/#cat-4' target='_blank' id='header_docs_link'>See The Docs</a>
          <h2>Case Management API</h2>

          { formToShow }

        </div>

        <div className='response_data_results'>

          <h3>Results</h3>

          { imgToShow }

          <div className='results'>

            { resultsToShow }
              
          </div>

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

export default connect(mapStateToProps, {updateReduxState})(CaseManagement);