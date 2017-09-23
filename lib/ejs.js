const config = require('../config')
const log = require('./log')
const bucketUrl = config.qiniu.bucketUrl
const EJS = {}

EJS.datetime = log.datetime

EJS.date = function(t) {
    let d = new Date(t)
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2)
    ].join('')
}

EJS.url = function(obj) {
    if (obj.cdn) {
        return bucketUrl + obj.img
    } else {
        return config.src + obj.img
    }
}

EJS.video = function(v) {
    return bucketUrl + v
}

module.exports = EJS
