import React, { Component } from 'react';


class GetOptOutsResults extends Component {

  render() {
    return (
      <table style={{margin: '0 auto'}}>
        <tbody>
          {
            this.props.optOutList.map( (item, i) => {
              return  <tr key={i} >
                        <td> { i } </td>
                        <td> EmailListId: { item.EmailListId } </td>
                        <td> RequestedDate: { item.RequestedDate } </td>
                        <td> OptOutType: { item.OptOutType } </td>
                        <td> OptOutEmail: { item.OptOutEmail } </td>
                        <td> Description: { item.Description } </td>
                      </tr>
            })
          }
        </tbody>
      </table>
    );
  }
}


export default GetOptOutsResults;