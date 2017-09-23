const co = require('co')
const log = require('../lib/log')
const DB = require('../db/db')

const Myao = DB.Myao

co(function*() {
	let rows1 = yield Myao.searchCount({})
	let rows2 = yield Myao.searchList({ page: 1, rows: 10 })
	log(JSON.stringify(rows1))
	log(JSON.stringify(rows2))
	DB.close()
	return 'ok'
}).then(function(ret) {
	log(ret)
}).catch(function(err) {
	log(err.stack)
})
