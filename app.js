const bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const config = require('./config')
const EJS = require('./lib/ejs')
const log = require('./lib/log')

app.set('views', path.join(__dirname, 'views'))
app.engine('.html', require('ejs').__express)
app.set('view engine', 'html')
app.locals.EJS = EJS

app.use(log.reqlog)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./router/index'))
app.use('/upload', require('./router/upload'))

app.use(function(req, res, next) {
	res.status(404).send('404 Not Found')
})

app.use(function(err, req, res, next) {
	log(err.stack)
	res.status(500).send('500 Server Error')
})

const server = http.createServer(app)
server.on('error', function(err) {
	log(err)
}).on('listening', function() {
	log('Listening on ' + server.address().port)
}).listen(config.port)
