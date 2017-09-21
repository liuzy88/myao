var Promise = require('promise');
var mysql = require('mysql');
var Logger = require('../lib/logger');
var db = require('../config').db;
var pool = mysql.createPool(db);

function Query(sql, pms) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                Logger.log(err.stack);
                reject(err.stack);
            }
            Logger.log('[SQL]', sql);
            Logger.log('[PMS]', pms.toString());
            conn.query(sql, pms, function(err, rows) {
                if (err) {
                    Logger.log(err.stack);
                    reject(err.stack);
                }
                Logger.log('[ROW]', JSON.stringify(rows));
                resolve(rows);
                conn.release();
            });
        });
    }.bind(pool));
}

module.exports = Query;
