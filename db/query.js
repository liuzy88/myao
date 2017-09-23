const mysql = require('mysql')
const log = require('../lib/log')
const config = require('../config')
const pool = mysql.createPool(config.db)

function Query(sql, pms) {
	return function(cb) {
		pool.getConnection(function(err, conn) {
			if (err) {
				log(err.stack)
				cb(err, null)
			}
			log('[SQL]', sql)
			log('[PMS]', pms.toString())
			conn.query(sql, pms, function(err, rows) {
				conn.release()
				if (err) {
					log(err.stack)
					cb(err, null)
				} else {
					log('[ROW]', JSON.stringify(rows))
					cb(null, rows)
				}
			})
		})
	}
}

Query.end = function() {
	pool.end()
}

module.exports = Query
