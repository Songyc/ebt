define(['zepto', 'underscore', 'backbone', 'text!base/components/footer-menu.html', '../util', "../openapi"],
	function($, _, Backbone, MenuHtml, Util, OpenAPI) {

		var Menu = Backbone.View.extend({

			initialize: function() {
				//this.requestData();
				
				this.render();
				
			},
			events: {
				'click #logout': 'logoutApp',
				'click #module_management': 'manageModule',
				'click .footer_icon': 'goToView'
			},
			versionUpdate: function() {
				var that = this;
				that.checkUpdate();
			},
			goToView: function(e) {
				var that = this,
					$target = $(e.target),
					value = $target.attr("data-value"),
					home_url = "com.ebt.course/allCourse",
					info_url = "com.ebt.tools/versionUpdate";
				if (value) {
					switch (value) {
						case "icon_home":
							Backbone.history.navigate(home_url, {
								trigger: true
							});
							break;
						case "icon_info":
							Backbone.history.navigate(info_url, {
								trigger: true
							});
							break;
						case "icon_exit":
							that.logoutApp();
							break;
						default:
							console.log("hah");
					}
				}
			},
			checkUpdate: function() {
				cordova.exec(function(data) {}, function(err) {}, "CubeModuleOperator", "checkUpdate", []);

			},
			logoutApp: function() { //退出程序
				//Call cordova logout
				navigator.notification.confirm(
					'确认注销登录？', // message
					function(buttonIndex) {
						if (buttonIndex == 2) {
							cordova.exec(function(data) {
								console.info("data:----");
								console.info(data);
								window.location.href = "index.html";
							}, function(err) {
								new Piece.Toast(err);
							}, "CubeLogin", "logout", []);
						}
					}, // callback to invoke with index of button pressed
					'提示', // title
					['取消', '确定'] // buttonLabels
				);
			},
			manageModule: function() { //模块管理
				if (Util.isIosFlatform()) {
					cordova.exec(function(data) {
						//TODO
					}, function(err) {}, "CubeModuleOperator", "showModule", ["bsl.cube", "main"]);
				} else if (Util.isAndroidFlatform()) {
					var url = "../phone/index.html";
					window.location.href = url;
				}
			},
			onDeviceReady: function() {
				// Empty
			},
			render: function() {

				var currentUserName = Piece.Session.loadObject('currentUserName');
				var companyName = Piece.Session.loadObject('companyName');
				var orgName = Piece.Session.loadObject('orgName');

				$(this.el).addClass("bar-tab");
				// console.log(this)
				console.log(this,this.el);
				$(this.el).html(MenuHtml);
				$(this.el).html(MenuHtml).find(".footer_info").html(currentUserName + "（" + companyName + " / " + orgName + "）");
				//这里判断是否显示退出,ios则不显示
				if (navigator.userAgent.match(/(iPad|iPhone)/)) {
					$(this.el).find(".footer_icon_exit").hide();
				}
			}
		}, {
			compile: function(contentEl) {
				var me = this;
				return _.map($(contentEl).find("footer.footer-menu"), function(tag) {
					var menu = new Menu({
						el: tag
					});
					return menu;
				});
			}
		});

		return Menu;

	});