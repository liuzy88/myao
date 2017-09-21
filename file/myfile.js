var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Logger = require('../lib/logger');
var myFile = {};

myFile.listFiles = function(dir) {
    var arrys = [];
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            var name = files[i].toLowerCase();
            if (name.endsWith('.db')) {
                fs.unlinkSync(path.join(dir, files[i]));
                continue;
            }
            if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.mp4')) {
                arrys.push(name);
            }
        }
    }
    return arrys;
}

/* ---------- 重命名 ---------- */

function getNewName(file) {
    var strs = [];
    var stat = fs.statSync(file);
    var d = new Date(stat.mtime);
    strs.push(d.getFullYear());
    strs.push(('0' + (d.getMonth() + 1)).slice(-2));
    strs.push(('0' + d.getDate()).slice(-2));
    strs.push(('0' + d.getHours()).slice(-2));
    strs.push(('0' + d.getMinutes()).slice(-2));
    strs.push(('0' + d.getSeconds()).slice(-2));
    var data = fs.readFileSync(file);
    var md5 = crypto.createHash('md5').update(data).digest('hex');
    strs.push('_');
    strs.push(md5);
    strs.push(path.extname(file).toLowerCase());
    return strs.join('');
}

myFile.renameAll = function(dir) {
    var files = myFile.listFiles(dir);
    for (var i = 0; i < files.length; i++) {
        var oldFile = path.join(dir, files[i]);
        var newFileName = getNewName(oldFile);
        var newFile = path.join(dir, newFileName);
        if (files[i] != newFileName) {
            Logger.log('rename:', files[i], ' -> ', newFileName);
            fs.renameSync(oldFile, newFile);
        }
    }
}

/* ---------- 删除重复 ---------- */

var sizeCache = {}; //文件大小值缓存
function SIZE(file) {
    var size = sizeCache[file];
    if (size == undefined) {
        size = fs.statSync(file).size;
        sizeCache[file] = size;
    }
    return size;
}

var md5Cache = {}; //MD5值缓存
function MD5(file) {
    var md5 = md5Cache[file];
    if (md5 == undefined) {
        var data = fs.readFileSync(file);
        md5 = crypto.createHash('md5').update(data).digest('hex');
        md5Cache[file] = md5;
    }
    return md5;
}

myFile.clearAll = function(dir) {
    var files = myFile.listFiles(dir);
    files.sort(function(a, b) { // 按修改日期排序
        if (fs.statSync(path.join(dir, a)).mtime > fs.statSync(path.join(dir, b)).mtime) {
            return 1;
        } else {
            return -1;
        }
    });
    var temp = []; // 保存完全不同的文件
    for (i in files) {
        var flag = true;
        for (j in temp) {
            if (SIZE(path.join(dir, files[i])) == SIZE(path.join(dir, temp[j])) && MD5(path.join(dir, files[i])) == MD5(path.join(dir, temp[j]))) {
                flag = false;
                Logger.log('delete:', files[i]);
                fs.unlinkSync(path.join(dir, files[i]));
                break;
            }
        }
        if (flag) {
            temp.push(files[i]);
        }
    }
}

module.exports = myFile;
