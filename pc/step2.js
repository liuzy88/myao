const co = require('co')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const log = require('../lib/log')
const MF = require('../lib/mf')
const config = require('../config')

const exe = config.exe
const inDir = config.inDir
const outDir = config.outDir

// 第二步 转换视频编码 ffmpeg -i D:/myao-temp/xxx.mp4 -vcodec h264 -y xxx.mp4

let files = []
let temps = MF.listFiles(inDir)
for (i in temps) {
	if (temps[i].endsWith('.mp4')) {
		files.push(temps[i])
	} else {
		fs.renameSync(path.join(inDir, temps[i]), path.join(outDir, temps[i]))
	}
}

function convert(i) {
	let f = files[i]
	if (f) {
		log('convert:', f, (i + 1) + '/' + files.length, '......', ((i + 1) / files.length * 100).toFixed(2) + '%')
		let cmd = spawn(exe, ['-i', path.join(inDir, f), '-vcodec', 'h264', '-y', path.join(outDir, f)])
		cmd.stdout.on('data', function(data) {
			// log('cmd out:', data)
		})
		cmd.stderr.on('data', function(data) {
			// log('cmd err:', data)
		})
		cmd.on('exit', function(code) {
			convert(++i)
		})
	} else {
		log('done.')
	}
}

convert(0)
