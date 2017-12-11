import React, { Component } from 'react';


class SendInvitationForNewRecipients extends Component {

  constructor(props){
    super(props);
    this.state = {
      ShowPrePopList: false,
      email1: '',
      email2: '',
      email3: '',
      email4: '',
      tag1: '',
      tag2: '',
      tag3: '',
      prepopValue1: '',
      prepopValue2: '',
      prepopValue3: ''
    }

    this.updateShowPrePopList = this.updateShowPrePopList.bind(this);
    this.updateLocalState = this.updateLocalState.bind(this);
    this.updateRecipients = this.updateRecipients.bind(this);
    this.updatePrepopData = this.updatePrepopData.bind(this);
  }
  
  updateShowPrePopList(e, newVal){
    //Forces user to add recipients before adding prepop data
    // if (!this.state.ShowPrePopList && !this.props.recipients.length){
    //   return alert('No email recipients are listed. Please add recipients first');
    // }
    //switches view between emails and prepop data
    this.setState({
      ShowPrePopList: newVal
    })
  }

  updateLocalState(newVal, target){
    let newState = Object.assign({}, this.state);
    newState[target] = newVal;
    this.setState(newState);
  }

  updateRecipients(){
    let arr = [];
    //this creates our recipients array based on email1-email4 on this.state
    for (var i = 1; i <= 4; i ++){
      if (this.state['email' + i]){
        let email = this.state['email' + i];
        //check for valid email format
        if (!email.match(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/)){
          this.updateLocalState('', 'email'+i);
          return alert('Error, email address #' + i + ' is not a valid email address format.')
        }
        let firstName = '';
        if (email.split('@')[0].match(/./)){
          firstName = email.split('@')[0].split('.')[0];
        }else{
          firstName = 'Hello';
        }
        arr.push({
          "EmailAddress": email,
          "FirstName": firstName,
          "Language": "English"
        })
      }
    }
    //this.props.updateState is expecting a value from e.target.value
    let e = {
      target: {
        value: arr
      }
    }
    this.props.updateState(e, 'recipients');
  }

  updatePrepopData(e, key, index){
    let val = e.target.value;
    let arr = this.props.prepopData.slice();
    if (!arr[index]){
      arr[index] = {};
    }
    arr[index][key] = val;
    e = {
      target: {
        value: arr
      }
    }
    this.props.updateState(e, 'prepopData');
  }

  render() {

    let ShowPrePopList = this.state.ShowPrePopList ?
      <div className='prepop_list'>
        <div>
          <p title='This is the question tag listed in the platform *Note: this is case sensitive.'>Question Tag</p>
          <input className='prepop_input' value={this.state.tag1} onBlur={ (e)=> this.updatePrepopData(e, 'QuestionTag', 0) } onChange={ (e) => this.updateLocalState(e.target.value, 'tag1' )} placeholder='question tag 1' />
          <input className='prepop_input' value={this.state.tag2} onBlur={ (e)=> this.updatePrepopData(e, 'QuestionTag', 1) } onChange={ (e) => this.updateLocalState(e.target.value, 'tag2' )} placeholder='question tag 2' />
          <input className='prepop_input' value={this.state.tag3} onBlur={ (e)=> this.updatePrepopData(e, 'QuestionTag', 2) } onChange={ (e) => this.updateLocalState(e.target.value, 'tag3' )} placeholder='question tag 3' />
        </div>
        <div>
          <p title='Whatever you put here will be passed as pre-pop data'>Value</p>
          <input className='prepop_input' value={this.state.prepopValue1} onBlur={ (e)=> this.updatePrepopData(e, 'Value', 0) } onChange={ (e) => this.updateLocalState(e.target.value, 'prepopValue1' )} placeholder='prepop value' />
          <input className='prepop_input' value={this.state.prepopValue2} onBlur={ (e)=> this.updatePrepopData(e, 'Value', 1) } onChange={ (e) => this.updateLocalState(e.target.value, 'prepopValue2' )} placeholder='prepop value' />
          <input className='prepop_input' value={this.state.prepopValue3} onBlur={ (e)=> this.updatePrepopData(e, 'Value', 2) } onChange={ (e) => this.updateLocalState(e.target.value, 'prepopValue3' )} placeholder='prepop value' />
        </div>
      </div>
    : <div>
        <input placeholder='email address 1' className='email_input' value={this.state.email1} onChange={ (e) => this.updateLocalState(e.target.value, 'email1') } onBlur={ this.updateRecipients } />
        <input placeholder='email address 2' className='email_input' value={this.state.email2} onChange={ (e) => this.updateLocalState(e.target.value, 'email2') } onBlur={ this.updateRecipients } />
        <input placeholder='email address 3' className='email_input' value={this.state.email3} onChange={ (e) => this.updateLocalState(e.target.value, 'email3') } onBlur={ this.updateRecipients } />
        <input placeholder='email address 4' className='email_input' value={this.state.email4} onChange={ (e) => this.updateLocalState(e.target.value, 'email4') } onBlur={ this.updateRecipients } />
      </div>

    return (
      <form className='get_survey_list' onSubmit={this.props.sendInvitationForNewRecipients} >
        <h4 style={{width: '100%', textAlign: 'center'}}>SendInvitationForNewRecipients</h4>
        <p>token:</p>
        <input placeholder='token' value={this.props.token} onChange={(e) => this.props.updateState(e, 'token')} />
        <p>surveyId:</p>
        <input placeholder='surveyId' type='number' value={this.props.surveyId} onChange={(e) => this.props.updateState(e, 'surveyId')} />
        <p>recipients:</p>
        <div className='recipients_selectors'>
          <div onClick={ (e) => this.updateShowPrePopList(e, false)} title='List up to 4 emails addresses.'>List emails</div>
          <div onClick={ (e) => this.updateShowPrePopList(e, true)} title='List up to 3 prepop fields. All email recipients will get the same prepop data.'>Prepop Data (optional)</div>
        </div>
        { ShowPrePopList }
        <p>de-duplication rule (If the same email shows up multiple times in the list):</p>
        <select value={this.props.deDupeRule} onChange={(e) => this.props.updateState(e, 'deDupeRule')} >
          <option>Import first occurence, ignore later occurences</option>
          <option>Import last occurence, ignore earlier occurrences</option>
          <option>Import all occurrences of an email address</option>
        </select>
        <p>Error Handling Rule: (If there are any errors in the pre-pop data in the list we send across)</p>
        <select value={this.props.errorHandlingRule} onChange={(e) => this.props.updateState(e, 'errorHandlingRule')} >
          <option>Still send to recipient, but leave out fields with errors</option>
          <option>Don't send to recipients that have any errors</option>
          <option>Don't send to anyone if there are any errors</option>
        </select>
        <button className='submit_btn' onClick={this.props.sendInvitationForNewRecipients}>Submit</button>
      </form>
    );
  }
}


export default SendInvitationForNewRecipients;