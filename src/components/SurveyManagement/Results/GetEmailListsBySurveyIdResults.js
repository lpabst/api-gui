import React, { Component } from 'react';


class GetEmailListBySurveyIdResults extends Component {
  
  componentDidMount(){
    console.log('emillist result')
    console.log(this.props.emailList)
  }

  render() {
    console.log(this.props.emailList)
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