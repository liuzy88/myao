var Table = require('./table');
var Query = require('./query');
var PMS = require('./pms');

var DB = {};

function isValue(value) {
    return PMS.isValue(value) && value != '';
}

DB.Myao = new Table('myao', {
	findbyHash: function(hash) {
		var sql = 'SELECT `id` FROM `myao` WHERE `hash`=? LIMIT 1';
		var pms = [hash];
		return Query(sql, pms);
	},
	updatebyHash: function(params) {
		var sql = 'UPDATE `myao` SET `img`=?,`cdn`=? WHERE `hash`=?';
		var pms = [params.img, params.cdn, params.hash];
		return Query(sql, pms);
	},
	like: function(id) {
		var sql = 'UPDATE `myao` SET `like`=`like`+1 WHERE `id`=?';
		var pms = [id];
		return Query(sql, pms);
	}
});

DB.Topic = new Table('reply', {});

module.exports = DB;
