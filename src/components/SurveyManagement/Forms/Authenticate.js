import React, { Component } from 'react';

//Redux
import {connect} from 'react-redux'
import {updateReduxState} from './../../../ducks/reducer.js'

class Authenticate extends Component {

  render() {
    return (
        <form className='login' onSubmit={this.props.authenticateUser} >
          <h4 style={{width: '100%', textAlign: 'center'}}>Authenticate</h4>
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
          <button className='submit_btn' onClick={this.props.authenticateUser}>Submit</button>
        </form>
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

export default connect(mapStateToProps, {updateReduxState})(Authenticate);
