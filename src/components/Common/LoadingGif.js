import React, { Component } from 'react';
import loadingGif from './../../media/loading.gif';
import './LoadingGif.css';

class LoadingGif extends Component {

  render() {
    return (
      <section className='loading_modal'>
       <img src={loadingGif} alt='Loading gif' className='loading_gif' />
      </section>
    );
  }

}


export default LoadingGif;