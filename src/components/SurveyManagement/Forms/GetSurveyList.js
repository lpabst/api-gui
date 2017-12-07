import React, { Component } from 'react';


class GetSurveyList extends Component {

  render() {
    return (
      <form className='get_survey_list' onSubmit={this.props.getSurveyList} >
        <h4 style={{width: '100%', textAlign: 'center'}}>getSurveyList</h4>
        <p>Token:</p>
        <input placeholder='token' value={this.props.token} onChange={(e) => this.props.updateState(e, 'token')} />
        <button className='submit_btn' onClick={this.props.getSurveyList}>Submit</button>
      </form>
    );
  }
}


export default GetSurveyList;