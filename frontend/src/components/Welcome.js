import React from 'react';
import {Link} from "react-router-dom";

export default () => {
	return (
		<div className="home">
			<div className="hero">
				 
				<div className="hero__img">
					<div className="hero__text tablet--show">
						<h1>Welcome to Sparky Stocks!</h1>
						<p>This isn't just a programming activity for the ASU EdPlus Web Application Developer Position. It's Sparky's prefered platform to monitor stocks!</p> 
						<Link to={`/account`}><button>My Stocks</button></Link>   
					</div>
				</div>
				<div className="hero__text tablet--hide"> 
					<h1>Welcome to Sparky Stocks!</h1>
					<p>This isn't just a programming activity for the ASU EdPlus Web Application Developer Position. It's Sparky's prefered platform to monitor stocks!</p> 
				    <Link to={`/account`}><button>My Stocks</button></Link> 
				</div>
			</div>
		</div>
	)
}; 