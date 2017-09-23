const Query = require('./query')
const SQL = require('./sql')

function Table(tbname, obj) {
	this.tbname = tbname
	this.searchCount = function(params) {
		let sql = 'SELECT COUNT(*) AS num FROM `' + this.tbname + '`'
		if (params._where) {
			sql += ' WHERE ' + params._where
		}
		let pms = []
		return Query(sql, pms)
	}
	this.searchList = function(params) {
		let sql = 'SELECT * FROM `' + this.tbname + '`'
		if (params._where) {
			sql += ' WHERE ' + params._where
		}
		if (params._orderby) {
			sql += ' ORDER BY ' + params._orderby
		}
		sql += ' limit ?, ?'
		let pms = [(params.page - 1) * params.rows, params.rows]
		return Query(sql, pms)
	}
	this.findbyid = function(params) {
		let sql = SQL.findbyidSql(this.tbname, params)
		let pms = SQL.findbyidPms(params)
		return Query(sql, pms)
	}
	this.insert = function(params) {
		let sql = SQL.insertSql(this.tbname, params)
		let pms = SQL.insertPms(params)
		return Query(sql, pms)
	}
	this.replace = function(params) {
		let sql = SQL.replaceSql(this.tbname, params)
		let pms = SQL.replacePms(params)
		return Query(sql, pms)
	}
	this.update = function(params) {
		let sql = SQL.updatebyidSql(this.tbname, params)
		let pms = SQL.updatebyidPms(params)
		return Query(sql, pms)
	}
	this.del = function(params) {
		let sql = SQL.deletebyidSql(this.tbname, params)
		let pms = SQL.deletebyidPms(params)
		return Query(sql, pms)
	}
	for (i in obj) {
		this[i] = obj[i]
	}
}

module.exports = Table
