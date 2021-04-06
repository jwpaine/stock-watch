import React from 'react';
import styled from 'styled-components';
import {Link} from "react-router-dom";



const Wrapper = styled.section`

		background: lightgray;
		
		.name, .price, .size {
		    font-size: 16px;
		    font-weight: bold;
		}
		
		img {
		    height: 100px;
		}
	`;
const renderDelete = (removeStock, index) => {
    if (removeStock) {
        return (
            <a href="#" onClick={() => removeStock(index)}>Remove</a>
        )
    }
}

const Stock = (props) => {
 
    return(
        <div className="item">
            {/* <div className="img-wrap"> */}
               
                    {/* <img src={`${props.image}`} /> */}
              
            {/* </div> */} 
            <div className="details">
             
                <label><b>Symbol: </b>{props.symbol}</label> 
                <label><b>Price: </b>{props.price} </label>  

                { renderDelete(props.removeStock, props.index) }
            </div>
        </div>
    )
}
export default Stock;

