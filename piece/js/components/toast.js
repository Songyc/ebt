/*
 * JS冒泡信息组件,added by lee 2013.09.03。
 */


define(['zepto'], function($) {



	//冒泡提示信息: msg:提示内容, duration:停留时间,isfadeOut:是否自动隐藏
	var Toast = function(msg, duration, isfadeOut) {
		duration = isNaN(duration) ? 2000 : duration;
		var m = document.createElement('div');
		m.innerHTML = msg;
		m.style.cssText = "width:60%; min-width:150px; background:#000; opacity:0.5; color:#fff; line-height:30px; text-align:center; border-radius:5px;font-size:20px; position:fixed; top:80%; left:20%; z-index:999999;padding:5px 0";
		document.body.appendChild(m);
		if (!isfadeOut) {
			setTimeout(function() {
				var d = 0.5;
				m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
				m.style.opacity = '0';
				setTimeout(function() {
					document.body.removeChild(m);
				}, d * 1000);
			}, duration);

		}
		if (isfadeOut) {
			return m;
		}
	};
	return Toast;
});