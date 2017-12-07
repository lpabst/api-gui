import React, { Component } from 'react';


class AuthenticateResults extends Component {
  

  render() {
    return (
        <table style={{margin: '0 auto'}}>
          <tbody>
            <tr>
              <td>Auth Token:</td>
              <td>{this.props.token}</td>
            </tr>
          </tbody>
        </table>
    );
  }
}


export default AuthenticateResults;