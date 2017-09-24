var config = {
	dev: false,
	port: 3000,
	inDir: 'D:/myao-temp',
	outDir: 'D:/myao-video',
	ffmpeg: 'D:/ffmpeg/bin/ffmpeg.exe',
	tags: ['萌萌哒', '卡哇伊', '乖宝宝', '美美哒', '好家伙', '小可爱', '小公举', '喜洋洋'],
	db: {
		host: "127.0.0.1",
		port: 3306,
		user: "root",
		password: "111111",
		database: "myao"
	},
	qiniu: {
		bucket: 'myao',
		bucketUrl: 'http://qiniu-myao.liuzy88.com/',
		ACCESS_KEY: '3scrv1nJrq62q8PUGUcKrrv3oMIoXjA4iuLkxApK',
		SECRET_KEY: 'dygNeyxJlEAIr31Wn26JDNFjL8b6PpkVDgUD4HmQ'
	},
	upcb: 'http://myao.liuzy88.com/upcb'
}

if (config.dev) {
	config.qiniu.bucket = 'liuzy'
	config.qiniu.bucketUrl = 'http://qiniu-liuzy.liuzy88.com/'
	config.upcb = 'http://127.0.0.1:1000/upcb'
}

module.exports = config
