const fs = require('fs')
const path = require('path')
const qiniu = require('qiniu')
const MF = require('../lib/mf')
const log = require('../lib/log')
const config = require('../config')
const outDir = config.outDir

// 第三步 上传文件到七牛

let upstat = 'upstat'
let upstatus = {}
if (fs.existsSync(upstat)) {
    let upsuccess = fs.readFileSync(upstat).toString().split(/\r?\n/ig)
    let count = 0
    for (i in upsuccess) {
        if (upsuccess) {
            count++
            upstatus[upsuccess] = true
        }
    }
    log('load end,', count, 'well be cancel.')
}
function remember(f) {
    fs.appendFileSync(upstat, f + '\n', {})
}
function forgetit() {
    fs.unlinkSync(upstat)
}

// 上传到七牛 生成SQL语句
qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY

let workCount = 20 // 工作个数
let works = [] // 工作者
for (let i = 1 i <= workCount i++) {
    works.push('work_' + i)
}
let files = MF.listFiles(outDir) // 工作内容
let okList = [] // 成功的集合

function working(work, f) {
    log(work, 'upload:', f)
    let hash = f.split('_')[1].split('.')[0]
    let ctime = f.split('_')[0]
    let client = new qiniu.rs.Client()
    if (upstatus[f]) {
        // 上传取消
        log(work, 'cancel upload:', f)
        okList.push({ hash: hash, img: f, ctime: ctime })
        works.push(work)
    } else {
        client.stat(config.qiniu.bucket, f, function(err, ret) {
            if (err) { // 七牛没有这个文件
                let putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket + ':' + f)
                let token = putPolicy.token()
                qiniu.io.putFile(token, f, path.join(outDir, f), null, function(err, ret) {
                    if (err) {
                        log(work, 'upload error:', f, err)
                        works.push(work)
                    } else {
                        // 上传成功
                        log(work, 'upload success:', ret.key, '->', ret.hash)
                        remember(f)
                        okList.push({ hash: hash, img: f, ctime: ctime })
                        works.push(work)
                    }
                })
            } else {
                // 取消上传
                log(work, 'upload cancel:', f)
                remember(f)
                okList.push({ hash: hash, img: f, ctime: ctime })
                works.push(work)
            }
        })
    }
    
}

function start() {
    let work = works.shift()
    if (work) {
        let f = files.shift()
        if (f) {
            working(work, f)
        } else {
            works.push(work)
        }
    }
    if (files.length == 0 && works.length == workCount) {
        log('upload finished.')
        forgetit()
        if (okList.length > 0) {
            let sqls = []
            for (i in okList) {
                sqls.push("('" + okList[i].hash + "', '" + okList[i].img + "', '" + okList[i].ctime + "', 1)")
            }
            fs.writeFileSync('../data.sql', "REPLACE INTO `myao`(`hash`, `img`, `ctime`, `cdn`) VALUES\n" + sqls.join(',\n'))
            log('done. see sql file.')
        } else {
            log('done. bye.')
        }
    } else {
        setTimeout(start, 20)
    }
}

// 执行
log('start upload.')
start()
