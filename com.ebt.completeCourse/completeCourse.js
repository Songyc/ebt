define(['text!com.ebt.completeCourse/completeCourse.html', 'text!com.ebt.completeCourse/template/completeCourse_template.html', '../base/util', '../base/openapi', 'i18n!../base/nls/messageResource', 'i18n!../com.ebt.completeCourse/nls/completeCourse'],
	function(viewTemplate, completeCourse_template, Util, openApi, baseLocale, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.completeCourse_completeCourse',
			render: function() {
				var viewTemp = _.template(viewTemplate, {
						lang: Locale
					})
					//console.log(completeCourse_template);
				$(this.el).html(viewTemp + completeCourse_template);

				Piece.View.prototype.render.call(this);
				return this;
			},
			paramsObj: {
				cacheId: "completeCourse_completeCourse",
				isReloadRequest: false
			},
			myScroll: null,
			events: {
				'click .course_item': 'course_item',
				'click .top-title>img': 'return2',
				'click .show': 'search',
				'click .cancelBtn': 'cancelBtn',
				"click .skilledLevelItem": "chooseSkilledLevel",
				"click .confirmBtn": "queryCourse",
				"click .bookmarks img": "refresh",
				"click .imgUl": "showDialog",
				"click .commitBtn": "commitDialog",
				"click .courseTime": "chooseCourseTime",
				"input textarea": "wordsTip"
			},
			//检测还能输多少字
			wordsTip: function() {
				var wordLen = 200 - $('textarea').val().length;
				var tip = Locale.input + wordLen + Locale.word;
				$('.wordsTip').text(tip);
			},
			chooseCourseTime: function() {
				//调用（显示）系统原生选择日期的控件
				var courseYear = $("#courseYear").text().substr(0, 4);
				var courseYearperiod = $('#courseYearperiod').text();
				cordova.exec(function(obj) {
					//$(".chooseCourseTime").text(obj);

					var words = obj.split("-");
					$("#courseYear").text(words[0] + Locale.year);
					courseYearperiod = $("#courseYearperiod").text(words[1]);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [10, courseYear + '-' + courseYearperiod]);
			},
			//刷新页面
			refresh: function() {
				this.onShow();
			},
			judgeMent: true,
			//显示课程反馈框
			showDialog: function(e) {
				//event.preventDefault();
				var that = this;
				that.wordsTip();
				var $tar = $(e.currentTarget);
				var $par = $tar.parents(".course_item");
				var dataLessonId = $par.attr('data-lessonid');
				var dataCourseId = $par.attr('data-courseid');
				var dataStudentId = $par.attr('data-studentid');
				var dataParam = {
					"lessonId": dataLessonId,
					"courseId": dataCourseId,
					"studentId": dataStudentId,
				}
				$(".returnInfoForm").attr("data-value", JSON.stringify(dataParam));
				$('.returnInfoDialog').show();
				$('.masker').show();
			},

			//提交课程反馈内容
			commitDialog: function(e) {
				$(e.currentTarget);
				var that = this;
				var param;
				var content = $('.contentText').val().replace(/\s/g, '');

				console.log(content);
				var param = $(".returnInfoForm").attr("data-value");
				param = JSON.parse(param);
				if (content == '') {
					Piece.Toast(Locale.content);
				} else {
					param.content = content;
					param.access_token = Piece.Session.loadObject("accessToken");
					console.log(param);
					//数据传给后台
					var netWorkState = navigator.network.connection.type || navigator.connection.type;
					if (Connection.NONE == netWorkState) {
						new Piece.Toast(baseLocale.network_not_available);
					} else {
						Util.clearWarn(document.body);
						var url = openApi.newFeedback;
						//把查询条件传给后台
						Util.Ajax(
							//本地数据
							// openApi.completeCourse_template,
							// null,
							//后台数据
							url,
							param,
							function(xhr, settings) {},
							function(data, text, jqHRX) {
								//console.log(JSON.parse(data));
								console.log(data);
								that.commitSuccess(data);
							},
							function(e, xhr, type) {
								Piece.Toast(Locale.feedback_commit_fail);
							},
							function() {},
							null
							// ,that.paramsObj
						);
					};
					$('textarea').val('');
					$('.masker').hide();
					$('.returnInfoDialog').hide();
				}
			},
			//提交成功
			commitSuccess: function(data) {
				if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
					new Piece.Toast(baseLocale.course_feedBack_success);
				} else {
					new Piece.Toast(baseLocale.course_feedBack_fail);
				}
			},
			renderTemp: function(data) {
				var that = this;
				var template = $('#completeCourse_template').html();
				//console.log($('#completeCourse_template')[0]);
				var webSite = _.template(template, data);
				//console.log(webSite);
				$('#scroller').html("");
				$('#scroller').append(webSite);
				that.iScroll();
				//that.textareaValue();
			},
			//请求后台的数据
			requestAjax: function(url, param) {
				Util.clearWarn(document.body);
				var that = this;
				Util.Ajax(
					//本地数据
					// openApi.completeCourse_template,
					// null,
					//后台数据
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							data.lang = Locale;
							that.renderTemp(data);
							console.log(data);
						} else {
							Util.ResultWarn(document.body, Locale.no_data);
						}
						that.redColor();
						that.getTimes();
					},
					null,
					function() {},
					null
					// ,that.paramsObj
				);
			},
			getTimes: function() {
				var date = new Date();
				var courseYear = date.getFullYear() + '年';
				$('#courseYear').text(courseYear);
				var courseMonth = date.getMonth() + 1;
				var courseYearperiod;
				if (courseMonth > 0 && courseMonth < 7) {
					courseYearperiod = Locale.firstHalfYear;
				} else {
					courseYearperiod = Locale.secondHalfYear;
				}
				$('#courseYearperiod').text(courseYearperiod);
			},
			//渲染模块，请求数据
			renderCourseListTemp: function() {
				var that = this;
				$('.title').text(Locale.completeCourse);
				var url = openApi.completeCourseList;
				var param = {
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken")
				};

				that.requestAjax(url, param);
			},
			//滑动
			iScroll: function() {
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {});
				}
			},
			//查询确定
			queryCourse: function() {
				Util.clearWarn(document.body);
				var that = this;
				var url = openApi.completeCourseList;
				var courseYear = $("#courseYear").html().substr(0, 4);
				var courseYearperiod = $("#courseYearperiod").html();
				var courseName = $("#courseName").val();
				var skilledLevel = $(this.el).find(".skilledLevelActive").html();
				var paramOne = {
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken"),
					"courseYearperiod": courseYearperiod,
					"courseYear": courseYear,
				};

				if (courseYearperiod == Locale.firstHalfYear) {
					courseYearperiod = '0';
				} else {
					courseYearperiod = '1';
				}
				paramOne.courseYearperiod = courseYearperiod;

				if (skilledLevel == Locale.all) {
					skilledLevel = '';
				} else if (skilledLevel == Locale.captainter) {
					skilledLevel = '78';
					paramOne.skilledLevel = skilledLevel;
				} else {
					skilledLevel = '79';
					paramOne.skilledLevel = skilledLevel;
				}
				if (courseName == '') {
					console.log(courseName);
				} else {
					paramOne.courseName = courseName;
				}

				var param = {
					"courseYear": courseYear,
					"courseYearperiod": courseYearperiod,
					"courseName": courseName,
					"skilledLevel": skilledLevel
				};
				//从后台获取过滤的JSON,重新渲染模板
				if (Util.checkConnection()) {
					Util.Ajax(
						url,
						paramOne,
						function(xhr, settings) {},
						function(data, text, jqHRX) {

							if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
								data.lang = Locale;
								that.renderTemp(data);

								that.redColor();
							} else {
								$('#scroller').html('');
								Util.ResultWarn(document.body, Locale.query_no_record);
							};
							$(".title").html(Locale.searchResult);
						},
						null,
						function() {},
						null
						// ,that.paramsObj
					)
				} else {
					Piece.Toast(baseLocale.network_not_available);
				}
				//隐藏显示框
				that.cancelBtn();

			},
			//修改技术级别样式
			chooseSkilledLevel: function(e) {
				$("#skilledLevel .skilledLevelItem").removeClass('skilledLevelActive');
				var $target = $(e.currentTarget);
				$target.addClass('skilledLevelActive');
			},
			//查询框取消,课程反馈取消
			cancelBtn: function() {
				$('.returnInfoDialog').hide();
				$('.searchDailog').hide();
				$('.masker').hide();
			},
			//显示查询框
			search: function() {
				$('.masker').show();
				$('.searchDailog').show();
				console.log('========================');
			},
			//返回主页
			return2: function() {
				var url = 'com.ebt.course/allCourse';
				this.navigateModule(url, {
					trigger: true
				});
			},
			//未通过的改成红色
			redColor: function() {
				//var a = $passed[0].find('span').text();
				$('.passed').find('span').text();
				$('.passed').each(function(index, item) {
					var a = $(this).find('span').text();

					console.log($(this));

					if (a == Locale.noPassed) {
						console.log(a);
						$(this).parent().find('.new_bg').css('borderTopColor', 'red');
						//console.log($(this).parent().find('.new_bg'));
					}
				});
			},
			//请求result页面
			course_item: function(e) {
				var that = this;
				console.log($(e.target));
				$target = $(e.currentTarget);
				var dataLessonId = $target.attr('data-lessonid'),
					dataCourseId = $target.attr('data-courseid'),
					pf = $target.find('.pf').text(),
					pnf = $target.find('.pnf').text(),
					studentseat = $target.attr('data-studentseat'),
					//  skilledLevel = $target.find('.skilledLevel').text(),
					courseYear = $target.find('.courseYear').text(),
					courseName = $target.find('.courseName').text(),
					lessonType = $target.find('.lessonType').text(),
					resultId = $target.attr('data-resultid'),
					returnInfo = $('.returnInfoDialog');

				if (e.target.localName !== 'img') {
					var url = 'com.ebt.completeCourse/resultPage';
					var param = '?lessonid=' + dataLessonId + '&courseid=' + dataCourseId + '&courseName=' + courseName + '&pf=' + pf + '&pnf=' + pnf + '&studentseat=' + studentseat + '&courseYear=' + courseYear + '&lessonType=' + lessonType + '&resultid=' + resultId;
					url = encodeURI(url + param);
					this.navigateModule(url, {
						trigger: true
					});
				} else {
					return;
				}
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				if (!Util.checkConnection()) {
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					that.renderCourseListTemp();
				}
			}
		}); //view define

	});