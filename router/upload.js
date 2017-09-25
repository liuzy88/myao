const express = require('express')
const router = express.Router()
const qiniu = require('qiniu')
const DB = require('../db/db')
const config = require('../config')

router.get('/', function(req, res, next) {
	res.render('upload', { bucketUrl: config.bucketUrl, tags: config.tags })
})

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY
const uptoken = new qiniu.rs.PutPolicy(config.qiniu.bucket)
uptoken.mimeLimit = 'image/*'

router.get('/uptoken', function(req, res, next) {
	let token = uptoken.token()
	res.header("Cache-Control", "max-age=0, private, must-revalidate")
	res.header("Pragma", "no-cache")
	res.header("Expires", 0)
	if (token) {
		res.json({ uptoken: token })
	} else {
		res.end('token error')
	}
})

router.post('/uploaded', function(req, res, next) {
	if (req.body.hash && req.body.img) {
		let client = new qiniu.rs.Client()
		client.stat(config.qiniu.bucket, req.body.img, function(err, ret) {
			if (err) { // 七牛没有这个文件
				res.end('qiniu file not found.')
			} else { // 有这个文件
				co(function*() {
					let rows = yield DB.Myao.insert({
						hash: req.body.hash,
						img: req.body.img,
						tag: req.body.tag,
						text: req.body.text,
						ctime: req.body.ctime,
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
			}
		})
	} else {
		res.end('params error.')
	}
})

module.exports = router
