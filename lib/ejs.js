var fs = require('fs');
var path = require('path');
var config = require('../config');
var EJS = {};

EJS.datetime = function(t) {
    var d = new Date(t);
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2), ' ',
        ('0' + d.getHours()).slice(-2), ':',
        ('0' + d.getMinutes()).slice(-2), ':',
        ('0' + d.getSeconds()).slice(-2)
    ].join('');
}

EJS.date = function(t) {
    var d = new Date(t);
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2)
    ].join('');
}

EJS.url = function(obj) {
    if (obj.cdn || !fs.existsSync(path.join(config.outDir, obj.img))) {
        return config.qiniu.bucketUrl + obj.img;
    } else {
        return config.src + obj.img;
    }
}

EJS.video = function(v) {
    return config.qiniu.bucketUrl + v;
}

module.exports = EJS;
