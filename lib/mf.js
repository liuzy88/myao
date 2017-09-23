const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const log = require('./log')
const MF = {}

MF.listFiles = function(dir) {
	let arry = []
	if (fs.existsSync(dir)) {
		let files = fs.readdirSync(dir)
		for (let i = 0 i < files.length i++) {
			let name = files[i].toLowerCase()
			if (name.endsWith('.db')) {
				fs.unlinkSync(path.join(dir, files[i]))
				continue
			}
			if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.mp4')) {
				arry.push(name)
			}
		}
	}
	return arry
}

/* ---------- 重命名 ---------- */

function getNewName(file) {
	let buff = []
	let stat = fs.statSync(file)
	let d = new Date(stat.mtime)
	buff.push(d.getFullYear())
	buff.push(('0' + (d.getMonth() + 1)).slice(-2))
	buff.push(('0' + d.getDate()).slice(-2))
	buff.push(('0' + d.getHours()).slice(-2))
	buff.push(('0' + d.getMinutes()).slice(-2))
	buff.push(('0' + d.getSeconds()).slice(-2))
	let data = fs.readFileSync(file)
	let md5 = crypto.createHash('md5').update(data).digest('hex')
	buff.push('_')
	buff.push(md5)
	buff.push(path.extname(file).toLowerCase())
	return buff.join('')
}

MF.renameAll = function(dir) {
	let files = MF.listFiles(dir)
	for (let i = 0 i < files.length i++) {
		let oldFile = path.join(dir, files[i])
		let newFileName = getNewName(oldFile)
		let newFile = path.join(dir, newFileName)
		if (files[i] != newFileName) {
			log('rename:', files[i], ' -> ', newFileName)
			fs.renameSync(oldFile, newFile)
		}
	}
}

/* ---------- 删除重复 ---------- */

let sizeCache = {} //文件大小值缓存
function SIZE(file) {
	let size = sizeCache[file]
	if (size == undefined) {
		size = fs.statSync(file).size
		sizeCache[file] = size
	}
	return size
}

let md5Cache = {} //MD5值缓存
function MD5(file) {
	let md5 = md5Cache[file]
	if (md5 == undefined) {
		let data = fs.readFileSync(file)
		md5 = crypto.createHash('md5').update(data).digest('hex')
		md5Cache[file] = md5
	}
	return md5
}

MF.clearAll = function(dir) {
	let files = MF.listFiles(dir)
	files.sort(function(a, b) { // 按修改日期排序
		if (fs.statSync(path.join(dir, a)).mtime > fs.statSync(path.join(dir, b)).mtime) {
			return 1
		} else {
			return -1
		}
	})
	let temp = [] // 保存完全不同的文件
	for (i in files) {
		let flag = true
		for (j in temp) {
			if (SIZE(path.join(dir, files[i])) == SIZE(path.join(dir, temp[j])) && MD5(path.join(dir, files[i])) == MD5(path.join(dir, temp[j]))) {
				flag = false
				log('delete:', files[i])
				fs.unlinkSync(path.join(dir, files[i]))
				break
			}
		}
		if (flag) {
			temp.push(files[i])
		}
	}
}

module.exports = MF
