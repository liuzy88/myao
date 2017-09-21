function tags() {
    var tag = [];
    $('[type="checkbox"]').each(function() {
        if (document.getElementById($(this)[0].id).checked) {
            tag.push($(this).val());
        }
    });
    return tag.join(',');
}

var upfile;

function toupload() {
    if (!upfile) {
        alert('请选择文件');
    } else if (!$('#text').val()) {
        alert('写点什么吧');
    } else {
        $('#upload').attr('disabled', 'disabled');
        $('.uploading').show();
        up.start();
    }
}

function uploaded(hash, key) {
    $.ajax({
        url: '/uploaded',
        type: 'post',
        data: {
            hash: hash,
            img: key,
            tag: tags(),
            text: $('#text').val(),
            ctime: $('#ctime').val()
        },
        success: function(data) {
            up.init();
            $('.uploading').hide();
            $('#upload').removeAttr('disabled');
        },
        error: function(err) {
            up.init();
            $('.uploading').hide();
            $('#upload').removeAttr('disabled');
        }
    });
}
var up = new QiniuJsSDK().uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'up-img',
    uptoken_url: '/uptoken',
    get_new_uptoken: false,
    unique_names: true,
    domain: '<%=bucketUrl%>',
    max_file_size: '10mb',
    flash_swf_url: 'js/Moxie.swf',
    max_retries: 0,
    chunk_size: '2mb',
    auto_start: false,
    init: {
        'FilesAdded': function(up, files) {
            plupload.each(files, function(file) {
                upfile = file.name;
                console.log('FilesAdded:' + file.name);
            });
        },
        'BeforeUpload': function(up, file) {
            console.log('BeforeUpload:' + file.name);
            if (!file.type.startsWith('image/')) {
                alert('文件类型错误');
                up.stop();
            }
        },
        'UploadProgress': function(up, file) {
            console.log('UploadProgress:' + file.name);
        },
        'FileUploaded': function(up, file, info) {
            var r = JSON.parse(info);
            console.log('FileUploaded:' + file.name + ' => ' + r.key + ' ' + r.hash);
            uploaded(r.hash, r.key);
        },
        'Error': function(up, err, errTip) {
            console.log(err, errTip);
        },
        'UploadComplete': function() {},
        'Key': function(up, file) {
            return file.name;
        }
    }
});
