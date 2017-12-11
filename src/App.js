import React, { Component } from 'react';
import router from './router';
import { Link } from 'react-router-dom';
import './reset.css';
import './App.css';


class App extends Component {

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

      </div>
    );
  }
}


export default App;



// import './App.css';
// import React, { Component } from 'react';

// class App extends React.Component {
//   render() {
//     return (
//       <div>
//         <h1>Hello, Electron!</h1>
//         <p>I hope you enjoy using basic-electron-react-boilerplate to start your dev off right!</p>
//         <p>Hello World again with routes!</p>
//       </div>
//     );
//   }
// }

// export default App;
