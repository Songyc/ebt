define(['text!com.ebt.tools/versionUpdate.html',"../base/components/footer-menu",'i18n!../com.ebt.tools/nls/versionUpdate','../base/openapi','../base/app'],
	function(viewTemplate,Footer,Locale,OpenAPI,App) {

		return Piece.View.extend({
			id: 'com.ebt.tools_versionUpdate',
			events:{
				"click .leftTop":"goBack",
				"click .checkUpdate":"versionUpdate"
			},
			versionUpdate:function(){
				var footer=new Footer;
				footer.checkUpdate();
			},
			goBack:function(){
				window.history.back();
			},
			render: function() {

				var data = {};
				data.lang = Locale;
				data.App = App;
				var viewT= _.template(viewTemplate,data);

				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			getAppParam:function(){
				console.log(App.getIosAppVersion());
				$('.newVersionNum').text();
			},
			onShow: function() {
				$(".newVersionNum").text();
				//write your business logic here :)
				var that = this;
				// that.getAppParam();
				console.log(Locale);
			}
		}); //view define

	});