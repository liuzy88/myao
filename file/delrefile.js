var fs = require('fs');
var path = require('path');
var MyFile = require('./myfile');
var config = require('../config');
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

var inDir = config.inDir;
var outDir = config.outDir

// MyFile.renameAll(outDir); // 不要对转码后的文件重命名
MyFile.clearAll(outDir);

var tempfiles = listFiles(inDir);
var targetfiles = listFiles(outDir);

Logger.log('outDir has', targetfiles.length);

for (i in targetfiles) {
    var target = targetfiles[i];
    for (j in tempfiles) {
        var temp = tempfiles[j];
        if (target.split('_')[1] == temp.split('_')[1]) {
            Logger.log('delete file:', target, 'because', temp);
            fs.unlinkSync(path.join(outDir, target));
            break;
        }
    }
}

Logger.log('done. it have', listFiles(outDir).length);
