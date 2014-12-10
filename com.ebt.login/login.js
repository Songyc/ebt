define(['text!com.ebt.login/login.html', "../base/util", "../base/openapi", "i18n!../com.ebt.login/nls/login", "i18n!../base/nls/messageResource"],
	function(viewTemplate, Util, OpenAPI, Locale, baseLocale) {
		return Piece.View.extend({
			id: 'com.ebt.login_login',
			checked: '1',
			unChecked: '0',
			events: {
				"click .goBack": "goBack",
				"click .loginbtn": "login",
				"click .remPass": "toggleSel",
			},

			toggleSel: function() {
				//alert($("#rememberPassword")[0].src);
				// var selImg = "../base/img/selected.ing";
				var unSelImg = "../base/img/unselected.ing";
				var rdVal = $("#rd_val").val();
				if (rdVal === this.unChecked) {
					$(".dagou").show();
					console.log(rdVal, this.unChecked);
					$("#rd_val").val(this.checked);
				} else if (rdVal === this.checked) {
					$(".dagou").hide();
					$("#rd_val").val(this.unChecked);
				}
			},

			login: function() {

				//增加登录时网络检测处理
				console.log(navigator);
				var networkState = navigator.network.connection.type || navigator.connection.type;
				//console.log(networkState+'=======================');
				if (Connection.NONE === networkState) {
					//弹出框信息
					new Piece.Toast(baseLocale.network_not_available);
					return;
				}

				if (!Util.checkConnection()) return;

				//1.check account/pwd input value
				var account = $(this.el).find("#account").val();
				var password = $(this.el).find("#password").val();
				var me = this;
				if (account.length <= 0) {
					new Piece.Toast(Locale.acct_could_not_null);
				} else if (password.length <= 0) {
					new Piece.Toast(Locale.pwd_could_not_null);
				} else {
					console.log(OpenAPI.login + '=============================');
					Util.Ajax(
						OpenAPI.login, {
							"accountId": encodeURIComponent(account),
							"password": encodeURIComponent(password)
						},
						null,
						function(data, textStatus, jqXHR) {
							console.log(data, textStatus, jqXHR);
							if (data.resultCode == 0) {
								Piece.Session.saveObject(Util.ACCESS_TOKEN, data.result.access_token);

								Util.Ajax(
									OpenAPI.userDetailInfo, {
										"access_token": data.result.access_token,
										"accountId": encodeURIComponent(account)
									},
									null,
									function(data1, textStatus, jqXHR) {
										// check remember password
										console.info(data1);
										if (data1 == null || data1.resultCode != 0) {
											Piece.Toast(Locale.login_fail);
											return;
										}
										//End
										else {
											// 判断如果没有权限则不进行跳转
											if (data1.result.roles.length < 1) {
												console.log(data1.result.roles.length);
												new Piece.Toast(baseLocale.no_roles);
												return;
											}
											//Save user infomation to session storage
											Piece.Session.saveObject(Util.AC_TYPE, data1.result.actype);
											Piece.Session.saveObject(Util.COMPANY_ID, data1.result.companyId);
											Piece.Session.saveObject(Util.COMPANY_NAME, data1.result.companyName);
											Piece.Session.saveObject(Util.MENUS, data1.result.menus);
											Piece.Session.saveObject(Util.CURRENT_USER_ID, account);
											Piece.Session.saveObject(Util.CURRENT_USER_NAME, data1.result.name);
											Piece.Session.saveObject(Util.ORG_ID, data1.result.orgId);
											Piece.Session.saveObject(Util.ORG_NAME, data1.result.orgName);
											Piece.Session.saveObject(Util.ROLES, data1.result.roles);

											//begin
											var isChecked = ($("#rd_val").val() === me.checked);
											var loginInfo = null;
											if (isChecked) {
												loginInfo = {
													account: account,
													password: password,
													isChecked: isChecked
												};
											}

											Piece.Store.saveObject(Util.LOGIN_INFO_PARAM_NAME, loginInfo);

											if (!Util.checkConnection()) {
												return;
											} else {
												//TODO
												Util.requestCourseList(function() {
													me.navigateModule("com.ebt.course/allCourse", {
														trigger: true
													});
												}, function() {
													new Piece.Toast(baseLocale.request_fail);
												});
											}


											/*if(Util.isMobile()){
												//判断网络
												var netWorkStatus = Util.checkConnection();
												var courseListKey = Util._getCourseKey(Util.CACHE_COURSE_LIST);	
												//真正运行时应该用No network connection
												if(netWorkStatus!=="Unknown connection"){
													new Piece.Toast("网络不给力！");
													var data = Piece.Store.loadObject(courseListKey);
													if(!Util.isNull(data)){
														me.bslLogin();
													}else{
														new Piece.Toast("网络不给力！");
													}													
												}	
											}else{
												me.navigateModule("com.ebt.course/allCourse", {
													trigger: true
												});
											}*/

										}
									},
									null,
									function(xhr, status) {

									},
									null,
									null,
									Util.REQUEST_TYPE,
									"json");
							} else {
								Piece.Toast(data.resultMsg); //TODO i18n待处理 Zping on 20140818
								return;
							}
						},
						null,
						function(xhr, status) {},
						null,
						null,
						Util.REQUEST_TYPE,
						"json");

				}
			},

			//变色龙平台登陆
			bslLogin: function() {
				var me = this;
				var username = $(this.el).find("#account").val();
				var password = $(this.el).find("#password").val();
				var isRemember = ($("#rd_val").val() === this.checked);

				cordova.exec(function(data) {
					console.info("---------------data from bsl when logining-------------");
					console.info(data);

					if ("OK" != data) {
						Piece.Toast(Locale.login_fail);
						return;
					}

					me.navigateModule("com.ebt.course/allCourse", {
						trigger: true
					});
				}, function(err) {
					Piece.Toast(Locale.login_fail);
					console.info("----Error happen, login fail-------");
					console.info(err);
					return;
				}, "CubeLogin", "login", [username, password, isRemember, Piece.Session.loadObject(Util.ACCESS_TOKEN), window.localStorage.lang]);

			},
			render: function() {
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});

				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				var that = this;
				that.saveWindowHeight();
				//write your business logic here :)

				//1.check account/pwd local storage infomation
				var loginInfo = Piece.Store.loadObject(Util.LOGIN_INFO_PARAM_NAME);
				if (loginInfo !== null) {
					$("#account").val(loginInfo.account);
					$("#password").val(loginInfo.password);
					//$('#rememberPassword').attr("checked", true);
					this.toggleSel();
				}
			},
			saveWindowHeight: function() {
				var windowHeight = $(window).height();
				$("body").height(windowHeight);
				Piece.Session.saveObject("windowHeight", windowHeight);
			}
		}); //view define

	});