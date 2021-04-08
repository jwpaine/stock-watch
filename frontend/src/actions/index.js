import axios from 'axios'


import {
	AUTH_USER,
	AUTH_ERROR,
	ADD_ERROR,
	CREATE_ERROR,
	AUTH_SUCCESS,
	WAITING_REPLY,
	SET_PASSWORD_FOR_EMAIL,
	MSG_GENERAL
} from './types';

import {
	CognitoUserPool,
	CognitoUserAttribute,
	CognitoUser,
	AuthenticationDetails,
	CognitoRefreshToken,
	AmazonCognitoIdentity,
	InitiateAuth
} from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk'

var poolData = {
	UserPoolId: 'us-east-1_3MRFwgqlq', // Your user pool id here
	ClientId: '4p0gpcn5jpv5nctrqtjoj32g3k' // Your client id here
};

var cognitoUserr;

//let api_url = 'http://localhost'
let api_url = 'https://api.sparkystocks.com'   

export const signup = (formProps, callback) => async dispatch => {

	console.log(formProps)
	dispatch({
		type: AUTH_ERROR,
		payload: ""
	})

	if (!formProps.email) {
		dispatch({
			type: AUTH_ERROR,
			payload: "Please enter email"
		})
		return
	}

	if (!formProps.password) {
		dispatch({
			type: AUTH_ERROR,
			payload: "Please enter password"
		})
		return
	}

	let email = formProps.email.toLowerCase()
	let password = formProps.password
	var userPool = new CognitoUserPool(poolData);
	var attributeList = [];

	userPool.signUp(email, password, attributeList, null, function (err, result) {
		if (err) {
			if (JSON.stringify(err.message).indexOf('failed to satisfy constraint') != -1) {
				dispatch({
					type: AUTH_ERROR,
					payload: 'Password does not meet minimum requirements'
				})
				return
			}
			if (JSON.stringify(err.message).indexOf('email already exists') != -1) {
				dispatch({
					type: AUTH_ERROR,
					payload: err.message
				})
				return
			}

			dispatch({
				type: AUTH_ERROR,
				payload: err.message
			})
		}
		dispatch({
			type: AUTH_SUCCESS,
			payload: result
		})
	});
};

export const resetPassword = (formProps, callback) => async dispatch => {
	console.log(`resetting password for account: ${JSON.stringify(formProps)}`)
	if (!formProps.email) {
		dispatch({
			type: AUTH_ERROR,
			payload: 'Please enter email'
		})
		return
	}

	var userPool = new CognitoUserPool(poolData);
	var userData = {
		Username: formProps.email.toLowerCase(),
		Pool: userPool
	};
	var cognitoUser = new CognitoUser(userData);

	cognitoUser.forgotPassword({
		onSuccess: function (result) {
			dispatch({
				type: SET_PASSWORD_FOR_EMAIL,
				payload: formProps.email.toLowerCase()
			})
			callback()
		},
		onFailure: function (err) {
			if (err.name == "UserNotFoundException") {
				dispatch({
					type: AUTH_ERROR,
					payload: "No such Email"
				})
			} else {
				dispatch({
					type: AUTH_ERROR,
					payload: "An error occurred. Please try again"
				})
			}
		}
	})
}

export const verifyCode = (formProps, callback) => async dispatch => {
	console.log(`verifying code: ${JSON.stringify(formProps)}`)

	if (!formProps.code) {
		dispatch({
			type: AUTH_ERROR,
			payload: 'Please enter code'
		})
		return
	}
	var userPool = new CognitoUserPool(poolData);
	var userData = {
		Username: formProps.email.toLowerCase(),
		Pool: userPool
	};
	var cognitoUser = new CognitoUser(userData);

	cognitoUser.confirmPassword(formProps.code, formProps.password, {
		onSuccess: function (result) {
			console.log('success')
			dispatch({
				type: MSG_GENERAL,
				payload: `Password Reset for ${formProps.email.toLowerCase()}`
			})
			callback()
		},
		onFailure: function (err) {
			if (err.name == "CodeMismatchException") {
				dispatch({
					type: AUTH_ERROR,
					payload: "Invalid Code. Please try again."
				})
			} else {
				dispatch({
					type: AUTH_ERROR,
					payload: "An error occurred. Please try again"
				})
			}

			dispatch({
				type: SET_PASSWORD_FOR_EMAIL,
				payload: ''
			})

		}

	});

}

