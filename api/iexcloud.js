const axios = require('axios')

function Iex(apiToken) {
    this.apiToken = apiToken; 
    this.baseURL = 'https://sandbox.iexapis.com/stable'
}


Iex.prototype.validate = function(stock, callback) {
   

        console.log(`validating stock ${JSON.stringify(stock)}`)
  
        if(stock.symbol) {
  
              var errors = []
              
          //    errors.push(`No such symbol: ${stock.symbol}`)
              // any errors? Return 'em!
              if (errors.length > 0) {
                    callback({'errors' : errors}, null)
                    return
              } 
                    
              // everything checks out! Return validated item object for insertion
              callback(null, stock)
       
              return
        };
       
        callback('No stock symbol present', null)
}

Iex.prototype.quote = function(symbol, callback) { 
    let url = `${this.baseURL}/stock/${symbol}/quote?token=${this.apiToken}` 
    console.log(`retrieving: ${symbol}`)
    return axios.get(url).then((response)=> {
        let stock = {'symbol' : response.data.symbol, 'price' : response.data.latestPrice}
        callback(null, stock) 

	}).catch(function (error) {
        console.log(error.response.status)
        if(error.response.status == 404) {
            callback({'errors' : [`Symbol Not Found: ${symbol}`]}, null)
            return
        }
        callback(error, null)
	});
} 

Iex.prototype.quoteMulti = function(symbols, callback) {
    console.log(`quoting multi: ${JSON.stringify(symbols)}`);


    let url = `${this.baseURL}/stock/market/batch?symbols=${symbols}&types=quote&token=${this.apiToken}` 
    console.log(`retrieving: ${symbols}`)
    return axios.get(url).then((response)=> {
		//console.log(`-> ${JSON.stringify(response.data)}`)
        let stocks = []
        Object.keys(response.data).map(symbol => {
            let stock = response.data[symbol].quote
            console.log(stock.latestPrice)
            stocks.push({'symbol' : symbol, 'price' : stock.latestPrice})
        })

        callback(null, stocks)

	}).catch(function (error) {
        // console.log(error.response.status)
        // if(error.response.status == 404) {
        //     callback({'errors' : [`Symbol Not Found: ${symbol}`]}, null)
        //     return
        // }
        callback(error, null)
	});
    
}

module.exports = Iex;
