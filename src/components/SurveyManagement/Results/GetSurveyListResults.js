import React, { Component } from 'react';


class GetSurveyListResults extends Component {
  

  render() {
    return (
      <table style={{margin: '0 auto'}}>
        <tbody>
          {
            this.props.surveyList.map( (item, i) => {
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
    );
  }
}


export default GetSurveyListResults;