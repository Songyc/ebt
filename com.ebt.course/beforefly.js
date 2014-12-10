define(['text!com.ebt.course/beforefly.html', "text!com.ebt.course/template/beforefly_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/courseall"],
	function(viewTemplate, beforeflyTemp, OpenAPI, Util, baseLocale, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.course_beforefly',
			events: {
				"click .slide_left": "goBack",
				"click .slide_right": "nextPage"
			},
			/*paramsObj: {
				cacheId: "course_beforefly",
				isReloadRequest: true
			},*/
			goBack: function() {
				window.history.back();
			},
			nextPage: function() {
				var that = this;
				var courseId = Util.request("courseId");
				var lessonId = Util.request("lessonId");
				var lessonNo = Util.request("lessonNo");
				var lessonType = Util.request("lessonType");
				var stuPF = Util.request("stuPF");
				var startTime = Util.request("startTime");
				var trainTime = Util.request("trainTime");
				var stuPNF = Util.request("stuPNF");
				var station = Util.request("station");
				var studentSeat = Util.request("studentSeat");
				var stationCodeValue = Util.request("stationCodeValue");
				var url = "flydata?courseId=" + courseId + "&lessonId=" + lessonId + "&lessonNo=" + lessonNo + "&lessonType=" + lessonType + "&stuPF=" + stuPF + "&stuPNF=" + stuPNF + "&station=" + station + "&stationCodeValue=" + stationCodeValue + "&startTime=" + startTime+"&studentSeat="+studentSeat + "&trainTime=" + trainTime;
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
				/*//身份证号
				var that = this;
				var params = {
					"state": "getInfosPortal",
					"serviceType": "getEmployeeInfo",
					"idCard": "idcard"
				};
				Util.Ajax(
					OpenAPI.sqhom_test_courseDetailInfo,
					params,
					function(xhr, settings) {},
					function(data, textStatus, jqXHR) {
						that.renderTemp(data);
					},
					function(e, xhr, type) {},
					function() {},
					null,
					that.paramsObj
				);*/
			},
			renderTemp: function(data) {
				console.log("template");
				var that = this;
				data.lang=Locale;
				var template = me.find("#beforefly_template").html();
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
				viewT = viewT + beforeflyTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				that.requestData();

				if (window.localStorage['lang'] !== "" && window.localStorage['lang'] !== undefined && window.localStorage['lang'] !== null && window.localStorage['lang'] === "en-us") {
					$(".noBeforeFlyInfo").html("The lesson has no pre Flight Evaluation Information");
				} else {
					$(".noBeforeFlyInfo").html(Locale.nodata);
				}

				if ($("#scroller").height() > 648) {
					var myScroll = new iScroll('wrapper', {
						hScroll: false
					});
				}
			}
		}); //by sqhom

	});