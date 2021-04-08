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

    

   

    let priceAll = props.priceAll

    console.log(`priceall: ${priceAll}`) 
    console.log(`stock price as a % of total: ${props.price/priceAll*100}`)
    let width = props.price/priceAll*100
 
    const Bar = styled.section`
        height: 20px;
     
         width: ${width}%; 
         max-width: 100%;  
        background: lightblue; 
    `; 
 
    return(
        <div className="item">
            
                <div className="details">
                
                    <label><b>Symbol: </b>{props.symbol}</label> 
                    
                        <Bar>{props.price} </Bar> 
                   
                    { renderDelete(props.removeStock, props.index) }
                </div>
            
        </div>
    )
}
export default Stock;

