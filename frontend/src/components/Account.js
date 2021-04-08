import React, { Component } from 'react';
import requireAuth from './RequireAuth';
import {connect} from "react-redux"
import { Link } from 'react-router-dom';
import * as actionCreators from '../actions/index.js'

import { reduxForm, Field } from 'redux-form';



import { withRouter } from "react-router-dom";

import PropTypes from 'prop-types'; // ES6 
import { compose } from 'redux'


import * as actions from '../actions'
import {ADD_ERROR, AUTH_ERROR} from "../actions/types"; 

import Stock from './Stock' 


class Portal extends Component {


constructor(props) {

	super(props)
	console.log(props)
	requireAuth(this)

}

componentDidMount() {
	this.props.retriveStocks(() => {
	});
	this.interval = setInterval(() => {
		if (this.props.customer && this.props.customer.data) { 
			if (this.props.customer.data.stocks && this.props.customer.data.stocks.length > 0) {
				this.props.retriveStockPrices(this.props.customer.data.stocks)
			}
		}
	 
	}, 5000);   
}

componentWillUnmount() {
	clearInterval(this.interval);
  }

componentDidUpdate(props) {
	console.log(props)
	requireAuth(Portal)
}

 refreshSession = () => {
		this.props.refreshSession(() => {
            window.location.reload();
		})
}



	renderErrorMessage = () => {

		if (!this.props.errorMessage) {
			return
		}

		if (this.props.errorMessage.length != 0) {
			return (
				<div className="messages">
					{this.props.errorMessage.map(message => (
						<div key={message.key} className={`message message--error`}>
							{message.text}
						</div>
					))}
				</div>
			)
		}
	
}

addStock = formProps => { 
	this.props.addStock(formProps, () => {
	}); 
};
 
renderForm = () => {
	const { handleSubmit } = this.props;  
	 return(
		<form onSubmit={handleSubmit(this.addStock)}>
			<fieldset>
				<div className="quantity">
					<label>Symbol</label>
						<Field
							name="symbol"
							type="text"
							component="input"
						/>
				</div>
			</fieldset>
			<button>Add Stock</button> 
		</form> 
	 )
	
}

removeStock = (index) => {
	
	this.props.removeStock({"index" : index}, () => {
		
	});

}

renderStocks= customer => {
		if(!customer) {
			console.log('!customer')
			return
		}

		if (!customer.stocks || customer.stocks.length == 0 ) {
			return( 
				<p>No Stocks Added</p> 
			)
		}

		console.log(`customer -->: ${customer}`)

		let priceAll = 0;

		customer.stocks.map( (stock, index) => {
			priceAll += stock.price;
		});

		return (

				<div>
					{customer.stocks.map( (stock, index) => (
						 <Stock key={index} index={index} removeStock={this.removeStock} symbol={stock.symbol} price={stock.price} priceAll={priceAll} />
					))}	
				</div>

		)
	}

	render() {
		
		return(

			<div className="account">
				<div className="account__details">
					<h1>My Stocks</h1>
				</div>

				<div className="account__subscription">
					<div className="account__subscription__items">
						{ this.renderStocks(this.props.customer.data) }
					
					</div>
					{ this.renderForm() }  
					{this.renderErrorMessage()} 
				</div>
			</div>
		)
	}
}

function mapeStateToProps(state, props) {

	return {
		customer: state.customer,
		errorMessage: state.create.errorMessage 
	}
}

// export default connect (mapStateToProps, actionCreators)(requireAuth(Portal));

export default compose(
	connect(mapeStateToProps, actions),
	reduxForm({ form: 'addStock'}) 
)(requireAuth(Portal));
