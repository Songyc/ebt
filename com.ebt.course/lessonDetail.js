define(['text!com.ebt.course/lessonDetail.html', "text!com.ebt.course/template/lessonDetail_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/lessonNo", "i18n!../com.ebt.course/nls/courseall", '../base/date'],
	function(viewTemplate, lessonDetailTemp, OpenAPI, Util, baseLocale, LessonNo, Locale, DateUtil) {
		return Piece.View.extend({
			id: 'com.ebt.course_lessonDetail',
			myScroll: null,
			subject_wrapper:null,
			events: {
				"click .leftTop": "goBack",
				"click .rightTop": "beginCourse",
				"click .ul_subject li": "chooseAsideMenu"
			},
			valid: false,
			goBack: function() {
				window.history.back();
			},
			beginCourse: function() {
				var that = this;
				var courseId = Util.request("courseId");
				var lessonId = Util.request("lessonId");
				var lessonNo = Util.request("lessonNo");
				var lessonType = Util.request("lessonType");
				var startTime = Date.now();
				var url = "courseStuInfo?courseId=" + courseId + "&lessonId=" + lessonId + "&lessonNo=" + lessonNo + "&lessonType=" + lessonType + "&startTime=" + startTime;
				// 验证课程是否过期
				if (that.valid) {
					that.navigate(url, {
						trigger: true
					});
				} else {
					Piece.Toast(Locale.courseOverdue);
				}
			},
			chooseAsideMenu: function(e) {
				var that = this;
				var $target = $(e.currentTarget);
				var $partarget =$target.parent();
				var subjectId = $target.attr("data-value");
				var menuSequence = $partarget.attr("data-value");
				$partarget.parent().find("li").removeClass("active");
				$("#sequence"+menuSequence).show().siblings().hide();
				$target.addClass("active");
				$(".subjectItem").hide();
				var $currentScro=$("#wrapper"+subjectId);
				$currentScro.show();
				// subjectId
				that.myScroll = new iScroll($currentScro[0]);
			},
			// 设置默认滚动项
			setdefaultScroller: function() {
				var that = this;
				$("#sequence1").find(".subjectItem").eq(0).show().siblings().hide();
				var scrolltarget=$("#sequence1").find(".subjectItem").eq(0)[0];
				that.myScroll = new iScroll(scrolltarget);
			},
			requestData: function() {
				var that = this;
				var courseId = Util.request("courseId");
				var data = Util.getDownloadCourse(courseId);
				data.lang = LessonNo;
				if (!Util.isNull(data)) {
					that.renderTemp(data);
					that.checkCoursevalid(data);
				} else {
					new Piece.Toast(baseLocale.request_fail);
				}
			},
			checkCoursevalid: function(data) {
				var that = this;
				var nowTime = new Date();
				var nowTimeYear = nowTime.getFullYear(),
					validTimeMonth = nowTime.getMonth(),
					beginTimeYear = data.result.courseYear,
					beginTimeYeara = data.result.courseYearperiod;
				if (nowTimeYear - parseInt(data.result.courseYear, 10) == 1) {
					console.log(nowTimeYear, beginTimeYear);
					// 如果跨年了，并且课程时间是下半年则判断当前时间是否为下半年不容许打分
					if (data.result.courseYearperiod == Locale.secHalfyear) {
						if (validTimeMonth < 6) {
							that.valid = true;
						}
					}
				}
				// 如果没有跨年，如果到了课程开始时间，或者课程为上半年都为true
				if (nowTimeYear - parseInt(data.result.courseYear, 10) == 0) {
					if (data.result.courseYearperiod == Locale.secHalfyear) {
						if (validTimeMonth > 6) {
							that.valid = true;
						}
					}
					if (data.result.courseYearperiod == Locale.firHalfyear) {
						that.valid = true;
					}
				}
				console.log(that.valid);

			},
			renderTemp: function(data) {
				console.log("template");
				var template = me.find("#lessonDetail_template").html();
				var websiteHtml = _.template(template, data);
				$("#content").html("");
				$("#content").append(websiteHtml);
				this.setdefaultScroller();
				this.subject_wrapper= new iScroll("subject_wrapper");
			},
			render: function() {
				//添加模板
				me = $(this.el);
				var viewT = viewTemplate + lessonDetailTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				that.requestData();

				if (window.localStorage['lang'] !== "" && window.localStorage['lang'] !== undefined && window.localStorage['lang'] !== null && window.localStorage['lang'] === "en-us") {
					$(".noLessonInfoTip").html("This lesson there is no information");
				} else {
					$(".noLessonInfoTip").html(Locale.nodata);
				}
				//that.iscroll();

			}
		}); //by sqhom

	});