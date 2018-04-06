import React, { Component } from 'react';
import log from './../../../utils/log.js';

class GetEmailListBySurveyIdResults extends Component {
  
  componentDidMount(){
    log('emillist result')
    log(this.props.emailList)
  }

  render() {
    return (
      <table style={{margin: '0 auto'}}>
        <tbody>
          {
            this.props.emailList.map ( (item, i) => {
              return  <tr key={i}>
                        <td>SurveyId: { item.SurveyId }</td>
                        <td>Email List ID: { item.EmailListId }</td>
                        <td>Description: { item.Description }</td>
                        <td>UploadedOn: { item.UploadedOn }</td>
                        <td>InvitedOn: { item.InvitedOn }</td>
                        <td>IsRolling: { item.IsRolling }</td>
                      </tr>
            })
          }
        </tbody>
      </table>
    );
  }
}


export default GetEmailListBySurveyIdResults;