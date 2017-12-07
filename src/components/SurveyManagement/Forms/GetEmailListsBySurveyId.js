import React, { Component } from 'react';


class GetEmailListsBySurveyId extends Component {

  constructor(props){
    super(props);
    this.state = {

    }
  }
  


  render() {
    return (
      <form className='get_questions_byid' onSubmit={this.props.getEmailListsBySurveyId} >
        <h4 style={{width: '100%', textAlign: 'center'}}>GetEmailListsBySurveyId</h4>
        <p>token:</p>
        <input placeholder='token' value={this.props.token} onChange={(e) => this.props.updateState(e, 'token')} />
        <p>surveyId:</p>
        <input placeholder='surveyId' type='number' value={this.state.surveyId} onChange={(e) => this.props.updateState(e, 'surveyId')} />
        <p>filterXml:</p>
        <textarea placeholder='filterXml (optional)' value={this.props.filterXml} onChange={(e) => this.props.updateState(e, 'filterXml')} />
        <button className='submit_btn' onClick={this.getEmailListsBySurveyId}>Submit</button>
      </form>
    );
  }
}


export default GetEmailListsBySurveyId;