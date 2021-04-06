import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk'
import App from './components/App';
import reducers from './reducers';
import Welcome from './components/Welcome';
import Account from './components/Account';
import Signup from './components/auth/Signup'
import Signin from './components/auth/Signin'
import Signout from './components/auth/Signout'
import ForgetPassword from './components/auth/ForgetPassword'
import ResetPassword from './components/auth/ResetPassword'

const store = createStore(reducers,{
	auth: { authenticated: localStorage.getItem('token') }
}, applyMiddleware(reduxThunk))

ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
			<App >
				<Route path="/" exact component={Welcome} />
				<Route path="/signup" component={Signup} />
				<Route path="/signin" component={Signin} />
				<Route path="/signout" component={Signout} />
				<Route path="/forgot" component={ForgetPassword} />
				<Route path="/reset/:email" component={ResetPassword} />
				<Route path="/account" component={Account} /> 
			</App >
		</BrowserRouter>
	</Provider>,
	document.querySelector('#root')
)

