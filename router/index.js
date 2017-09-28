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
				res.render('data', { data: rows2 })
			}
		} else {
			let rows2 = yield DB.Myao.searchList(params)
			res.render('index', { data: rows2 })
		}
	}).catch(function(err) {
		next(err)
	})
})

router.post('/like', function(req, res, next) {
	if (req.body.id > 0) {
		co(function*() {
			let rows = yield DB.Myao.like(req.body.id)
			if (rows.affectedRows == 1) {
				res.end('ok')
			} else {
				res.end('no')
			}
		}).catch(function(err) {
			next(err)
		})
	} else {
		res.end('end')
	}
})

router.post('/upcb', function(req, res, next) {
	let img = req.body.img
	let sign = req.body.sign
	if (/[\d]{14}_[\w]{32}\.[\w]{3}/.test(img) && /[\w]{32}/.test(sign)) {
		co(function*() {
			let ctime = img.split('_')[0]
			let hash = img.split('_')[1].split('.')[0]
			let rows = yield DB.Myao.replace({
				hash: hash,
				img: img,
				ctime: ctime,
				cdn: 1
			})
			if (rows.affectedRows == 1) {
				res.end('ok')
			} else {
				res.end('no')
			}
		}).catch(function(err) {
			next(err)
		})
	} else {
		res.end('params error.')
	}
})

module.exports = router