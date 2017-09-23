const MF = require('../lib/mf')
const config = require('../config')

const inDir = config.inDir

// 第一步 重命名 删除重复文件

MF.renameAll(inDir)

MF.clearAll(inDir)
