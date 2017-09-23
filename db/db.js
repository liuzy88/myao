const Query = require('./query')
const Table = require('./table')
const DB = {}

DB.Myao = new Table('myao', {
	findbyHash: function(hash) {
		let sql = 'SELECT `id` FROM `myao` WHERE `hash`=? LIMIT 1'
		let pms = [hash]
		return Query(sql, pms)
	},
	updatebyHash: function(params) {
		let sql = 'UPDATE `myao` SET `img`=?,`cdn`=? WHERE `hash`=?'
		let pms = [params.img, params.cdn, params.hash]
		return Query(sql, pms)
	},
	like: function(id) {
		let sql = 'UPDATE `myao` SET `like`=`like`+1 WHERE `id`=?'
		let pms = [id]
		return Query(sql, pms)
	}
})

DB.close = function() {
	Query.end()
}

module.exports = DB
