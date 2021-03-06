const mysql = require('mysql')
const log = require('../lib/log')
const config = require('../config')
const pool = mysql.createPool(config.db)

function Query(sql, pms) {
    return function(cb) {
        pool.getConnection(function(err, conn) {
            if (err) {
                cb(err, undefined)
            } else {
                log('[SQL]', sql)
                log('[PMS]', pms.toString())
                conn.query(sql, pms, function(err, rows) {
                    conn.release()
                    if (err) {
                        cb(err, undefined)
                    } else {
                        log('[ROW]', JSON.stringify(rows))
                        cb(undefined, rows)
                    }
                })
            }
        })
    }
}

Query.end = function() {
    pool.end()
}

module.exports = Query