export const signin = (formProps, callback) => async dispatch => {

	if (!formProps.email || !formProps.password) {
		dispatch({
			type: AUTH_ERROR,
			payload: 'Please enter email and password'
		})
		return
	}

	dispatch({
		type: WAITING_REPLY
	})
	dispatch({
		type: MSG_GENERAL,
		payload: ''
	})

	var authenticationData = {
		Email: formProps.email.toLowerCase(),
		Password: formProps.password,
	};
	var authenticationDetails = new AuthenticationDetails(authenticationData);
	var userPool = new CognitoUserPool(poolData);
	var userData = {
		Username: formProps.email.toLowerCase(),
		Pool: userPool
	};
	var cognitoUser = new CognitoUser(userData);
	cognitoUser.authenticateUser(authenticationDetails, {
		onSuccess: function (result) {
			console.log('You are now logged in.');
			/* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer*/
			var idToken = result.idToken.jwtToken;
			//  console.log('idToken: ' + idToken)
			localStorage.setItem('token', idToken)
			// update tokenCreated time
			localStorage.setItem('tokenCreated', new Date())
			localStorage.setItem('refreshToken', result.getRefreshToken().getToken())
			dispatch({
				type: AUTH_USER,
				payload: idToken
			})
			callback();
		},

		onFailure: function (err) {
			console.log(JSON.stringify(err.message))
			if (JSON.stringify(err.message).indexOf('Incorrect') != -1) {
				dispatch({
					type: AUTH_ERROR,
					payload: err.message
				})
				return
			}
			if (JSON.stringify(err.message).indexOf('does not exist') != -1) {
				dispatch({
					type: AUTH_ERROR,
					payload: err.message
				})
				return
			}
			if (JSON.stringify(err.message).indexOf('not confirmed') != -1) {
				dispatch({
					type: AUTH_ERROR,
					unVerified: formProps.email,
					payload: err.message
				})
				return
			}
			// default
			dispatch({
				type: AUTH_ERROR,
				payload: 'An error occured. Please try again.'
			})
		},
	});
};

export const refreshSession = (callback) => async dispatch => {

	let tokenCreated = localStorage.getItem('tokenCreated')
	let tokenAge = Math.floor((Math.abs(new Date(localStorage.getItem('tokenCreated')) - new Date()) / 1000) / 60);
	console.log(`token age: ${tokenAge}`)

	if (tokenAge >= 60) {
		alert('refreshing token!')

		var userPool = new CognitoUserPool(poolData);
		var cognitoUser = userPool.getCurrentUser();
		let token = new CognitoRefreshToken({
			RefreshToken: localStorage.getItem('refreshToken')
		})
		cognitoUser.refreshSession(token, (err, session) => {
			if (err) {
				console.log(`Token age (minutes): ${tokenAge}`)
				console.log(err)
				return
			}
			// save token to local storage
			let idToken = session.idToken.jwtToken;
			localStorage.setItem('token', idToken)
			// update tokenCreated
			localStorage.setItem('tokenCreated', new Date())

			console.log('Refreshed Successfully')
		})
		callback()
	}
	return
}

const refreshSessionLocal = (callback) => {
	console.log(`checking for refresh!`)
	callback()
}

