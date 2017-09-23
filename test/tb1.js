const util = require('util')

function Table(name, obj) {
	this.name = name
	this.searchCount = function(params) {
		return 100
	}
	this.test = function(t) {
		console.log(t)
	}
	for(i in obj) {
		this[i] = obj[i]
	}
}

let test = new Table('table_name', {
	add_fn: function(p) {
		console.log(p, this.name)
	},
	test: function(t) {
		console.log('test',t)
	}
})


console.log(test)
test.add_fn(2)
test.test(333)