import React, { Component } from 'react';


class GetOptOuts extends Component {
  
  render() {
    let showSurveyIdBox = this.props.sOptOutType == 'Survey' ? 
      <div>
        <p>surveyId:</p>
        <input placeholder='surveyId' type='number' value={this.props.surveyId} onChange={(e) => this.props.updateState(e, 'surveyId')} />
      </div>
    :
      null;

    return (
      <form className='get_questions_byid' onSubmit={this.props.getOptOuts} >
        <h4 style={{width: '100%', textAlign: 'center'}}>getResponsesBySurveyId</h4>
        <p>token:</p>
        <input placeholder='token' value={this.props.token} onChange={(e) => this.props.updateState(e, 'token')} />
        <p>sOptOutType:</p>
        <select value={this.props.sOptOutType} onChange={(e) => this.props.updateState(e, 'sOptOutType')} >
          <option>Survey</option>
          <option>Site</option>
          <option>Domain</option>
        </select>
        {showSurveyIdBox}
        <p>filterXml:</p>
        <textarea placeholder='filterXml (optional)' value={this.props.filterXml} onChange={(e) => this.props.updateState(e, 'filterXml')} />
        <button className='submit_btn' onClick={this.props.getOptOuts}>Submit</button>
      </form>
    );
  }
}


export default GetOptOuts;