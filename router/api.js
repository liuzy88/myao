const co = require('co')
const express = require('express')
const router = express.Router()
const DB = require('../db/db')
const config = require('../config')

router.post('/videos', function(req, res, next) {
	let params = {
		page: req.body.page > 0 ? parseInt(req.body.page) : 1,
		rows: req.body.rows > 0 ? parseInt(req.body.rows) : 10
	}
	params._where = "`img` LIKE '%.mp4'"
	co(function*() {
		let rows1 = yield DB.Myao.searchCount(params)
		let total = rows1[0].num
		let rows2 = yield DB.Myao.searchList(params)
		res.json({ page: params.page, rows: params.rows, total: total, data: rows2 })
	}).catch(function(err) {
		next(err)
	})
})

module.exports = router
