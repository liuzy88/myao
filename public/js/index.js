// 导航栏
$('.nav li').on('click', function() {
    !$(this).hasClass('active') && $(this).addClass('active').siblings().removeClass('active');
    nextPage = 2;
    $.get('/?p=1&t=' + $('li[class="active"]').data('id'), function(data) {
        if (data != 'end') {
            $('.items').html(data);
            nextPage++;
        } else {
            pageIsEnd = true;
        }
        $('.items').removeClass('loading');
    });
});
// 回顶
$('.gotop a').click(function() {
    $('body').stop(true, true);
    $('body').animate({ scrollTop: 0 }, 300);
});
// 提示
function showTip(msg) {
    $('.tip').html(msg).fadeIn();
    setTimeout(function() {
        $('.tip').fadeOut();
    }, 1500);
}
// 点赞
function like(id) {
    var likes = JSON.parse(localStorage.getItem('myao_likes')) || {};
    if (likes[id]) return;
    $.post('/like', {
        id: id
    }, function(data) {
        if (data == 'ok') {
            likes[id] = true;
            var em = $('[data-id="' + id + '"]');
            em.html(parseInt(em.text()) + 1);
            localStorage.setItem('myao_likes', JSON.stringify(likes));
        }
    });
    return false;
}
// 加载下一页
var nextPage = 2;
var pageIsEnd = false;

function loading() {
    if (pageIsEnd) return;
    $('.items').addClass('loading');
    $.get('/?p=' + nextPage + '&t=' + $('li[class="active"]').data('id'), function(data) {
        if (data != 'end') {
            if (nextPage % 10 == 0) {
                $('.items').html(data);
            } else {
                $('.items').append(data);
            }
            nextPage++;
        } else {
            pageIsEnd = true;
            showTip('到底了！');
        }
        $('.items').removeClass('loading');
    });
}
// 滚动
var before = $(window).scrollTop();
$(window).scroll(function() {
    var after = $(window).scrollTop();
    // 提前200px加载下一页
    if (after > before && ($(window).height() + $(window).scrollTop() + 200) >= $('body').height()) {
        !$('.items').hasClass('loading') && loading();
    }
    // 视频超出页面停止播放
    if (v) {
        if (before > after) {
            if (before + $(window).height() - $(v).height() / 3 < $(v).offset().top) {
                v.pause();
            }
        } else {
            if (before + $(v).height() / 3 > $(v).offset().top + $(v).height()) {
                v.pause();
            }
        }
    }
    before = after;
});
// 当前操作的视频
var v;
$('video').on('click', function(e) {
    if (v && v == e.target) {
        v.paused ? v.play() : v.pause();
    } else {
        if (v) {
            v.pause();
        }
        e.target.play();
        v = e.target;
    }
});
