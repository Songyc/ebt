define(['text!com.ebt.ResultsUpload/ResultsUpload.html', 'text!com.ebt.ResultsUpload/template/ResultsUpload_template.html', '../base/util', '../base/openapi', '../base/date', "i18n!../com.ebt.ResultsUpload/nls/ResultsUpload"],
	function(viewTemplate, ResultsUpload_template, Util, OpenAPI, DateUtil, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.ResultsUpload_ResultsUpload',
			events: {
				"click .edit": "edit_item",
				"click .del_item": "del_item_click",
				"click .backbtn": "backhome",
				"click .refresh": "refresh",
				"click .search": "showSearchDialog",
				"click .cancelBtn": "closeSearchDialog",
				"click #skilledLevel": "chooseLevel",
				"click .courseTime": "chooseCourseTime",
				"click .lessonTime": "chooselessonTime",
				"click .confirmBtn": "queryCourse",
				"click .uploadCourse": "uploadCourse",
				"click .course_item": "item_click"

			},
			$editCourse: "<div class='editCourse'></div>",
			ActypeArr: [],
			myScroll: null,
			backhome: function() {
				this.navigateModule("com.ebt.course/allCourse", {
					trigger: true
				});
			},
			refresh: function() {
				this.onShow();
			},
			edit_item: function(e) {
				var that = this,
					$tar = $(e.currentTarget);
				$tar.toggleClass("active");
				$(".course_item_masker").toggle();
			},
			item_click: function(e) {
				var that = this;
				var $target = $(e.currentTarget);
				var className = e.target.className;
				// 如果点到打钩和编辑的图像则不跳转
				if ($(e.target).attr("data-dagou") === "dagou") {
					// 课程选择
					that.chooseCourse($target);
					return;
				}
				// 点击编辑课程
				if (className === "editCourse") {
					that.editCourse($target);
					return;
				}
				if (className === "course_item_masker" || className === "del_item") {
					// that.editCourse($target);
					return;
				}
				that.goDetial($target);
			},
			del_item_click: function(e) {
				var that = this,
					params = {};
				var $course_item = $(e.currentTarget).parents(".course_item"),
					$course_month = $course_item.parent(),
					course_itemLen = $course_month.find(".course_item").length,
					courseId = $course_item.attr("data-courseid"),
					lessonId = $course_item.attr("data-lessonid"),
					studentId = $course_item.attr("data-studentid"),
					instructorId = $course_item.attr("data-instructorid"),
					yearId = parseInt($course_month.find(".timeline").text(), 10);
				params = {
					"courseId": courseId,
					"lessonId": lessonId,
					"studentId": studentId,
					"instructorId": instructorId
				};
				// 如果当前月份只有一个课程则删除整个月数据，否则删除点钱课程
				that.delLocaleCourseinfo(params);
				if (course_itemLen > 1) {
					// 点击删除时候删除当前节点以及缓存中对应的数据
					$course_item.remove();
				} else {
					$course_month.remove();
				}
			},
			delLocaleCourseinfo: function(params) {
				// 删掉待上传列表回显信息
				Util.delLessonsFromCacheByType4Srh(Util.CACHE_TYPE_PEND_4_DISP, params);
				// 删掉待上传分数信息
				Util.delLessonInfoFromCacheByType(params, Util.CACHE_TYPE_PEND);
				// 删掉课时列表中的信息
				Util.delLessonInfoFromCacheByType(params, Util.CACHE_TYPE_PEND_4_DISP);
			},
			goDetial: function($tar) {
				var courseInfo = {};
				courseInfo.lessonId = $tar.attr("data-lessonid");
				courseInfo.lessonNo = $tar.attr("data-lessonno");
				courseInfo.courseId = $tar.attr("data-courseid");
				courseInfo.instructorId = $tar.attr("data-instructorid");
				courseInfo.studentId = $tar.attr("data-studentid");
				courseInfo.pnf = $tar.attr("data-pnf");
				courseInfo.studentSeat = $tar.attr("data-studentSeat");
				Piece.Session.saveObject("courseInfo", courseInfo);
				this.navigateModule("com.ebt.ResultsUpload/uploadDetail", {
					trigger: true
				});

			},
			editCourse: function($tar) {
				var lessonId = $tar.attr("data-lessonid"),
					courseId = $tar.attr("data-courseid"),
					instructorId = $tar.attr("data-instructorid"),
					studentId = $tar.attr("data-studentid");
				this.navigateModule("com.ebt.course/courseStuInfo?comefrom=ResultsUpload&courseId=" + courseId + "&lessonId=" + lessonId + "&instructorId=" + instructorId + "&studentId=" + studentId, {
					trigger: true
				});
			},
			getUploadParams: function() {
				var that = this;
				var uploadParam = [],
					$cours = $("div[data-select='true']"),
					uploadCourseNum = $cours.length;
				// 如果没有选中上传课程要给出提示
				if (uploadCourseNum < 1) {
					new Piece.Toast(Locale.chooseUploadCourse);
					return;
				}
				_.each($cours, function(item, index) {
					console.log(item);
					var $item = $(item),
						param = {},
						courseTip,
						instructorid = $(item).attr("data-instructorid"),
						studentid = $(item).attr("data-studentid"),
						pnf = $(item).attr("data-pnf"),
						courseid = $(item).attr("data-courseid"),
						lessonid = $(item).attr("data-lessonid"),
						studentSeat = $(item).attr("data-studentSeat"),
						courseName = $(item).find(".courseTitle").text(),
						lessonNo = $(item).find(".lessonNo").text();
					// 上传失败提示信息
					courseTip = courseName.trim() + lessonNo.trim();
					param = {
						"instructorId": instructorid,
						"studentId": studentid,
						"pnf": pnf,
						"courseId": courseid,
						"lessonId": lessonid,
						"courseTip": courseTip,
						"studentSeat": studentSeat,
						"type": Util.CACHE_TYPE_PEND
					};
					uploadParam.push(param);
				});
				console.log(uploadParam);
				return uploadParam;
			},
			uploadCourse: function() {
				var that = this;
				var uploadParam = that.getUploadParams();
				// 新增学员上传资格验证
				Util.checkStudent(uploadParam, that.checkUploadComplete(that));
				console.log(uploadParam);
			},
			checkUploadComplete: function(that) {
				// 全部检查成功后返回通过以及未通过数组
				return function(argum) {
					console.log(argum);
					if (argum.pf.errorResult.length > 0 || argum.pnf.errorResult.length > 0) {
						that.onShow();
						that.signUploadCourse(argum);
					} else {
						Util.uploadLessons(that.getUploadParams(), that.uploadComplete(that));
					}
				};
			},
			signUploadCourse: function(signArr) {
				var arr = [],
					arrStr = "",
					that = this;
				if (signArr.pf.errorResult.length > 0) {
					_.each(signArr.pf.errorResult, function(item, index) {
						var itemStr = "pf" + item +Locale.noPromiss;
						// pf为***的学员没有上传资格，请修改
						$("div[data-studentid=" + item + "]").append(that.$editCourse);
						arr.push(itemStr);
					});
				}
				if (signArr.pnf.errorResult.length > 0) {
					_.each(signArr.pnf.errorResult, function(item, index) {
						var itemStr = "pnf" + item + Locale.noExsit;
						// pf为***的学员不存在，请修改
						var $tar = $("div[data-pnf=" + item + "]");
						if ($tar.find(".editCourse").length < 1) {
							$tar.append(that.$editCourse);
						}
						arr.push(itemStr);
					});
				}
				arrStr = arr.join("</br>");
				console.log(arrStr);
				new Piece.Toast(arrStr, 3000);
			},
			uploadComplete: function(that) {
				// 成功后回调
				return function(argum) {
					that.onShow();
					console.log("---arguments---");
					that.errortip(argum);
				};
			},
			errortip: function(argum) {
				console.log(argum);
				var mesTipArr = [],
					mesTipstr;
				var errorResult = argum.errorResult;
				if (errorResult.length > 0) {
					_.each(errorResult, function(item, index) {
						console.log(item.resultData);
						var tip;
						if (item.resultData) {
							Tip = item.courseTip + item.resultData.resultMsg;
						} else if (item.resultErr) {
							Tip = item.courseTip + Locale.uploaderr;
						}
						console.log(item);
						console.log(item.courseTip);
						mesTipArr.push(Tip);
					});
					mesTipstr = mesTipArr.join("<br/>");
					console.log("mesTipstr----");
					console.log(mesTipstr);
					new Piece.Toast(mesTipstr, 5000);
				}
			},
			chooseCourseTime: function() {
				var paramYear = $("#courseYear").text();
				paramYear = parseInt(paramYear, 10);
				var paramYearperiod = $("#courseYearperiod").text();
				//调用（显示）系统原生选择日期的控件
				cordova.exec(function(obj) {
					console.log("chooseCourseTime");
					console.log(obj);
					var words = obj.split("-");
					$("#courseYear").text(words[0] + Locale.year);
					$("#courseYearperiod").text(words[1]);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [10, paramYear + '-' + paramYearperiod]);
			},
			chooselessonTime: function() {
				//调用（显示）系统原生选择日期的控件
				cordova.exec(function(obj) {
					console.log("chooselessonTime");
					console.log(obj);
					$("#lessonTime").text(obj);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [6, $("#lessonTime").text()]);
			},
			chooseCourse: function($pars) {
				if ($pars.attr("data-select") == "true") {
					$pars.attr("data-select", "false");
				} else {
					$pars.attr("data-select", "true");
				}
				$pars.find(".dagou").toggle();
			},
			queryCourse: function() {
				var that = this;
				Util.clearWarn(that.el);
				var queryParams = this.getQueryParam();
				var queryResult = Util.queryLessonList(queryParams, Util.CACHE_TYPE_PEND_4_DISP);
				console.log("queryResult---");
				console.log(queryParams);
				console.log(queryResult);
				var tempData = {};
				var check = that.courseCheck(queryResult);
				tempData.Locale = Locale;
				tempData.result = queryResult;
				that.renderTemp(tempData);
				if (!check) {
					Util.ResultWarn(that.el, Locale.nosearchResult);
				}
				$(".title").text(Locale.searchResult);
				this.closeSearchDialog();
			},
			courseCheck: function(data) {
				var check = false;
				console.log(data);
				_.each(data, function(dataitem, index) {
					_.each(dataitem.months, function(months_item, index) {
						if (months_item.lessons.length > 0) {
							check = true;
						}
					});
				});
				return check;
			},
			getQueryParam: function() {
				var $tar = $(".searchForm");
				var queryParams = {};
				queryParams.actype = $tar.find("#skilledLevel").attr("data-value") || "";
				queryParams.year = parseInt($tar.find("#courseYear").text(), 10);
				queryParams.courseYearperiod = $tar.find("#courseYearperiod").text();
				queryParams.courseName = $tar.find("#courseName")[0].value;
				queryParams.studentId = $tar.find("#studentId")[0].value;
				queryParams.lessonTime = this.transTimeForIOS($tar.find("#lessonTime").text());
				return queryParams;
			},
			transTimeForIOS: function(time) {
				try {
					var newtime;
					newtime = time.replace(/-/g, "/");
					return newtime;
				} catch (e) {
					return false;
				}
			},
			closeSearchDialog: function() {
				$(".searchDailog").hide();
				$(".masker").hide();
			},
			showSearchDialog: function() {
				var that = this;
				// 过滤条件中的机型动态获取
				var $actype_item = $(".actype_item");
				var $skilledLevel = $("#skilledLevel");
				if (that.ActypeArr.length < 1) {
					_.each($actype_item, function(item, index) {
						that.ActypeArr.push($(item).text().trim());
					});
					// 唯一化
					that.ActypeArr = _.uniq(that.ActypeArr);
				}
				// 把actype填进dom
				_.each(that.ActypeArr, function(item, index) {
					var $div;
					if (index == 0) {
						$div = $("<div/>", {
							text: item,
							class: "skilledLevelItem active"
						});
						$("#skilledLevel").attr("data-value", item);
					} else {
						$div = $("<div/>", {
							text: item,
							class: "skilledLevelItem"
						});
					}
					$skilledLevel.html("");
					$skilledLevel.append($div);
				});
				console.log(that.ActypeArr);
				$(".searchDailog").show();
				$(".masker").show();
			},
			chooseLevel: function(e) {
				var $tar = $(e.target);
				$("#skilledLevel").attr("data-value", $tar.text().trim());
				$tar.addClass("active").siblings().removeClass("active");
			},
			setAutoTimeForQueryCourse: function() {
				var date = new Date();
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var lessonTime = DateUtil.dateFormat(date, "yyyy-MM-dd hh:mm");
				$("#lessonTime").text(lessonTime);
				$("#courseYear").text(year + Locale.year);
				if (month > 6) {
					$("#courseYearperiod").text(Locale.secHalfYear);
				} else {
					$("#courseYearperiod").text(Locale.firHalfYear);
				}
			},
			render: function() {
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板

				viewT = ResultsUpload_template + viewT;
				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			requestData: function() {
				//身份证号
				var that = this;
				var data = Util.getLessonsFromCacheByType4Srh(Util.CACHE_TYPE_PEND_4_DISP);
				var check = that.courseCheck(data);
				var tempData = {};
				tempData.Locale = Locale;
				tempData.result = data;
				console.log(data);
				that.renderTemp(tempData);
				if (!check) {
					Util.ResultWarn(that.el, Locale.nodata);
				}
				// 设置过滤框默认时间
				that.setAutoTimeForQueryCourse();
			},
			renderTemp: function(data) {
				var that = this;
				Util.clearWarn(that.el);
				// 设置回头部(过滤的时候改了)
				$(".title").text(Locale.uploadLesson);
				var template = $(this.el).find("#ResultsUpload_template").html();
				var websiteHtml = _.template(template, data);
				$("#scroller").html("");
				$("#scroller").append(websiteHtml);
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {
						// checkDOMChanges: true
					});
				}
			},
			onShow: function() {
				var that = this;
				that.requestData();
				//write your business logic here :)
			}

		}); //view define

	});