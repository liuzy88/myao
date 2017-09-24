const request = require('request')

let f = '20171111111111_22222222222222222222222222222222.mp4'

request.post({
	url: 'http://127.0.0.1:1000/upcb',
	form: { img: f, sign: '11111111111111111111111111111111' }
}, function(err, res, body) {
	console.log(body)
})
