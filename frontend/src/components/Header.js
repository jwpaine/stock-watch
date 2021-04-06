import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as actions from '../actions'
import {compose} from "redux";


	const Wrapper = styled.section`

		background: lightgray;
		display: flex;
	    justify-content: flex-end;

	  	> .links {
	  		> a {
	  			padding: 5px;
	  		}
	  	}

	`;

class Header extends Component {

	renderLinks() {

	    if (this.props.authenticated) {

			return (
				<div className="links">
					<Link disabled to={`/signout`}>Sign out</Link>
					<Link disabled to="/account">My Stocks</Link>
				</div>
			)

		}

		return (
				<div className="links">
					<Link to="/signin">Sign in</Link>
				</div>
		)
	}
	render() {
		return (
			<header>
				<div className="wrap">
					<Link className="logo" to="/">
						Sparky Stocks 
					</Link>
					{ this.renderLinks() }
				</div>
			</header>
		)
	}
}

function mapStateToProps(state, props) {
	return {
		authenticated: state.auth.authenticated,
		cart : state.cart
	}
}

export default compose(
	connect(mapStateToProps, actions)
)(Header);

// export default connect(mapStateToProps)(Header); 