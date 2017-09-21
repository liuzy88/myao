var path = require('path');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.locals.EJS = require('./lib/EJS');
var config = require('./config');

app.use(require('./lib/logger').reqlog);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload/', express.static(config.outDir));

var DB = require('./db/db');

// start-->
app.use(function(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.header("Pragma", "no-cache"); // HTTP 1.0.
    res.header("Expires", "0"); // Proxies.
    next();
});
app.get('/', function(req, res, next) {
    var params = { page: 1, rows: 10 };
    if (req.query.t == 1) {
        params._orderby = "`like`,`ctime` DESC";
    } else if (req.query.t == 2) {
        params._orderby = "`ctime` DESC";
    } else if (req.query.t == 3) {
        params._where = "`img` NOT LIKE '%.mp4'";
        params._orderby = "`ctime` DESC";
    } else if (req.query.t == 4) {
        params._where = "`img` LIKE '%.mp4'";
        params._orderby = "`ctime` DESC";
    } else {
        params._orderby = "`ctime` DESC";
    }
    if (req.query.p > 0) {
        params.page = req.query.p;
        var count;
        DB.Myao.searchCount(params).then(function(data) {
            count = data[0].num;
            if (params.page > Math.ceil(count / params.rows)) {
                res.end('end');
                return Promise.reject();
            } else {
                return DB.Myao.searchList(params);
            }
        }).then(function(data) {
            res.render('data', { data: data });
        });
    } else {
        var count;
        DB.Myao.searchCount(params).then(function(data) {
            count = data[0].num;
            return DB.Myao.searchList(params);
        }).then(function(data) {
            res.render('index', { data: data });
        });
    }
});
var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;
var uptoken = new qiniu.rs.PutPolicy(config.qiniu.bucket);
uptoken.mimeLimit = 'image/*';
app.get('/uptoken', function(req, res, next) {
    var token = uptoken.token();
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (token) {
        res.json({ uptoken: token });
    } else {
        res.end('token error');
    }
});
app.get('/upload', function(req, res, next) {
    res.render('upload', { bucketUrl: config.bucketUrl, tags: config.tags });
});
app.post('/uploaded', function(req, res, next) {
    if (req.body.hash && req.body.img) {
        var client = new qiniu.rs.Client();
        client.stat(config.qiniu.bucket, req.body.img, function(err, ret) {
            if (err) { // 七牛没有这个文件
                res.end('qiniu file not found.');
            } else { // 有这个文件
                DB.Myao.insert({
                    hash: req.body.hash,
                    img: req.body.img,
                    tag: req.body.tag,
                    text: req.body.text,
                    ctime: req.body.ctime,
                    cdn: 1
                }).then(function(data) {
                    res.end('ok');
                });
            }
        });
    } else {
        res.end('params error.')
    }

});
app.post('/like', function(req, res, next) {
    if (!req.body.id) {
        res.end('end');
        return;
    }
    DB.Myao.like(req.body.id).then(function(data) {
        if (data.affectedRows == 1) {
            res.end('ok');
        } else {
            res.end('no');
        }
    });
});
// <--end

app.use(function(req, res, next) {
    res.status(404).send('404 Not Found');
});

app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('500 Server Error');
});

var server = require('http').createServer(app);
server.on('error', function(e) {
    console.log(e);
});
server.on('listening', function() {
    console.log('Listening on ' + server.address().port);
});
server.listen(process.env.PORT || 1000);
