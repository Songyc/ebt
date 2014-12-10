define(['text!com.ebt.course/chooseCourse.html', "text!com.ebt.course/template/chooseCourse_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/lessonNo", "i18n!com.ebt.course/nls/courseall"],
	function(viewTemplate, chooseCourseTemp, OpenAPI, Util, baseLocale, LessonNo,Locale) {
		return Piece.View.extend({
			id: 'com.ebt.course_chooseCourse',
			events: {
				"click .course_item": "beginCourse",
				"click .leftTop": "goBack"
			},
			/*paramsObj: {
				cacheId: "course_chooseCourse",
				isReloadRequest: true
			},*/
			goBack: function() {
				window.history.back();
			},
			beginCourse: function(e) {
				var that = this;
				var $target = $(e.currentTarget);
				var lessonId = $target.attr("data-value");
				var lessonNo = $target.attr("lesson-no");
				var lessonType = $target.attr("lesson-type");
				var courseId = Util.request("courseId");
				var url = "lessonDetail?courseId=" + courseId + "&lessonId=" + lessonId + "&lessonNo=" + lessonNo + "&lessonType=" + encodeURIComponent(lessonType);
				that.navigate(url, {
					trigger: true
				});
			},
			requestData: function() {
				var that = this;
				var courseId = Util.request("courseId");
				var data = Util.getDownloadCourse(courseId);
				if (!Util.isNull(data)) {
					that.renderTemp(data);
				} else {
					new Piece.Toast(baseLocale.request_fail);
				}
			},
			renderTemp: function(data) {
				console.log("template");
				var that = this;
				data.lang=Locale;
				var template = me.find("#chooseCourse_template").html();
				var websiteHtml = _.template(template, data);
				$("#content").html("");
				$("#content").append(websiteHtml);
			},
			render: function() {
				//添加模板
				me = $(this.el);
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				viewT = viewT + chooseCourseTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				that.requestData();

				if (window.localStorage['lang'] !== "" && window.localStorage['lang'] !== undefined && window.localStorage['lang'] !== null && window.localStorage['lang'] === "en-us") {
					$(".noCourseTip").html("This course no lesson information");
				} else {
					$(".noCourseTip").html("该课程暂无课时信息");
				}

			}
		}); //by sqhom

	});