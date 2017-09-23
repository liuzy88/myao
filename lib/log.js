function datetime() {
    let d = new Date()
    return [d.getFullYear(), '-',
        ('0' + (d.getMonth() + 1)).slice(-2), '-',
        ('0' + d.getDate()).slice(-2), ' ',
        ('0' + d.getHours()).slice(-2), ':',
        ('0' + d.getMinutes()).slice(-2), ':',
        ('0' + d.getSeconds()).slice(-2)
    ].join('')
}

function log(_) {
    let args = [datetime()]
    for (k in arguments) {
        args.push(arguments[k])
    }
    console.log(args.join(' '))
}

function ip(req) {
    let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    return ip.replace(/::ffff:/, '')
}

function reqlog(req, res, next) {
    log(ip(req), req.method, req.originalUrl), next()
}

log.datetime = datetime

log.reqlog = reqlog

module.exports = log
