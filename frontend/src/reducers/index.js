import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import auth from './auth'
import create from './create'

import  messages from './messages'
import  customer from './customer'

export default combineReducers({
	auth,
	create, 
  	form: formReducer,
	customer,
	messages
});
