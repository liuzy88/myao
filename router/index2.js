const co = require('co')
const express = require('express')
const router = express.Router()
const DB = require('../db/db')
const config = require('../config')

router.get('/', function(req, res, next) {
	let params = { page: 1, rows: 10 }
	if (req.query.t == 1) {
		params._orderby = "`like`,`ctime` DESC"
	} else if (req.query.t == 2) {
		params._orderby = "`ctime` DESC"
	} else if (req.query.t == 3) {
		params._where = "`img` NOT LIKE '%.mp4'"
		params._orderby = "`ctime` DESC"
	} else if (req.query.t == 4) {
		params._where = "`img` LIKE '%.mp4'"
		params._orderby = "`ctime` DESC"
	} else {
		params._orderby = "`ctime` DESC"
	}
	co(function*() {
		if (req.query.p > 0) {
			params.page = req.query.p
			let rows1 = yield DB.Myao.searchCount(params)
			let count = rows1[0].num
			if (params.page > Math.ceil(count / params.rows)) {
				res.end('end')
			} else {
				let rows2 = yield DB.Myao.searchList(params)
				res.render('data2', { data: rows2 })
			}
		} else {
			let rows2 = yield DB.Myao.searchList(params)
			res.render('index2', { data: rows2 })
		}
	}).catch(function(err) {
		next(err)
	})
})

module.exports = router