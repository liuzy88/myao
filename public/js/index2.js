$(function() {
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
	$(document).scroll(function() {
		let t = $('.item-show video')
		console.log(t.height());
	})
})
