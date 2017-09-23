const mysql = require('mysql')
const log = require('../lib/log')
const config = require('../config')
const pool = mysql.createPool(config.db)

let sql = 'select * from myao'
let pms = []

pool.getConnection(function(err, conn) {
	if (err) {
		log(err.stack)
	}
	log('[SQL]', sql)
	log('[PMS]', pms.toString())
	conn.query(sql, pms, function(err, rows) {
		conn.release()
		if (err) {
			log(err.stack)
		} else {
			log('[ROW]', JSON.stringify(rows))
		}
		pool.end()
	})
})
