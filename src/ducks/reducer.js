
const initialState = {
  username: '',
  password: '',
  company: '',
  server: 'US',
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'username':
      return Object.assign({}, state, {
        username: action.payload
      })
    case 'password':
    return Object.assign({}, state, {
      password: action.payload
    })
    case 'company':
    return Object.assign({}, state, {
      company: action.payload
    })
    case 'server':
    return Object.assign({}, state, {
      server: action.payload
    })
    default:
      return state;
    }
}


export function updateReduxState(newVal, target){
    return{
      type: target,
      payload: newVal
    } 
}

