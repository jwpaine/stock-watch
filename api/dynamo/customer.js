/*
	Customer table
*/
const attr = require('dynamodb-data-types').AttributeValue

function Customer(email) {
	this.email = email
	this.customerData = null
}

Customer.prototype.cache = function (customerData) {
	this.customerData = customerData
}

Customer.prototype.stocks = function () {
	let params = {
		TableName: 'sparky_stocks',
		AttributesToGet: ["stocks"],
		Key: {
			"email": {
				"S": this.email
			}
		}
	}
	return {
		add: (docClient, stocks, callback) => {
			console.log(`adding stock ${JSON.stringify(stocks)} for user ${this.email}`)
			docClient.update({
				TableName: 'sparky_stocks',
				Key: {
					'email': this.email
				},
				ReturnValues: 'ALL_NEW',
				UpdateExpression: 'set #stocks = list_append(if_not_exists(#stocks, :empty_list), :stocks)',
				ExpressionAttributeNames: {
					'#stocks': 'stocks'
				},
				ExpressionAttributeValues: {
					':stocks': stocks,
					':empty_list': []
				}
			}, function (err, data) {
				if (err) {
					callback(err, null)
					return
				}

				let stocks = data.Attributes
				callback(null, stocks)
			})


		},
		remove: (docClient, index, callback) => {
			console.log(`removing stock ${index} for user ${this.email}`)
			docClient.update({
				TableName: 'sparky_stocks',
				Key: {
					'email': this.email
				},
				ReturnValues: 'ALL_NEW',
				UpdateExpression: "REMOVE #i[" + index + "]",
				ExpressionAttributeNames: {
					'#i': 'stocks'
				},
			}, function (err, data) {
				if (err) {
					callback(err, null)
					return
				}

				let stocks = data.Attributes
				callback(null, stocks)
			})


		},
		get: (dynamodb, callback) => {
			console.log(`obtaining stocks for user ${this.email}`)
			// if customer data already exists, use prefetched
			if (this.customerData) {
				console.log(`prefetched`)
				let stocks = this.customerData.stocks
				if (stocks) {
					callback(null, stocks)
				}
				return
			}
			// customer data not prefetched, obtain cart data
			dynamodb.getItem(params, function (err, data) {
				if (err) {
					callback(err, null)
					return
				}
				
				if (data.Item.stocks) {
					let customer = attr.unwrap(data.Item)
					callback(null, customer)
					return
				}
				callback(null, []);
			})
		}
	}
}


module.exports = Customer