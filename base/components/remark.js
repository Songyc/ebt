define(["text!../components/remark.html", "../openapi", '../util'],
	function(remarktHtml, OpenAPI, Util) {
		var Remark = Backbone.View.extend({
			id: 'remark',
			initialize: function() {
				this.render();
			},
			render: function() {
				var me = this;
				console.log(this,this.el);
				this.el = remarktHtml;
				// 如果有提示框则不添加
				var Tiplen = $(".remarkTip").length;
				if (Tiplen > 0) {
					return;
				}
				$("body").append(this.el);
			},
			show: function(msg, titile) {
				var me = this;
				if (typeof titile == "undefined") {
					titile = "未定义";
				}
				$(".tip_title").text(titile);
				$(".mainMsg")[0].value = msg;
				$(".remarkTip").show();
				$('.masker').show();
			},
			hide: function() {
				$(".remarkTip").hide();
				$('.masker').hide();
				this.remove();
			}
		});
		return Remark;
	});