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
      showClearConsole: false,
      consoleMessage: '',
    }

    this.toggleShowConsole = this.toggleShowConsole.bind(this);
    this.toggleClearConsole = this.toggleClearConsole.bind(this);
    this.resetConsoleContent = this.resetConsoleContent.bind(this);
  }

  componentDidMount(){
    document.getElementById('response-data').click();
    window.consoleContent = 'Console Messages Will Appear Here';
  }

  scrollUp(){
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  toggleShowConsole(){
    let consoleMessage = '';
    if (window.consoleContent.length > 300000){
      consoleMessage = 'Consider clearing the console for faster load times';
    }

    this.setState({
      consoleOpen: !this.state.consoleOpen,
      consoleMessage: consoleMessage
    })
  }

  toggleClearConsole(){
    this.setState({
      showClearConsole: !this.state.showClearConsole
    })
  }

  resetConsoleContent(){
    window.consoleContent = 'Console Messages Will Appear Here';
    window.consoleUpdated = false;
    this.toggleClearConsole();
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

        <div className='consoleToggle' onClick={() => this.toggleShowConsole()} > 
          Console
        </div>

        { this.state.consoleOpen &&
          <div className='console'>
            <div className='consoleCloseX' onClick={() => this.setState({consoleOpen: false})} > X </div>
            <p className='consoleHeader' >Console Messages</p>
            <textarea id='consoleContent' value={window.consoleContent} readOnly={true}></textarea>
            <button className='clearConsoleBtn' onClick={this.toggleClearConsole} title='Clear the console when it gets too much content and slows down' >Clear App Console</button>
            { this.state.showClearConsole && 
              <span>
                Are You Sure?
                <button onClick={this.resetConsoleContent}>Yes</button>
                <button onClick={this.toggleClearConsole}>No</button>
              </span>
            }
            <p className='consoleMessage'>{this.state.consoleMessage}</p>
          </div>
        }
        

      </div>
    );
  }
}


export default App;
