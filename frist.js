var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Promise = require('promise');
var schedule = require("node-schedule");
var qiniu = require('qiniu');
var config = require('./config');
var Logger = require('./lib/logger');
var MyFile = require('./file/myfile');
var DB = require('./db/db');

// 1.重命名
MyFile.renameAll(config.inDir);

// 2.删除重复文件
MyFile.clearAll(config.inDir);

// 3.移到到正式目录 保存到数据库 hash fileName
function save(f) {
    var time = f.split('_')[0];
    var hash = f.split('_')[1].split('.')[0];
    DB.Myao.findbyHash(hash).then(function(data) {
        if (data.length > 0) {
            fs.unlinkSync(path.join(config.inDir, f));
            return Promise.reject();
        } else {
            return DB.Myao.insert({
                hash: hash,
                img: f,
                ctime: time
            });
        }
    }).then(function(data) {
        data.affectedRows == 1 && fs.renameSync(path.join(config.inDir, f), path.join(config.outDir, f));
    }).catch(function(err) {
        Logger.log(err);
    });
}
var temps = MyFile.listFiles(config.inDir);
for (i in temps) {
    save(temps[i]);
}

// 4.上传到bucket 删除本地文件 更新数据库

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

var workCount = 3; // 工作个数
var works = []; // 工作者
for (var i = 1; i <= workCount; i++) {
    works.push('work_' + i);
}
var files = []; // 工作内容
var okList = []; // 成功的集合

function working(work, f) {
    var hash = f.split('_')[1].split('.')[0];
    var ctime = f.split('_')[0];
    new Promise(function(resolve, reject) {
        var client = new qiniu.rs.Client();
        client.stat(config.qiniu.bucket, f, function(err, ret) {
            if (err) { // 七牛没有这个文件
                var putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket + ':' + f);
                var token = putPolicy.token();
                qiniu.io.putFile(token, f, path.join(config.outDir, f), null, function(err, ret) {
                    if (err) {
                        Logger.log(work, 'upload file error', f, err);
                        reject(err);
                    } else {
                        Logger.log(work, 'upload file success', ret.key, ret.hash);
                        resolve(ret);
                    }
                });
            } else { // 取消上传
                Logger.log(work, 'upload file cancel', f);
                // ret.key = f;
                resolve(ret);
            }
        });
    }).then(function() {
        return DB.Myao.updatebyHash({ hash: hash, img: f, cdn: 1 });
    }).then(function(data) {
        if (data.affectedRows == 1) {
            // fs.unlinkSync(path.join(config.outDir, f)); // 删除本地文件
            Logger.log(work, 'update db success', f);
            okList.push({ hash: hash, img: f, ctime: ctime });
        } else {
            Logger.log(work, 'update db failed', data);
        }
        works.push(work);
    }).catch(function(err) {
        Logger.log(err);
        works.push(work);
    });
}

function start() {
    var work = works.shift();
    if (work) {
        var f = files.shift();
        if (f) {
            Logger.log(work, 'upload file', f);
            working(work, f);
        } else {
            works.push(work);
        }
    }
    if (files.length == 0 && works.length == workCount) {
        Logger.log('job is finished...');
        var values = [];
        for (i in okList) {
            values.push("('" + okList[i].hash + "', '" + okList[i].img + "', '" + okList[i].ctime + "', 1)");
        }
        var sqls = "INSERT INTO `myao` (`hash`, `img`, `ctime`, `cdn`) VALUES \n";
        sqls += values.join(',\n');
        sqls += ';'
        fs.writeFileSync('insert.sql', sqls);
        process.exit(0);
    } else {
        setTimeout(start, 20);
    }
}

/*
// 启动服务后定时执行
schedule.scheduleJob(config.task, function() {
    Logger.log('task job start...');
    files = MyFile.listFiles(config.outDir);
    start();
});
*/
// 启动服务后延迟执行
setTimeout(function() {
    Logger.log('time job start...');
    files = MyFile.listFiles(config.outDir);
    start();
}, 5000);
