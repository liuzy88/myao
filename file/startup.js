var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var Logger = require('../lib/logger');
var MyFile = require('./myfile');
var config = require('../config');

var exe = config.exe;
var inDir = config.inDir;
var outDir = config.outDir

// 1.重命名
MyFile.renameAll(inDir);

// 2.删除重复文件
MyFile.clearAll(inDir);

// 3.MP4转码H264

var files = [];
if (fs.existsSync(inDir)) {
    var temps = fs.readdirSync(inDir);
    for (i in temps) {
        var name = temps[i].toLowerCase();
        if (name.endsWith('.db')) {
            fs.unlinkSync(path.join(inDir, temps[i]));
            continue;
        } else if (name.endsWith('.mp4')) {
            files.push(name);
        } else {
            fs.renameSync(path.join(inDir, temps[i]), path.join(outDir, temps[i]));
        }
    }
}
// ffmpeg -i E:/梦瑶2017视频合集/20161031115952_42e5157c2402c63dbf482e8f53829eb6.mp4 -vcodec h264 -y 20161031115952_42e5157c2402c63dbf482e8f53829eb6.mp4
function convert(i) {
    var f = files[i];
    if (f) {
        Logger.log('convert:', f, (i + 1) + '/' + files.length, ((i + 1) / files.length * 100).toFixed(2) + '%');
        var cmd = spawn(exe, ['-i', path.join(inDir, f), '-vcodec', 'h264', '-y', path.join(outDir, f)]);
        cmd.stdout.on('data', function(data) {
            // Logger.log('cmd out:', data);
        });
        cmd.stderr.on('data', function(data) {
            // Logger.log('cmd err:', data);
        });
        cmd.on('exit', function(code) {
            convert(++i);
        });
    } else {
        require('./upload');
    }
}

convert(0);
