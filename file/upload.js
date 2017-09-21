var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Promise = require('promise');
var qiniu = require('qiniu');
var config = require('../config');
var Logger = require('../lib/logger');
var MyFile = require('./myfile');

var outDir = config.outDir;

// 上传到七牛 生成SQL语句
qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

var workCount = 5; // 工作个数
var works = []; // 工作者
for (var i = 1; i <= workCount; i++) {
    works.push('work_' + i);
}
var files = MyFile.listFiles(outDir); // 工作内容
var okList = []; // 成功的集合

function working(work, f) {
    Logger.log(work, 'upload:', f);
    var hash = f.split('_')[1].split('.')[0];
    var ctime = f.split('_')[0];
    var client = new qiniu.rs.Client();
    client.stat(config.qiniu.bucket, f, function(err, ret) {
        if (err) { // 七牛没有这个文件
            var putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket + ':' + f);
            var token = putPolicy.token();
            qiniu.io.putFile(token, f, path.join(outDir, f), null, function(err, ret) {
                if (err) {
                    Logger.log(work, 'upload error:', f, err);
                    works.push(work);
                } else {
                    // 上传成功
                    Logger.log(work, 'upload success:', ret.key, '->', ret.hash);
                    okList.push({ hash: hash, img: f, ctime: ctime });
                    works.push(work);
                }
            });
        } else {
            // 取消上传
            Logger.log(work, 'upload cancel:', f);
            okList.push({ hash: hash, img: f, ctime: ctime });
            works.push(work);
        }
    });
}

function start() {
    var work = works.shift();
    if (work) {
        var f = files.shift();
        if (f) {
            working(work, f);
        } else {
            works.push(work);
        }
    }
    if (files.length == 0 && works.length == workCount) {
        Logger.log('upload finished.');
        if (okList.length > 0) {
            var sqls = [];
            for (i in okList) {
                sqls.push("('" + okList[i].hash + "', '" + okList[i].img + "', '" + okList[i].ctime + "', 1)");
            }
            fs.writeFileSync('../data.sql', "REPLACE INTO `myao`(`hash`, `img`, `ctime`, `cdn`) VALUES\n" + sqls.join(',\n'));
            Logger.log('sql file saved to data.sql, please.');
        } else {
            Logger.log('no data need sql file, bye.');
        }
    } else {
        setTimeout(start, 20);
    }
}

// 执行
Logger.log('start upload.');
start();
