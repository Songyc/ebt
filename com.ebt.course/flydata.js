define(['text!com.ebt.course/flydata.html', "text!com.ebt.course/template/flydata_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/flyLocale"],
	function(viewTemplate, flydataTemp, OpenAPI, Util, baseLocale, flyLocale) {
		return Piece.View.extend({
			id: 'com.ebt.course_flydata',
			events: {
				"click .slide_left": "goBack",
				"click .slide_right": "nextPage"
			},
			/*paramsObj: {
				cacheId: "course_flydata",
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
				var lessonType = decodeURIComponent(Util.request("lessonType"));
				var stuPF = decodeURIComponent(Util.request("stuPF"));
				var stuPNF = decodeURIComponent(Util.request("stuPNF"));
				var startTime = Util.request("startTime");
				var trainTime = Util.request("trainTime");
				var station = Util.request("station");
				var studentSeat = Util.request("studentSeat");
				var stationCodeValue = decodeURIComponent(Util.request("stationCodeValue"));
				var currentUserRole = Piece.Session.loadObject("roles");
				if (trainTime) {
					trainTime = trainTime.replace("-", "/");
				}

				if (_.contains(currentUserRole, 'EBT-INSTRUCTOR-APP')) {
					//教员
					var instructorId = Piece.Session.loadObject("currentUserId");
					Piece.Store.saveObject("baseParams", {
						"instructorId": instructorId,
						"courseId": courseId,
						"lessonId": lessonId,
						"lessonNo": lessonNo,
						"lessonType": lessonType,
						"studentId": stuPF,
						"pnf": stuPNF,
						"stationCode": station,
						"stationCodeValue": stationCodeValue,
						"startTime": startTime,
						"trainTime": trainTime,
						"studentSeat": studentSeat
					});
				} else {
					//学员
					Piece.Store.saveObject("baseParams", {
						"courseId": courseId,
						"lessonId": lessonId,
						"studentId": stuPF,
						"pnf": stuPNF,
						"stationCode": station,
						"stationCodeValue": stationCodeValue,
						"startTime": startTime
					});
				}
				/*var url = "coursePage?courseId="+courseId+"&lessonId="+lessonId+"&stuPF="+stuPF+"&stuPNF="+stuPNF+"&station="+station;*/
				var url = "coursePage";
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
				data.lang = flyLocale;
				var template = me.find("#flydata_template").html();
				var websiteHtml = _.template(template, data);
				$("#content").html("");
				$("#content").append(websiteHtml);
			},
			render: function() {
				//添加模板
				me = $(this.el);
				viewT = viewTemplate + flydataTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				that.requestData();

				if ($(".flydataTop").height() > 92) {
					$(".flydataTop_l_r_bottom").addClass('addBorderBottom');
				}
				if ($("#scroller").height() > 648) {
					var myScroll = new iScroll('wrapper', {
						hScroll: false
					});
				}
			}
		}); //by sqhom

	});