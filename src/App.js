import React, { Component } from 'react';
import router from './router';
import { Link } from 'react-router-dom';
import './reset.css';
import './App.css';


class App extends Component {
  constructor(props){
    super(props);
    this.state={
      consoleOpen: false,
    }
  }

  componentDidMount(){
    document.getElementById('response-data').click();
  }

  scrollUp(){
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  render() {
    return (
      <div className="App">

        <div className='desktop_header'>
          <img src='https://www.maritzcx.com/wp-content/themes/allegiance/images/logo.svg' className='header_logo' alt='header logo' onClick={this.scrollUp} />
          <ul>
            <Link to='/response-data' id='response-data'>Response Data</Link>
            <Link to='/survey-management'>Survey Management</Link>
            <Link to='/case-management'>Case Management</Link>
          </ul>
        </div>

        { router }

        <div className='consoleToggle' onClick={() => this.setState({consoleOpen: !this.state.consoleOpen})} > 
          Console
        </div>

        { this.state.consoleOpen && 
          <div className='console'>
            <div className='consoleCloseX' onClick={() => this.setState({consoleOpen: false})} > X </div>
            <p className='consoleHeader' >Console Messages</p>
            <textarea id='consoleContent' value='Console Messages Will Appear Here'></textarea>
          </div>
        }

      </div>
    );
  }
}


export default App;
