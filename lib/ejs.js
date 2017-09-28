const config = require('../config')
const log = require('./log')
const bucketUrl = config.qiniu.bucketUrl
const EJS = {}

EJS.url = function(obj) {
    if (obj.cdn) {
        return bucketUrl + obj.img
    } else {
        return config.src + obj.img
    }
}

module.exports = EJS
