const express = require('express')
const cors = require('cors')
const CognitoExpress = require("cognito-express")
const AWS = require('aws-sdk');
const {
	v1: uuidv1
} = require('uuid');
const bodyParser = require('body-parser');
const Redis = require("redis");
const app = express()
const authenticatedRoute = express.Router();
const port = 8080

const Customer = require('./dynamo/customer')
const Iex = require('./iexcloud')
const config = require('./config.json')
const redis = require('./redis/stock.js')
AWS.config.update(config.aws);
const cognitoExpress = new CognitoExpress(config.cognito);

// const redisClient = Redis.createClient({
// 	"host" : config.redis.host,
// 	"port" : config.redis.port,
// 	"password" : config.redis.password 
// });

let docClient = new AWS.DynamoDB.DocumentClient()
let dynamodb = new AWS.DynamoDB()
let iex = new Iex(config.iex.secretApiKey)


app.use("/priv", cors(), authenticatedRoute);
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('Nothing here :('))
app.get('/test', (req, res) => res.send('Test confirmed!'))

authenticatedRoute.use(express.json())

authenticatedRoute.use(function (req, res, next) {

	let accessTokenFromClient = req.header('Authorization')
	//Fail if token not present in header. 
	if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header")
	cognitoExpress.validate(accessTokenFromClient, function (err, response) {
		//If API is not authenticated, Return 401 with error message. 
		if (err) return res.status(401).send(err);
		//Else API has been authenticated. Proceed.
		res.locals.user = response;
		next()
	})
})

authenticatedRoute.get("/stocks", function (req, res, next) {

	let customer = new Customer(res.locals.user.email)

	customer.stocks().get(dynamodb, function (err, r) {
		if (err) { 
			console.log(`err`)

		}
		// no stocks for account
		if(r.length == 0) {
			return res.send(r)
		}

		let batch = ''
		r.stocks.map(stock => {
			batch += stock.symbol
			if (batch.split(",").length < r.stocks.length) {
				batch += ","
			}
		})
		iex.quoteMulti(batch, function (err, stocks) {
			if (err) {
				return res.status(502).send(err)
			}
			res.send({
				'stocks': stocks
			})
		})

	})
})

authenticatedRoute.get("/prices", function (req, res, next) {
	console.log(req.query)
	if (!req.query.stocks) {
		return res.status(400).send('stocks not present')
	}
	console.log(`pricing requested for: ${req.query.stocks.split(",").length}`)
	iex.quoteMulti(req.query.stocks, function (err, stocks) {
		if (err) {
			return res.status(502).send(err)
		}
		res.send({
			'stocks': stocks
		})
	})
})


app.get("/test", function (req, res) {
	console.log('/test requested')
	res.send('ok!')
});

authenticatedRoute.post("/stocks", function (req, res, next) {

	let customer = new Customer(res.locals.user.email)

	if (req.query.action) {
		if (req.query.action == 'delete') {
			console.log('action = delete')
			let stockIndex = req.body.index
			if (stockIndex != null) {
				customer.stocks().remove(docClient, stockIndex, function (err, r) {
					if (err) {
						console.log(`err`)
						return res.status(502).send(err)
					}
					return res.send(r)
				});
				return
			}
			console.log(`no index specified for deletion`)
			return res.status(502).send('no index specified')
		}
		console.log('non-implemented action provided')
		return res.status(502).send('invalid action')
	}

	iex.quote(req.body.symbol, function (err, quote) {
		if (!err) {
			console.log('saving: ' + JSON.stringify(quote))
			customer.stocks().add(docClient, [quote], function (err, r) {
				if (err) {
					console.log(err)
					return res.status(502).send(err)
				}
				console.log(`success`)
				res.send(r)
			})
			return
		}
		return res.status(400).send(err)
	})
})

app.listen(port, () => console.log(`Listening on port ${port}`))