export const resendVerification = (email, callback) => async dispatch => {

	dispatch({
		type: AUTH_ERROR,
		payload: ""
	})
	dispatch({
		type: AUTH_SUCCESS,
		payload: ""
	})

	console.log('resending verification for: ' + email)
	let data = {
		email: email
	}

	var userPool = new CognitoUserPool(poolData);
	// var cognitoUser = userPool.getCurrentUser();
	const userData = {
		Username: email,
		Pool: userPool
	};
	let cognitoUser = new CognitoUser(userData);
	cognitoUser.resendConfirmationCode((err, result) => {
		if (err) {
			console.log(err);
			dispatch({
				type: AUTH_ERROR,
				payload: err.message
			})
		} else {
			console.log('success!');
			console.log(`--> result: ${result}`)
			dispatch({
				type: AUTH_SUCCESS,
				payload: 'Confirmation Email sent.'
			})
		}
	});
};

export const signout = (callback) => async dispatch => {

	localStorage.removeItem('cartid');
	localStorage.removeItem('token');

	dispatch({
		type: "SHOW_CART",
		cart: []
	})
	dispatch({
		type: AUTH_USER,
		payload: ''
	})
	callback()
}

export const isSignedIn = (callback) => async dispatch => {

}

export const addStock = (formProps, callback) => async dispatch => {

	dispatch({
		type: ADD_ERROR,
		payload: []
	})

	let messages = []

	console.log(`adding stock: ${JSON.stringify(formProps)}`)

	let headers = {
		"headers": {
			"Authorization": localStorage.getItem('token'),
			'Content-Type': 'application/json'
		}
	}
	const response = await axios.post(`${api_url}/priv/stocks`, formProps, headers).then((response) => {
		dispatch({
			type: "SHOW_CUSTOMER",
			payload: response.data
		})
		callback()
	}).catch(function (error) {
		if (error.response.data.errors) {
			error.response.data.errors.map(e => {
				console.log(`e--> ${e}`)
				messages.push({
					text: e,
					key: 'SingleError'
				})
			})
			dispatch({
				type: ADD_ERROR,
				payload: messages
			})
			return
		}
		console.log(error)
		// generic error message if no errors list present in response
		messages.push({
			text: "An error occured. Please try again.",
			key: 'SingleError'
		})
		dispatch({
			type: ADD_ERROR,
			payload: messages
		})
	});
};

export const removeStock = (formProps) => async dispatch => {

	dispatch({
		type: ADD_ERROR,
		payload: ""
	})
	console.log(`removing stock: ${JSON.stringify(formProps)}`)
	let headers = {
		"headers": {
			"Authorization": localStorage.getItem('token'),
			'Content-Type': 'application/json'
		},
		"params": {
			"action": 'delete'
		}
	}
	const response = await axios.post(`${api_url}/priv/stocks`, formProps, headers).then((response) => {
		dispatch({
			type: "SHOW_CUSTOMER",
			payload: response.data
		})
	}).catch(function (error) {

	});
};

export const retriveStocks = (callback) => async dispatch => {

	console.log(`Retrieving stocks for customer`)
	dispatch({
		type: ADD_ERROR,
		payload: ""
	})
	let data = {
		"headers": {
			"Authorization": localStorage.getItem('token'),
			'Content-Type': 'application/json'
		}
	}
	const response = await axios.get(`${api_url}/priv/stocks`, data).then((response) => {
		dispatch({
			type: "SHOW_CUSTOMER",
			payload: response.data
		})
		callback()
	}).catch(function (error) {
		if (error) throw error
	});
}

export const retriveStockPrices = (stocks) => async dispatch => {

	console.log(`Retrieving stock prices for stocks: ${JSON.stringify(stocks)}`)

	let query = ''
	stocks.map(stock => {

		query += `${stock.symbol}`
		if (query.split(",").length != stocks.length) {
			query += ","
		}
	})

	let data = {
		"headers": {
			"Authorization": localStorage.getItem('token'),
			'Content-Type': 'application/json'
		},
		"params": {
			"stocks": query
		}
	}

	return axios.get(`${api_url}/priv/prices`, data).then((response) => {
		dispatch({
			type: "SHOW_CUSTOMER",
			payload: response.data
		})
	}).catch(function (error) {
		if (error) throw error
	});
}