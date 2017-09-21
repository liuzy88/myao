var fs = require('fs');
var path = require('path');
var MyFile = require('./myfile');
var Logger = require('../lib/logger');

function listFiles(dir) {
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

var tempDir = 'E:/梦瑶2017视频合集';
var targetDir = 'F:/myao-video';

// MyFile.renameAll(targetDir); // 不要对转码后的文件重命名
MyFile.clearAll(targetDir);

var tempfiles = listFiles(tempDir);
var targetfiles = listFiles(targetDir);

Logger.log('targetDir has', targetfiles.length);

for (i in targetfiles) {
    var target = targetfiles[i];
    for (j in tempfiles) {
        var temp = tempfiles[j];
        if (target.split('_')[1] == temp.split('_')[1]) {
            Logger.log('delete file:', target, 'because', temp);
            fs.unlinkSync(path.join(targetDir, target));
            break;
        }
    }
}

Logger.log('done. it have', listFiles(targetDir).length);
