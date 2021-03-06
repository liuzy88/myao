const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const MF = require('../lib/mf')

let inDir = 'D:/myao-video' // 要改的文件目录
let inDir2 = 'D:/video' // 正确的文件目录
let outDir = 'D:/myao-video2' // 输出的文件目录

// 1.重命名inDir2下的文件
MF.renameAll(inDir2)
MF.clearAll(inDir2)

let inFiles = MF.listFiles(inDir)
let inFiles2 = MF.listFiles(inDir2)

// 2.遍历要改的文件，去正确的文件找MD5
for (i in inFiles) {
	let target = inFiles[i]
	for (j in inFiles2) {
		let real = inFiles2[j]
		// 找MD5
		if (target.split('_')[1] == real.split('_')[1]) {
			// console.log(i, target, ' <> ', j, real)
			let name = real.split('_')[0] + '_' + real.split('_')[1]
			console.log(target,' => ', name)
			fs.renameSync(path.join(inDir, target), path.join(outDir, name))
			continue
		}
	}
}
