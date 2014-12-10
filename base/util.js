define(['zepto', "../base/date", "../base/openapi", "i18n!../base/nls/messageResource"], function($, DateUtil, OpenAPI, baseLocale) {
	var Util = {
		CACHE_TIME: 60000,
		CACHE_FLAG: "YES",
		CACHE_PAGE_URL: "../template/cacheFlag.js",

		REQUEST_TYPE: "GET",

		ACCESS_TOKEN: "accessToken",
		AC_TYPE: "acType",
		COMPANY_ID: "companyId",
		COMPANY_NAME: "companyName",
		MENUS: "menus",
		COURSE_ID: "courseId",
		LESSON_ID: "lessonId",
		INSTRUCTOR_ID: "instructorId",
		STUDENT_ID: "studentId",
		CURRENT_USER_ID: "currentUserId",
		CURRENT_USER_NAME: "currentUserName",
		ORG_ID: "orgId",
		ORG_NAME: "orgName",
		ROLES: "roles",
		islogout: false,
		// 待上传与待完成路径，用来判断是否显示loader的关闭按钮
		toBeFinishLocation: "#com.ebt.toBeFinish/toBeFinish",
		ResultsUploadLocation: "#com.ebt.ResultsUpload/ResultsUpload",

		//登陆信息参数
		LOGIN_INFO_PARAM_NAME: "login_info",

		//缓存键名定义
		//1.课程列表
		CACHE_COURSE_LIST: "courseList_",
		//个人能力分析
		CACHE_USER_ABILITY: "userAbility_",

		//---包括课时明细数据
		//2.待上传课时列表(数组）
		CACHE_PEND_LESSON_LIST: "pendLessonList_",
		//3.待完成课时列表（数组）
		CACHE_UNFI_LESSON_LIST: "unfiLessonList_",
		//4.已上传课时列表(数组）
		CACHE_DONE_LESSON_LIST: "doneLessonList_",
		//---

		//---
		//课程下载
		DOWNLOAD_COURSES: "downloadCourses_",
		//课程的下载状态
		DOWNLOAD_STATUS_ARR: "downloadStatusArr_",
		//课程上传状态
		UPLOAD_STATUS_ARR: "uploadloadStatusArr_",
		//---

		//---包括课时明细数据
		//5.待上传课时列表回显(数组)
		CACHE_PEND_LESSON_LIST_4_DISP: "pendLessonList4Disp_",
		//6.待完成课时列表回显（数组）
		CACHE_UNFI_LESSON_LIST_4_DISP: "unfiLessonList4Disp_",
		//7.已上传课时列表回显(数组）
		CACHE_DONE_LESSON_LIST_4_DISP: "doneLessonList4Disp_",
		//---

		//---不包括课时明细数据
		//8.待上传课时纯列表(数组)
		CACHE_PEND_LESSON_LIST_4_SRH: "pendLessonList4Srh_",
		//9.待完成课时纯列表(数组）
		CACHE_UNFI_LESSON_LIST_4_SRH: "unfiLessonList4Srh_",
		//10.已上传课时纯列表(数组）
		CACHE_DONE_LESSON_LIST_4_SRH: "doneLessonList4Srh_",
		//---

		//缓存类型
		//0.待上传课时列表
		CACHE_TYPE_PEND: 0,
		//1.待完成课时列表
		CACHE_TYPE_UNFI: 1,
		//3.待上传课时列表回显	
		CACHE_TYPE_PEND_4_DISP: 3,
		//4.待完成课时列表回显
		CACHE_TYPE_UNFI_4_DISP: 4,
		//5.已上传课时列表回显
		CACHE_TYPE_DONE: 5,
		loader: null,
		goback: function(that) {
			
		},
		isIosFlatform: function() {
			if (navigator.userAgent.match(/(iPad|iPhone)/)) {
				return true;
			} else {
				return false;
			}
		},

		isAndroidFlatform: function() {
			if (navigator.userAgent.match(/(Android)/)) {
				return true;
			} else {
				return false;
			}
		},
		isMobile: function() {
			if (Util.isIosFlatform() || Util.isAndroidFlatform()) {
				return true;
			} else {
				return false;
			}
		},
		/*
		 * liuqiang on 20140728
		 * url参数解析传入url路径
		 * 返回解析后的参数对象
		 */
		parseUrl: function(url) {
			var params,
				ParamArr,
				subParam = [],
				ParamObj = {};
			if (!url) {
				url = location.href;
			}
			params = url.split("?")[1];
			if (!params) {
				return;
			}
			ParamArr = params.split("&");
			for (var i = 0; i < ParamArr.length; i++) {
				subParam = ParamArr[i].split("=");
				ParamObj[subParam[0]] = subParam[1];
			}
			return ParamObj;
		},
		//添加各个页面的提示信息
		ResultWarn: function(el, messageResult) {
			//首先要去查找这个dom中是不是存在.noResultWarn这个div
			var warnHtml = el.getElementsByClassName("noResultWarn")[0];
			if (typeof warnHtml !== "undefined" && warnHtml !== null) {
				$(warnHtml).html("");
				$(warnHtml).html(messageResult);
			} else {
				warnHtml = "<div class=\'noResultWarn\'>" + messageResult + "</div>";
				$(el).append(warnHtml);
			}
		},
		//在提示之前,首先要请清除原来的提示内容,因为只是采用绝对定位，脱离了常规刘，并且是直接添加在el(page)的，所以需要清除
		clearWarn: function(el) {
			var warnHtml = el.getElementsByClassName("noResultWarn")[0];
			if (typeof warnHtml !== "undefined" && warnHtml !== null) {
				el.removeChild(warnHtml);
			}
		},
		isNull: function(data) {
			var def = true,
				tostr = Object.prototype.toString;
			// 如果def还是为true则判断data是否undefined
			if (typeof data == "boolean") {
				if (!data) {
					def = false;
				}
			}
			if (typeof data == "string") {
				data = data.trim();
				if (data.length !== 0) {
					def = false;
				}
			}
			if (typeof data == "number") {
				def = false;
			}
			if (typeof data == "object") {
				// 如果是对象并且是null不用管
				// 如果是对象并且是array判断长度
				if (Array.isArray && Array.isArray(data) || tostr.call(data) == "[object Array]") {
					if (data.length > 0) {
						def = false;
					}
					// 如果是对象并且是object
				} else if (tostr.call(data) == "[object Object]") {
					if (Object.keys && Object.keys(data).length > 0) {
						def = false;
					} else {
						var sum = 0;
						for (var i in data) {
							sum++;
						}
						if (sum > 0) {
							def = false;
						}
					}

				}
			}
			return def;
		},
		// 参数的顺序分别为请求路径,参数,请求前回调,成功回调,失败回调,完成回调,是否显示loader框,页面参数对象(用来缓存数据),请求类型（get/post),数据类型（json/jsonp...)
		Ajax: function(urls, datas, beforeFun, successCallback, errorCallback, completeCallback, loaderhide, paramsObj, types, dataTypes, isruncallback) {
			var me = this;

			if (typeof paramsObj === "object" && !this.isNull(paramsObj)) {
				console.log(paramsObj);
				var cacheData = Piece.Session.loadObject(paramsObj.cacheId + "-data");
				var cacheParams = Piece.Session.loadObject(paramsObj.cacheId + "-params");
				//如果参数相同从缓存拿数据
				urls = (cacheData !== null && !paramsObj.isReloadRequest) ? Util.CACHE_PAGE_URL : urls;
			}
			console.log(urls);
			var loader;
			me.isCanceled = false;
			$(document).unbind("ajaxStart").bind("ajaxStart", function() {
				console.log("Triggered ajaxStart handler.");
				if (loaderhide) {} else {
					me.loader = new Piece.Loader({
						autoshow: true, //是否初始化时就弹出加载控件
						target: 'body' //页面目标组件表识
					});
				}
				// 如果是带上传页面或者待完成页面就删除关闭按钮
				var localhref = location.hash;
				if (localhref == me.toBeFinishLocation || localhref == me.ResultsUploadLocation) {
					$(".cube-flight-loader-cancel").hide();
				}
				$(".cube-flight-loader-cancel img").unbind("click").bind("click", function() {
					me.loader.hide();
					me.isCanceled = true;
				});
			});
			$(document).unbind("ajaxStop").bind("ajaxStop", function() {
				console.log("Triggered ajaxStop handler.");
				if (!me.isCanceled && !loaderhide) {
					me.loader.hide();
				}
			});
			if (!this.checkConnection()) {
				new Piece.Toast(baseLocale.network_not_available);
				return;
			};
			$.ajax({
				timeout: 15 * 1000,
				url: urls,
				data: datas,
				type: types,
				dataType: (this.isNull(dataTypes) ? "json" : dataTypes),
				beforeSend: function(xhr, settings) {
					if (beforeFun !== null && beforeFun !== undefined) {
						beforeFun(xhr);
					}
				},
				success: function(data, textStatus, jqXHR) {
					console.log("success");

					if (!me.isCanceled) {
						// 判断是否有缓存
						if (typeof paramsObj === "object" && !me.isNull(paramsObj)) {
							if (data.loadDataFromCache === me.CACHE_FLAG) {
								console.info("Result load from cache");
								data = cacheData;
							} else {
								console.info("Result load from online request");
								Piece.Session.saveObject(paramsObj.cacheId + "-data", data);
								Piece.Session.saveObject(paramsObj.cacheId + "-params", datas);
							}
						}
						//token过期处理
						if (me.logout(data)) {
							me.islogout = true;
							return false;
						}
						//过滤系统异常
						if (isruncallback) {
							if (successCallback !== null && successCallback !== undefined) {
								successCallback(data, textStatus, jqXHR);
							}
						} else if (data.resultCode !== 0) {
							//new Piece.Toast(data.resultMsg + "(" + data.result + ")" + baseLocale.tip);
							new Piece.Toast(data.resultMsg);
							return false;
						} else if (successCallback !== null && successCallback !== undefined) {
							// 如果页面没有跳转则执行回调函数

							successCallback(data, textStatus, jqXHR);
						}
					}
				},
				error: function(e, xhr, type) {
					//console.log("error");
					// 如果isruncallback为true则执行传入的callback
					// 否则如果是超时则统一提示超时，如果是其他错误则执行callback，没有callback在执行统一提示
					if (isruncallback) {
						if (errorCallback !== null && errorCallback !== undefined) {
							errorCallback(e, xhr, type);
						}
					} else if (xhr == "timeout") {
						new Piece.Toast(baseLocale.request_timeout);
					} else if (!me.isCanceled) {
						if (errorCallback !== null && errorCallback !== undefined) {
							errorCallback(e, xhr, type);
						} else {
							new Piece.Toast(baseLocale.request_fail);
						}
					}
				},
				complete: function(xhr, status) {
					// 如果token过期就不执行回调了
					if (me.islogout) {
						return;
					}
					console.log("complete");
					if (!me.isNull(paramsObj)) { //如果有缓存参数
						paramsObj.isReloadRequest = false; //每次完成后重置为从缓存取值
					}
					if (_.isFunction(completeCallback)) {
						completeCallback(xhr, status);
					}
				}
			});
		},
		ajaxPost: function(url, param, beforeFun, succFun, errorFun, compFun, loaderhide) {
			console.log(param);
			var me = this;
			var loader,
				isCanceled = false;
			$.ajax({
				url: url,
				type: "POST",
				data: JSON.stringify(param),
				contentType: "application/json",
				beforeSend: function(xhr) {
					// 如果loadershow为true的话就设置成不显示
					if (loaderhide) {} else {
						loader = new Piece.Loader({
							autoshow: true, //是否初始化时就弹出加载控件
							target: 'body' //页面目标组件表识
						});
					}
					$(".cube-loader-cancel").unbind("click").bind("click", function() {
						loader.hide();
						isCanceled = true;
					});

					if (beforeFun !== null && beforeFun !== undefined) {
						beforeFun(xhr);
					}
				},
				success: function(data, textStatus, jqXHR) {
					//回调给html页面处理data
					console.log('==============success');
					//token过期处理
					if (me.logout(data)) {
						me.islogout = true;
						return false;
					}
					//过滤系统异常
					if (data.resultCode !== 0) {
						//								new Piece.Toast(data.resultMsg + "(" + data.result + ")" + baseLocale.tip);
						new Piece.Toast(data.resultMsg);
						return false;
					}
					if (!isCanceled) {
						if (succFun !== null && succFun !== undefined) {
							// 如果页面没有跳转则执行回调函数
							succFun(data, textStatus, jqXHR);
						}
					}
				},
				error: function(e, xhr, type) {
					if (xhr == "timeout") {
						new Piece.Toast(baseLocale.request_timeout);
					}
					if (!isCanceled) {
						if (errorCallback !== null && errorCallback !== undefined) {
							errorCallback(e, xhr, type);
						} else {
							new Piece.Toast(baseLocale.request_fail);
							return;
						}
					}
				},
				complete: function(xhr, status, data) {
					// 如果token过期就不执行回调了
					if (me.islogout) {
						return;
					}
					if (!isCanceled && !loaderhide) {
						loader.hide();
					}
					if (compFun !== null && compFun !== undefined) {
						compFun(xhr, status, data);
					}
				}
			});

		},
		logout: function(data) {
			var me = this;
			var rtf = false;
			if (!this.isNull(data)) {
				//data == -4是为了匹配调用原生返回的数据
				if ((!this.isNull(data.resultCode) && data.resultCode === -4) || data == -4) {
					rtf = true;
					navigator.notification.confirm(
						baseLocale.session_timeout, // message
						function(buttonIndex) {
							if (buttonIndex == 1) {
								cordova.exec(function(data) {
									//Updated by Zping on 20140512
									//登录页面url，用于token等
									window.location.href = "index.html";
									// window.location.href = Piece.Store.loadObject(me.LOGIN_URL);
								}, function(err) {
									new Piece.Toast(baseLocale.logout_fail);
									new Piece.Toast(err);
								}, "CubeLogin", "logout", []);
							}
						}, // callback to invoke with index of button pressed
						baseLocale.alert, // title
						[baseLocale.ok] // buttonLabels
					);
				}
			}
			return rtf;
		},
		/*
		 * sqhom on 20140727
		 * 解析URL参数
		 */
		request: function(paras) {
			var url = location.href;
			var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");

			var returnValue;
			for (i = 0; i < paraString.length; i++) {
				var tempParas = paraString[i].split('=')[0];
				var parasValue = paraString[i].split('=')[1];

				if (tempParas === paras)
					returnValue = parasValue;
			}

			if (typeof(returnValue) == "undefined") {
				return "";
			} else {
				return returnValue;
			}

		},
		/*
		 * sqhom on 20140818
		 * 获取学员个人能力分析key
		 */
		_getUserAbilityKey: function(prefix) {
			if (!this.isNull(prefix)) {
				return prefix + Piece.Session.loadObject(this.CURRENT_USER_ID);
			} else {
				return null;
			}

		},
		/*
		 * sqhom on 20140818
		 * 获取学员最新的个人能力分析到缓存
		 */
		requestUserAbility: function(successCallback, errorCallback) {
			var me = this;
			this.Ajax(
				OpenAPI.getUserAbility, {
					"studentId": Piece.Session.loadObject(me.CURRENT_USER_ID),
					"access_token": Piece.Session.loadObject(me.ACCESS_TOKEN)
				},
				null,
				function(data, textStatus, jqXHR) {
					if (data == null || data.resultCode != 0) {
						return null;
					}

					//var userAbilityKey = me._getUserAbilityKey(me.CACHE_USER_ABILITY);

					//Piece.Store.saveObject(userAbilityKey, data);

					//回调给html页面处理
					if (successCallback !== null && successCallback !== undefined) {
						successCallback(data, textStatus, jqXHR);
					}
				},
				function(e, xhr, type) {
					console.error("---Error happens when requestCourseList---");
					console.error(e);

					//回调给html页面处理d
					if (errorCallback !== null && errorCallback !== undefined) {
						errorCallback(e, xhr, type);
					}

				},
				function(xhr, status) {},
				null,
				null,
				me.REQUEST_TYPE,
				"json"
			);

		},
		/*
		 * Zping on 20140730
		 * 获取最新课程列表到缓存
		 */
		requestCourseList: function(successCallback, errorCallback) {
			var me = this;
			this.Ajax(
				OpenAPI.courseListInfo, {
					"actype": Piece.Session.loadObject(me.AC_TYPE),
					"companyId": Piece.Session.loadObject(me.COMPANY_ID),
					"access_token": Piece.Session.loadObject(me.ACCESS_TOKEN)
				},
				null,
				function(data, textStatus, jqXHR) {
					if (data == null || data.resultCode != 0) {
						return null;
					}

					var courseListKey = me._getCourseKey(me.CACHE_COURSE_LIST);

					Piece.Store.saveObject(courseListKey, data);

					//回调给html页面处理
					if (successCallback !== null && successCallback !== undefined) {
						successCallback(data, textStatus, jqXHR);
					}
				},
				function(e, xhr, type) {
					console.error("---Error happens when requestCourseList---");
					console.error(e);

					//回调给html页面处理d
					if (errorCallback !== null && errorCallback !== undefined) {
						errorCallback(e, xhr, type);
					}

				},
				function(xhr, status) {},
				null,
				null,
				me.REQUEST_TYPE,
				"json"
			);

		},
		/*
		 * liuq on 20140725
		 * 删除课程列表指定课程
		 * type为year表示要删除的年份对象，为course表示要删除的课程
		 * id表示年份或者课程id
		 */

		delCourseListData: function(type, yearId, courseId) {
			var courseListKey = Util._getCourseKey(Util.CACHE_COURSE_LIST);
			var data = Piece.Store.loadObject(courseListKey);
			if (type == "year") {
				_.each(data.result, function(item, index) {
					if (item.year == yearId) {
						data.result.splice(index, 1);
					}
				});
			} else if (type == "course") {
				_.each(data.result, function(item, index) {
					if (item.year == yearId) {
						_.each(item.courses, function(month_item, month_index) {
							if (month_item.courseId == courseId) {
								item.courses.splice(month_index, 1);
							}
						});
					}
				});
			}
			Piece.Store.saveObject(courseListKey, data);
		},
		/*
		 * Zping on 20140725
		 * 查询课程列表
		 * criteriaObj-json对象，对象属性名要和缓存中的结果集中对应的属性名一致
		 */
		queryCourseList: function(criteriaObj) {
			var courseListKey = this._getCourseKey(this.CACHE_COURSE_LIST);

			var courseList = Piece.Store.loadObject(courseListKey);

			if (!this.isNull(courseList) && !this.isNull(criteriaObj)) {

				//先过滤第一层
				courseList.result = this._filterCourses(courseList.result, criteriaObj);

				console.info(courseList);

				//过滤第二层
				for (var i = courseList.result.length - 1; i >= 0; i--) {
					courseList.result[i].courses = this._filterCourses(courseList.result[i].courses, criteriaObj);
				};

				//清除没有课时的课程
				for (var j = courseList.result.length - 1; j >= 0; j--) {
					if (_.isArray(courseList.result[j].courses) &&
						courseList.result[j].courses.length == 0) courseList.result.splice(j, 1);
				};

			}


			if (this.isNull(courseList) || this.isNull(courseList.result) || this.isNull(courseList.result[0].courses)) {
				/*courseList = {};*/
				courseList = null;
			}

			return courseList;

		},

		_filterCourses: function(oriCourses, criteriaObj) {
			//保存满足搜索条件的item的下标
			var hasCriteria = this.isNull(criteriaObj) ? false : true;

			var indexArray = []; //有查询条件并且命中的结果下标将存放在这里
			var me = this;
			$.each(oriCourses, function(index, item) {

				var hit = true;
				for (var p in criteriaObj) {
					if (!me.isNull(criteriaObj[p]) && !me.isNull(item[p]) && (item[p] + "").indexOf(criteriaObj[p]) === -1) {

						hit = false; //只有全部查询条件都满足才能命中
						break;
					}
				}

				if (hit) indexArray.push(index);
			});

			//只保留下标数组里面相对应的元素
			if (hasCriteria) {
				oriCourses = _.filter(oriCourses, function(item, index) {
					return _.contains(indexArray, index);
				});
			}

			return oriCourses;
		},



		/*
		 * Zping on 20140806
		 * 查询待上传课程列表
		 * criteriaObj-json对象，对象属性名要和缓存中的结果集中对应的属性名一致
		 * type - 类型 3.待上传课时列表回显， 4.待完成课时列表回显， 5.已上传课时列表回显
		 * 如果有课时时间，使用lessonTime，会和startTime与endTime相比较
		 */
		queryLessonList: function(criteriaObj, type) {

			var me = this;
			var constantType = this._getKeyByType4Srh(type);

			var cacheLessonList = Piece.Store.loadObject(constantType);

			if (!this.isNull(cacheLessonList) && !this.isNull(criteriaObj)) {

				this._filterRecursive(cacheLessonList, criteriaObj);
				console.info("---cacheLessonList---");
				console.info(cacheLessonList);
			}

			return cacheLessonList;

		},

		//递归过滤
		_filterRecursive: function(objArr, criteriaObj) {
			//循环对象/数组中的元素，如果元素又是对象或者数组，递归
			//如果不是，则判断是否匹配查询条件，如果包含了查询条件字段但是值不同，则剔除该对象
			var me = this;
			if (_.isArray(objArr)) {

				//先过滤含有字符串的对象			
				var unHitIndexs = []; //存储要剔除的对象下标
				_.each(objArr, function(obj, index) {
					for (var p in obj) {
						if (!me.isNull(criteriaObj[p]) && !me.isNull(obj[p]) && (obj[p] + "").indexOf(criteriaObj[p] + "") === -1) {

							unHitIndexs.push(index);
							break;
						}
					}
				})

				//根据下标剔除数组中的对象
				//要先排序，先删除下标大的元素，再删除下标小的，不然删除后的数组重新排序会导致删除出错
				if (unHitIndexs.length > 0) {
					unHitIndexs.sort(function(a, b) {
						return a - b;
					});
					for (var k = unHitIndexs.length - 1; k >= 0; k--) {
						objArr.splice(unHitIndexs[k], 1);
					};
				}

				//再过滤对象中的数组
				unHitIndexs = []; //存储要剔除的对象下标
				_.each(objArr, function(obj, index) {

					for (var p in obj) {
						if (_.isArray(obj[p])) {
							//递归
							me._filterRecursive(obj[p], criteriaObj);
						} else if (_.isObject(obj[p])) {
							//认为是课时对象
							var o = obj[p];
							//增加日期过滤
							var isDateFilter = false;
							//var aaaa = criteriaObj["lessonDate"];
							if (!me.isNull(criteriaObj["lessonTime"])) {
								var startTime = o["startTime"];
								var endTime = o["endTime"];
								if (_.isString(startTime) && _.isString(endTime)) {
									startTime = DateUtil.StringToDate(startTime, "/").getTime();
									endTime = DateUtil.StringToDate(endTime, "/").getTime();
									var lessonTime = DateUtil.StringToDate(criteriaObj["lessonTime"], "/").getTime();

									if (lessonTime < startTime || lessonTime > endTime) {
										unHitIndexs.push(index);
										isDateFilter = true;
									};
								}
							}
							//增加日期结束
							//如果日期判断过了并且被过滤则无需再判断
							if (!isDateFilter) {
								for (var a in o) {
									if (!me.isNull(criteriaObj[a]) && !me.isNull(o[a]) && (o[a] + "").indexOf(criteriaObj[a] + "") === -1) {

										unHitIndexs.push(index);
										break;
									}
								}
							}

						}
					}

				})

				//根据下标剔除数组中的对象
				//要先排序，先删除下标大的元素，再删除下标小的，不然删除后的数组重新排序会导致删除出错
				if (unHitIndexs.length > 0) {
					unHitIndexs.sort(function(a, b) {
						return a - b;
					});
					for (var k = unHitIndexs.length - 1; k >= 0; k--) {
						objArr.splice(unHitIndexs[k], 1);
					};
				}

			}
		},

		/*
		 * sqhom on 20140730
		 * 检测网络状态
		 */
		checkConnection: function() {
			var networkState = navigator.network.connection.type || navigator.connection.type;
			if (Connection.NONE === networkState) {
				new Piece.Toast(baseLocale.network_not_available);
				return false;
			}

			return true;
			/*var states = {};
			states[Connection.UNKNOWN] = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI] = 'WiFi connection';
			states[Connection.CELL_2G] = 'Cell 2G connection';
			states[Connection.CELL_3G] = 'Cell 3G connection';
			states[Connection.CELL_4G] = 'Cell 4G connection';
			states[Connection.NONE] = 'No network connection';
			return states[networkState];*/
		},



		/*
		 * zping on 20140729
		 * 下载单个课程, 保存到课程json对象中，如{"1":data1, "2":data2}, 并且更新课程状态
		 * courseId - 课程id
		 */
		downloadCourse: function(courseId, successCallback, errorCallback) {

			var me = this;
			var accessToken = Piece.Session.loadObject(this.ACCESS_TOKEN);
			var downloadCoursesKey = this._getCourseKey(this.DOWNLOAD_COURSES);

			var downloadCourses = Piece.Store.loadObject(downloadCoursesKey);

			this.Ajax(OpenAPI.courseDetailInfo, {
					"access_token": accessToken,
					"dataType": OpenAPI.dataType,
					"courseId": courseId
				}, null, function(data, textStatus, jqXHR) {

					if (data.resultCode == 0) {
						//save data
						if (me.isNull(downloadCourses)) downloadCourses = {};

						downloadCourses[courseId] = data;
						Piece.Store.saveObject(downloadCoursesKey, downloadCourses);

						//更新课程下载状态, 把已下载的课程id放进已下载数组中
						var downloadStatusArrKey = me._getCourseKey(me.DOWNLOAD_STATUS_ARR);

						var downloadStatusArr = Piece.Store.loadObject(downloadStatusArrKey) || [];

						if (!_.contains(downloadStatusArr, courseId)) {
							downloadStatusArr.push(courseId);
							Piece.Store.saveObject(downloadStatusArrKey, downloadStatusArr);
						}

						//回调给html页面处理
						if (successCallback !== null && successCallback !== undefined) {
							successCallback(data, textStatus, jqXHR);
						}
					}

				}, function(e, xhr, type) {
					console.error("---Error happens when downloadCourse---");
					console.error(e);
					//回调给html页面处理d
					if (errorCallback !== null && errorCallback !== undefined) {
						errorCallback(e, xhr, type);
					}
				},
				null,
				null,
				null,
				me.REQUEST_TYPE,
				"json");
		},

		/*
		 * Zping on 20140730
		 * 获取单个已下载课程
		 */
		getDownloadCourse: function(courseId) {
			var downloadCoursesKey = this._getCourseKey(this.DOWNLOAD_COURSES);

			var downloadCourses = Piece.Store.loadObject(downloadCoursesKey);

			if (!this.isNull(downloadCourses)) {
				return downloadCourses[courseId];
			} else {
				return null;
			}
		},
		/*
		 * liuqiang on 20140730
		 * 删除单个已下载课程
		 */
		delDownloadCourse: function(courseId) {
			var downloadCoursesKey = this._getCourseKey(this.DOWNLOAD_COURSES);
			var downloadCourses = Piece.Store.loadObject(downloadCoursesKey);
			var downloadStatusArrKey = this._getCourseKey(this.DOWNLOAD_STATUS_ARR);
			var downloadStatusArr = Piece.Store.loadObject(downloadStatusArrKey);
			var statusindex = downloadStatusArr.indexOf(downloadCoursesKey);
			downloadStatusArr.splice(statusindex, 1);
			Piece.Store.saveObject(downloadStatusArrKey, downloadStatusArr);
			delete downloadCourses[courseId];
			Piece.Store.saveObject(downloadCoursesKey, downloadCourses);

		},
		/*liuqiang 20141021
		 *验证分数上否有上传资格
		 *有资格就上传
		 *
		 */
		checkuploadLessonsCount: 0,
		checkpfUploadResult: {
			pf: {
				errorResult: [],
				succResult: []
			},
			pnf: {
				errorResult: [],
				succResult: []
			}
		},
		checkStudent: function(uploadParam, completeCallback) {
			var that = this;
			if (!Util.checkConnection()) {
				return;
			}
			that.checkpfUploadResult = {
				pf: {
					errorResult: [],
					succResult: []
				},
				pnf: {
					errorResult: [],
					succResult: []
				}
			};
			that.checkuploadLessonsCount = uploadParam.length;
			that._checkStudent(uploadParam, completeCallback);
		},
		// 先判断pf是否符合，在判断pnf是否符合
		_checkStudent: function(uploadParam, completeCallback) {
			console.log(uploadParam);
			var that = this,
				Paramitem = uploadParam[that.checkuploadLessonsCount - 1],
				studentId = Paramitem.studentId,
				pnf = Paramitem.pnf,
				access_token = Piece.Session.loadObject("accessToken");
			var pfParams = {
				"accountId": studentId,
				"student": true,
				"access_token": access_token
			};
			var pnfParams = {
				"accountId": pnf,
				"access_token": access_token
			};
			Util.Ajax(
				OpenAPI.exists,
				pfParams,
				function(xhr, settings) {},
				function(data, text, jqHRX) {
					if (data && data.result !== null && data.resultCode === 0) {
						// 如果有资格上传则上传
						if (data.result.exists) {
							that.checkpfUploadResult.pf.succResult.push(studentId);
						} else {
							that.checkpfUploadResult.pf.errorResult.push(studentId);
						}
					}
				},
				function(e, xhr, type) {

				},
				function(xhr, status) {
					// 如果有pnf就验证
					if (Paramitem.pnf) {
						that._checkpnfStudent(pnfParams, uploadParam, completeCallback);
					} else {
						that.checkuploadLessonsCount--;
						if (that.checkuploadLessonsCount > 0) {
							that._checkStudent(uploadParam, completeCallback);
						} else if (_.isFunction(completeCallback)) {
							completeCallback(that.checkpfUploadResult);
						}
					}
				}
			);
		},
		_checkpnfStudent: function(param, uploadParam, completeCallback) {
			var that = this;
			Util.Ajax(
				OpenAPI.exists,
				param,
				function(xhr, settings) {},
				function(data, text, jqHRX) {
					if (data && data.result !== null && data.resultCode === 0) {
						// 如果有资格上传则上传
						if (data.result.exists) {
							that.checkpfUploadResult.pnf.succResult.push(param.accountId);
						} else {
							that.checkpfUploadResult.pnf.errorResult.push(param.accountId);
						}
					}
				},
				function(e, xhr, type) {

				},
				function(xhr, status) {
					that.checkuploadLessonsCount--;
					if (that.checkuploadLessonsCount > 0) {
						that._checkStudent(uploadParam, completeCallback);
					} else if (_.isFunction(completeCallback)) {
						completeCallback(that.checkpfUploadResult);
					}
				}
			);
		},
		/*
		 * zping on 20140729
		 * 上传课时, 并且更新课时状态
		 * paramsObjArr - [{courseId + lessonId + instructorId + studentId + type}]
		 */
		uploadLessons: function(paramsObjArr, completeCallback, iftrial) {

			var me = this;
			var lessons = [];
			var lesson = null;
			for (paramsObj in paramsObjArr) {
				lesson = this.getLessonInfoFromCacheByType(paramsObjArr[paramsObj], paramsObjArr[paramsObj].type)
				if (_.isObject(lesson)) lessons.push(lesson);
			}

			if (lessons.length > 0) {
				me.uploadResult = {
					errorResult: [],
					succResult: []
				};
				me.uploadLessonsCount = lessons.length;
				me._uploadLessons(paramsObjArr, lessons, me, completeCallback, iftrial);
			}

		},

		/*
		 * zping on 20140731
		 * 递归上传打分课时
		 * lesson - 课时打分信息
		 * me - this对象
		 */
		uploadLessonsCount: 0,
		uploadResult: {
			errorResult: [],
			succResult: []
		},
		_uploadLessons: function(paramsObjArr, lessons, me, completeCallback, iftrial) {
			var lesson = lessons[me.uploadLessonsCount - 1];
			//paramsObj应该与lesson次序一一对应，注意检查
			var paramsObj = paramsObjArr[me.uploadLessonsCount - 1];

			//var me = this;

			// lesson.access_token = Piece.Session.loadObject(this.ACCESS_TOKEN);
			var uploadData = "data=" + JSON.stringify(lesson) + "&access_token=" + Piece.Session.loadObject(this.ACCESS_TOKEN);
			if (typeof iftrial !== "undefined") {
				uploadData = uploadData + "&trial=" + true;
			}
			this.Ajax(
				OpenAPI.scoreUpload,
				uploadData,
				null,
				function(data, textStatus, jqXHR) {
					paramsObj.resultData = data; //返回上传后结果消息

					if (data.resultCode == 0) {
						// 如果为测试是否通过则不清除数据(用来回显)
						me.cacheLessonInfoByType(paramsObj, lesson, me.CACHE_TYPE_DONE, iftrial);
						me.uploadResult.succResult.push(paramsObj);
					} else {
						me.uploadResult.errorResult.push(paramsObj);
					}


				},
				function(e, xhr, type) {
					console.error("---Error happens when _uploadLesson---");
					console.error(e);

					paramsObj.resultErr = e; //返回上传后错误结果消息
					me.uploadResult.errorResult.push(paramsObj);
				},
				function(xhr, status) {
					//if (data.resultCode == 0) {
					me.uploadLessonsCount--;
					if (me.uploadLessonsCount > 0) {
						me._uploadLessons(paramsObjArr, lessons, me, completeCallback, iftrial);
					} else if (_.isFunction(completeCallback)) {
						completeCallback(me.uploadResult);
					}


					//}
				},
				null,
				null,
				"POST",
				"json",
				true);
		},

		/*
		 * zping on 20140729
		 * 缓存不同类型的课时信息（已完成课时，待完成课时，已上传课时）
		 * paramsObj - 参数对象 （包含courseId/lessonId/instructorId/studentId)
		 * jsonObj - 保存有打分信息的json对象
		 * type - 类型 0.待上传课时， 1.待完成课时， 3.待上传课时列表回显， 4.待完成课时列表回显， 5.已上传课时列表回显
		 */
		cacheLessonInfoByType: function(paramsObj, jsonObj, type, iftrial) {

			if (this.isNull(jsonObj) || this.isNull(paramsObj) || this.isNull(type)) return;

			var constantType = this._getKeyByType(type);

			//以登录用户为单位构建打分成绩数组，
			var cachePendLessonList = Piece.Store.loadObject(constantType);
			if (this.isNull(cachePendLessonList)) cachePendLessonList = {};

			var currentDate = new Date();
			var currentYear = currentDate.getFullYear();
			var currentMonth = currentDate.getMonth() + 1;

			//key为courseId+lessonId+instructorId+studentId
			var lessonKey = this._generateLessonKey(paramsObj);

			//为回显保存年月信息
			if (type == this.CACHE_TYPE_PEND_4_DISP || type == this.CACHE_TYPE_UNFI_4_DISP) {
				jsonObj.year = currentYear;
				jsonObj.month = currentMonth;
			}

			cachePendLessonList[lessonKey] = jsonObj;

			Piece.Store.saveObject(constantType, cachePendLessonList);

			//构建数据用于列表显示
			var constantType4Srh = this._getKeyByType4Srh(type);
			if (!this.isNull(constantType4Srh)) {
				var cacheLesson4Srh = Piece.Store.loadObject(constantType4Srh);
				if (this.isNull(cacheLesson4Srh)) cacheLesson4Srh = [];

				var currentYearLessonInfo = _.where(cacheLesson4Srh, {
					"year": currentYear
				});

				//判断是否存在同一年的课时信息
				if (this.isNull(currentYearLessonInfo)) {

					currentYearLessonInfo = {};
					currentYearLessonInfo.year = currentYear;
					currentYearLessonInfo.months = [];
					currentYearLessonInfo.months =
						this.arrPush(currentYearLessonInfo.months, this._construtMonthLessonInfo(paramsObj, jsonObj), "month");

				} else {
					//因为_.where返回来的是数组，如果不为空，应该取出第一个
					currentYearLessonInfo = currentYearLessonInfo[0];

					//存在同一年的课时信息
					var currentMonthLessonInfo = _.where(currentYearLessonInfo.months, {
						"month": currentMonth
					});

					//判断是否存在同一年同一月的课时信息
					if (this.isNull(currentMonthLessonInfo)) {

						currentYearLessonInfo.months =
							this.arrPush(currentYearLessonInfo.months, this._construtMonthLessonInfo(paramsObj, jsonObj), "month");
						//currentYearLessonInfo.months.push(this._construtMonthLessonInfo(paramsObj, jsonObj));

					} else {
						//存在同一年同一月的课时信息
						//因为_.where返回来的是数组，如果不为空，应该取出第一个
						currentMonthLessonInfo = currentMonthLessonInfo[0];


						currentLessonIfo = this._construtLessonInfo(paramsObj, jsonObj);
						currentMonthLessonInfo.lessons =
							this.arrPush(currentMonthLessonInfo.lessons, currentLessonIfo, "lessonKey");

						currentYearLessonInfo.months =
							this.arrPush(currentYearLessonInfo.months, currentMonthLessonInfo, "month");

					}
				}
				cacheLesson4Srh = this.arrPush(cacheLesson4Srh, currentYearLessonInfo, "year");
				Piece.Store.saveObject(constantType4Srh, cacheLesson4Srh);
			}

			//如果是已完成，则清理缓存中相对应的待完成的课时信息
			// 如果是测试的则不清除缓存数据
			if (typeof iftrial == "undefined") {
				if (type == this.CACHE_TYPE_PEND) {
					var constantTypeUnfi = this._getKeyByType(this.CACHE_TYPE_UNFI_4_DISP);
					var lessonUnfi = Piece.Store.loadObject(constantTypeUnfi);
					if (_.isObject(lessonUnfi) && _.isObject(lessonUnfi[lessonKey])) {
						//检查未完成列表并删除
						this._removeLesson4Srh(paramsObj,
							lessonUnfi[lessonKey].year,
							lessonUnfi[lessonKey].month,
							this.CACHE_TYPE_UNFI_4_DISP);

						this._removeLesson4DispScore(lessonKey, this.CACHE_TYPE_UNFI);
						this._removeLesson4DispScore(lessonKey, this.CACHE_TYPE_UNFI_4_DISP);
					}

				}
				//如果是已上传，则清理缓存中相对应的待完成或者待上传的课时信息
				else if (type == this.CACHE_TYPE_DONE) {
					var constantTypeUnfi = this._getKeyByType(this.CACHE_TYPE_UNFI_4_DISP);
					var lessonUnfi = Piece.Store.loadObject(constantTypeUnfi);

					//检查未完成列表并删除
					if (_.isObject(lessonUnfi) && _.isObject(lessonUnfi[lessonKey])) {
						this._removeLesson4Srh(paramsObj,
							lessonUnfi[lessonKey].year,
							lessonUnfi[lessonKey].month,
							this.CACHE_TYPE_UNFI_4_DISP);

						this._removeLesson4DispScore(lessonKey, this.CACHE_TYPE_UNFI);
						this._removeLesson4DispScore(lessonKey, this.CACHE_TYPE_UNFI_4_DISP);
					}

					var constantTypePend = this._getKeyByType(this.CACHE_TYPE_PEND_4_DISP);
					var lessonPend = Piece.Store.loadObject(constantTypePend);
					if (_.isObject(lessonPend) && _.isObject(lessonPend[lessonKey])) {
						//检查已完成列表并删除
						this._removeLesson4Srh(paramsObj,
							lessonPend[lessonKey].year,
							lessonPend[lessonKey].month,
							this.CACHE_TYPE_PEND_4_DISP);

						this._removeLesson4DispScore(lessonKey, this.CACHE_TYPE_PEND);
						this._removeLesson4DispScore(lessonKey, this.CACHE_TYPE_PEND_4_DISP);
					}


				}
			}

		},

		/*
		 * 删除列表中的冗余数据
		 */
		_removeLesson4Srh: function(paramsObj, year, month, type) {
			var lessonArr = this.getLessonsFromCacheByType4Srh(type);
			var lessonKey = this._generateLessonKey(paramsObj);

			//删除列表（srh）
			if (_.isObject(lessonArr)) {
				//年课时信息
				var currentYearLessonInfo = _.findWhere(lessonArr, {
					year: year
				});
				if (_.isObject(currentYearLessonInfo)) {
					//月课时信息
					var currentMonthLessonInfo = _.findWhere(currentYearLessonInfo.months, {
						month: month
					});
					if (_.isObject(currentMonthLessonInfo)) {
						//课时信息						
						var currentLessonInfo = _.findWhere(currentMonthLessonInfo.lessons, {
							lessonKey: lessonKey
						});

						//如果存在则删除
						if (_.isObject(currentLessonInfo)) {
							currentMonthLessonInfo.lessons.splice(_.indexOf(currentMonthLessonInfo.lessons, currentLessonInfo), 1);

							var constantType = this._getKeyByType4Srh(type);

							Piece.Store.saveObject(constantType, lessonArr);
						}
					}
				}
			}

		},

		/*
		 * 删除回显和打分中的冗余数据
		 * lessonKey - courseId + lessonId + instructorId + studentId
		 */
		_removeLesson4DispScore: function(lessonKey, type) {
			var constantType = this._getKeyByType(type);
			var lessons = Piece.Store.loadObject(constantType);
			if (_.isObject(lessons[lessonKey])) {
				delete lessons[lessonKey]
			};

			Piece.Store.saveObject(constantType, lessons);
		},
		/*
		_removeLessonByType: function(paramsObj, type) {
			var lessonArr = this.getLessonInfoFromCacheByType(paramsObj, type);

			for(i in lessonArr){
				for(j in lessonArr[i].months){
					for(k in )
				}
			}
		},*/

		_construtMonthLessonInfo: function(paramsObj, jsonObj) {

			var currentMonthInfo = {};
			currentMonthInfo.month = (new Date()).getMonth() + 1;
			currentMonthInfo.lessons = [];

			var currentLessonIfo = this._construtLessonInfo(paramsObj, jsonObj);
			currentMonthInfo.lessons.push(currentLessonIfo);

			return currentMonthInfo;
		},

		/*
		 * Zping on 20140806
		 * 构建课时信息供列表页面显示
		 */
		_construtLessonInfo: function(paramsObj, jsonObj) {
			var currentLessonInfo = {};
			currentLessonInfo['lessonId'] = paramsObj['lessonId'];
			currentLessonInfo['lessonInfo'] = {};

			//插入一个lessonKey用来表明唯一课时
			currentLessonInfo['lessonKey'] = this._generateLessonKey(paramsObj);

			//course info
			var criteriaObj = {};
			var currentDate = new Date();
			//criteriaObj.year = currentDate.getFullYear();
			criteriaObj.courseId = paramsObj['courseId'];

			//查询课程信息
			var courseInfo = this.queryCourseList(criteriaObj);

			//赋值
			if (!this.isNull(courseInfo)) {
				var course = courseInfo.result[0].courses[0];
				this.objStrExtend(currentLessonInfo['lessonInfo'], course);
				/*currentLessonInfo['lessonInfo'].courseName = course.courseName;
				currentLessonInfo['lessonInfo'].courseYear = course.courseYear;
				currentLessonInfo['lessonInfo'].courseYearperiod = course.courseYearperiod;
				currentLessonInfo['lessonInfo'].acType = course.actype;
				currentLessonInfo['lessonInfo'].courseId = course.courseId;	*/
			}

			this.objStrExtend(currentLessonInfo['lessonInfo'], paramsObj);
			/*currentLessonInfo['lessonInfo'].instructorId = paramsObj.instructorId;
			currentLessonInfo['lessonInfo'].studentId = paramsObj.studentId;
			currentLessonInfo['lessonInfo'].PF = paramsObj.studentId;
			currentLessonInfo['lessonInfo'].stationCode = paramsObj.stationCode;
			currentLessonInfo['lessonInfo'].pnf = paramsObj.pnf;
			currentLessonInfo['lessonInfo'].lessonNo = paramsObj.lessonNo;*/

			this.objStrExtend(currentLessonInfo['lessonInfo'], jsonObj);
			// currentLessonInfo['lessonInfo'].lessonDate = jsonObj.lessonDate;
			// currentLessonInfo['lessonInfo'].startTime = jsonObj.startTime;
			// currentLessonInfo['lessonInfo'].lessonType = jsonObj.lessonType;

			//currentLessonInfo['lessonInfo'].endTime = DateUtil.dateFormat(new Date(), "yyyy-MM-dd hh:mm");

			return currentLessonInfo;
		},

		//浅复制,只复制字符串类型的属性

		objStrExtend: function(desOri, srcOri) {
			if (!_.isObject(desOri) || !_.isObject(srcOri)) return desOri;

			for (var p in srcOri) {
				if (_.isString(srcOri[p]) || _.isNumber(srcOri[p])) {
					desOri[p] = srcOri[p];
				}
			}

			return desOri;
		},

		/*
		 * 获取课程列表缓存数据接口
		 * type - 3.待上传课时纯列表(数组）,4.待完成课时纯列表（数组）,5.已上传课时纯列表(数组）
		 */
		getLessonsFromCacheByType4Srh: function(type) {
			var constantType = this._getKeyByType4Srh(type);

			return Piece.Store.loadObject(constantType);
		},

		/*
		 * 设置课程列表缓存数据接口
		 * type - 3.待上传课时纯列表(数组）,4.待完成课时纯列表（数组）,5.已上传课时纯列表(数组）
		 * origin标识要修改的key
		 * tarObj标识修改后的key
		 */
		setLessonsFromCacheByType4Srh: function(type, origin, tarObj) {
			var constantType = this._getKeyByType4Srh(type);
			var lessonKey = this._generateLessonKey(origin);
			var lessonKeyNew = this._generateLessonKey(tarObj);
			// 回显的列表数据
			var CacheSrhData = Piece.Store.loadObject(constantType);
			_.each(CacheSrhData, function(item, index) {
				_.each(item.months, function(item_month, index_month) {
					_.each(item_month.lessons, function(item_month_lesson, index_month_lesson) {
						// 如果找到了对应的key修改key值，以及相应的value
						if (item_month_lesson.lessonKey == lessonKey) {
							item_month_lesson.lessonKey = lessonKeyNew;
							item_month_lesson.lessonInfo.studentId = tarObj.studentId;
							item_month_lesson.lessonInfo.pnf = tarObj.pnf;
							item_month_lesson.lessonInfo.stationCode = tarObj.stationCode;
							item_month_lesson.lessonInfo.stationCodeValue = tarObj.stationCodeValue;
						}
					});
				});
			});
			Piece.Store.saveObject(constantType, CacheSrhData);
		},
		/*
		 * 获取课程列表缓存数据接口
		 * type - 3.待上传课时纯列表(数组）,4.待完成课时纯列表（数组）,5.已上传课时纯列表(数组）
		 */

		delLessonsFromCacheByType4Srh: function(type, origin) {
			var constantType = this._getKeyByType4Srh(type);
			var lessonKey = this._generateLessonKey(origin);
			// 回显的列表数据
			var CacheSrhData = Piece.Store.loadObject(constantType);
			_.each(CacheSrhData, function(item, index) {
				_.each(item.months, function(item_month, index_month) {
					_.each(item_month.lessons, function(item_month_lesson, index_month_lesson) {
						// 找到对应的key并删除
						if (item_month_lesson.lessonKey == lessonKey) {
							item_month.lessons.splice(index_month_lesson, 1);
						}
					});
					// 如果月份下面没有课程则删除该月份
					if (item_month.lessons.length < 1) {
						item.months.splice(index_month, 1);
					}
				});
				// 如果年份下面没有课程则删除该年份
				if (item.months.length < 1) {
					CacheSrhData.splice(index, 1);
				}
			});
			Piece.Store.saveObject(constantType, CacheSrhData);
		},

		//在数组中加入对象，如果对象已经存在则替换，不存在则添加
		//arr - 目标数组
		//obj - 要替换/添加的对象
		//key - 对象的键名
		//返回 - 替换/添加后的数组
		arrPush: function(arr, obj, key) {
			arr = _.reject(arr, function(item) {
				console.info(item[key]);

				if (item[key] == obj[key]) {
					return item;
				}
			});

			arr.push(obj);
			return arr;
		},

		/*
		 * 构建课程id
		 * paramsObj - 保存有lesson key所需信息的json对象
		 */
		_generateLessonKey: function(paramsObj) {
			if (this.isNull(paramsObj['courseId']) || this.isNull(paramsObj['lessonId']) || this.isNull(paramsObj['instructorId']) || this.isNull(paramsObj['studentId'])) {
				console.error("---Error happens when _generateLessonKey---");
				return null;
			}

			return paramsObj['courseId'] + "_" + paramsObj['lessonId'] + "_" + paramsObj['instructorId'] + "_" + paramsObj['studentId'];
		},

		/*
		 * 获取不同类型的缓存课时信息（已完成课时，待完成课时，已上传课时）
		 * paramsObj - 保存有lesson key所需信息的json对象
		 * type - 类型， 0.待上传课时， 1.待完成课时， 3.待上传课时列表回显， 4.待完成课时列表回显， 5.已上传课时列表回显
		 */
		getLessonInfoFromCacheByType: function(paramsObj, type) {

			var constantType = this._getKeyByType(type);

			var cachePendLessonList = Piece.Store.loadObject(constantType);

			//key为courseId+lessonId+instructorId+studentId
			var lessonKey = this._generateLessonKey(paramsObj);

			if (this.isNull(cachePendLessonList) || this.isNull(lessonKey)) {
				return null;
			} else {
				return cachePendLessonList[lessonKey];
			}

		},
		/*
		 * 设置不同类型的缓存课时信息（已完成课时，待完成课时，已上传课时）
		 * paramsObj - 保存有lesson key所需信息的json对象
		 * type - 类型， 0.待上传课时， 1.待完成课时， 3.待上传课时列表回显， 4.待完成课时列表回显， 5.已上传课时列表回显
		 */
		setLessonInfoFromCacheByType: function(paramsObj, type, SetObj) {
			var targetData;
			var constantType = this._getKeyByType(type);

			var cachePendLessonList = Piece.Store.loadObject(constantType);

			//key为courseId+lessonId+instructorId+studentId
			var lessonKey = this._generateLessonKey(paramsObj);
			var lessonKeyNew = this._generateLessonKey(SetObj);

			if (this.isNull(cachePendLessonList) || this.isNull(lessonKey)) {
				return null;
			} else {
				// 只同步pnf,pf,stationCode,stationCodeValue
				targetData = cachePendLessonList[lessonKey];
				targetData.studentId = SetObj.studentId;
				targetData.pnf = SetObj.pnf;
				targetData.stationCode = SetObj.stationCode;
				targetData.stationCodeValue = SetObj.stationCodeValue;
				// 设置新的key删除旧的key
				cachePendLessonList[lessonKeyNew] = targetData;
				delete cachePendLessonList[lessonKey];
				Piece.Store.saveObject(constantType, cachePendLessonList);
			}

		},
		delLessonInfoFromCacheByType: function(paramsObj, type) {
			var constantType = this._getKeyByType(type);

			var cachePendLessonList = Piece.Store.loadObject(constantType);

			//key为courseId+lessonId+instructorId+studentId
			var lessonKey = this._generateLessonKey(paramsObj);

			if (this.isNull(cachePendLessonList) || this.isNull(lessonKey)) {
				return null;
			} else {

				delete cachePendLessonList[lessonKey];
				Piece.Store.saveObject(constantType, cachePendLessonList);
			}
		},
		/*
		 * 获取不同类型的缓存课时列表信息（已完成课时，待完成课时，已上传课时）
		 * type - 类型， 0.待上传课时， 1.待完成课时， 3.待上传课时列表回显， 4.待完成课时列表回显， 5.已上传课时列表回显
		 */
		getLessonsFromCacheByType: function(type) {
			var constantType = this._getKeyByType(type);
			return Piece.Store.loadObject(constantType);
		},


		/*
		 * 根据类型获取课时key
		 */
		_getKeyByType: function(type) {
			var currentUserId = Piece.Session.loadObject(this.CURRENT_USER_ID);
			var constantType = "";
			switch (type) {
				//0.待上传课时列表(数组）
				case this.CACHE_TYPE_PEND:
					constantType = this.CACHE_PEND_LESSON_LIST + currentUserId;
					break;
					//1.待完成课时列表（数组）
				case this.CACHE_TYPE_UNFI:
					constantType = this.CACHE_UNFI_LESSON_LIST + currentUserId;
					break;
					//2.已上传课时列表(数组）
					/*case 2:
			  constantType = this.CACHE_DONE_LESSON_LIST + currentUserId;
			  break;*/
					//3.待上传课时列表回显(数组）
				case this.CACHE_TYPE_PEND_4_DISP:
					constantType = this.CACHE_PEND_LESSON_LIST_4_DISP + currentUserId;
					break;
					//4.待完成课时列表回显（数组）
				case this.CACHE_TYPE_UNFI_4_DISP:
					constantType = this.CACHE_UNFI_LESSON_LIST_4_DISP + currentUserId;
					break;
					//5.已上传课时列表回显(数组）
				case this.CACHE_TYPE_DONE:
					constantType = this.CACHE_DONE_LESSON_LIST_4_DISP + currentUserId;
					break;
			}

			return constantType;
		},


		/*
		 * 根据类型获取纯列表课时key
		 * type - 3.待上传课时纯列表(数组）,4.待完成课时纯列表（数组）,5.已上传课时纯列表(数组）
		 */
		_getKeyByType4Srh: function(type) {
			var currentUserId = Piece.Session.loadObject(this.CURRENT_USER_ID);
			var constantType = "";
			switch (type) {
				//3.待上传课时纯列表(数组）
				case this.CACHE_TYPE_PEND_4_DISP:
					constantType = this.CACHE_PEND_LESSON_LIST_4_SRH + currentUserId;
					break;
					//4.待完成课时纯列表（数组）
				case this.CACHE_TYPE_UNFI_4_DISP:
					constantType = this.CACHE_UNFI_LESSON_LIST_4_SRH + currentUserId;
					break;
					//5.已上传课时纯列表(数组）
				case this.CACHE_TYPE_DONE:
					constantType = this.CACHE_DONE_LESSON_LIST_4_SRH + currentUserId;
					break;
			}

			return constantType;
		},

		/*
		 * 获取课程key
		 */
		_getCourseKey: function(prefix) {
			if (!this.isNull(prefix)) {
				return prefix + Piece.Session.loadObject(this.AC_TYPE) + "_" + Piece.Session.loadObject(this.COMPANY_ID);
			} else {
				return null;
			}

		},

	};
	return Util;
});