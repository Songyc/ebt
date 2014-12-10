define(['text!com.ebt.course/resultGather.html', 'text!com.ebt.course/template/resultGather_template.html', 'text!com.ebt.course/template/resultPage_problem_template.html', '../base/util', '../base/openapi', '../base/components/remark', 'i18n!../com.ebt.course/nls/courseall'],
	function(viewTemplate, templateContent, problemListTemplate, Util, OpenAPI, Remark, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.course_resultGather',
			render: function() {
				//添加模板
				me = $(this.el);
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板
				viewT = templateContent + viewT + problemListTemplate;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			events: {
				"click .otherImg": "addOtherInfo",
				"click .remark": "showRemark",
				"click .returnHome": "returnHome",
				'click .sub_title_pic img': 'handelCore',
				"click .submit": "uploadHandle",
				"click .upload_cancel": "upload_cancel",
				"click .upload_Confirm": "upload_Confirm",
				"click .back": "goBack"
			},
			goBack: function() {
				window.history.back();
			},
			myScroll: null,
			tip_titile: Locale.remark_title,
			baseParams: null,
			returnHome: function() {
				this.navigateModule("com.ebt.course/allCourse", {
					trigger: true
				});
			},
			uploadHandle: function(message) {
				var tip = decodeURIComponent(message);
				if (tip == Locale.succpass) {
					$(".ifPassStatus").addClass("bggreen");
				}
				if (tip == Locale.failpass) {
					$(".ifPassStatus").addClass("bgred");
				}
				if (tip == "noshow") {
					tip = "";
				}
				$(".ifPassText").text(tip);
				$(".uploadTip").show();
				$(".masker").show();
			},
			upload_cancel: function() {
				$(".uploadTip").hide();
				$(".masker").hide();
			},
			upload_Confirm: function() {
				$(".uploadTip").hide();
				$(".masker").hide();
				this.goUploadPage();
			},
			goUploadPage: function() {
				this.navigateModule("com.ebt.ResultsUpload/ResultsUpload", {
					trigger: true
				});

			},
			// 点击颜色值传递参数过来problemValue, dataobj参数为了同步设置存在问题的数组
			showRemark: function(e, $showDiv, $score, curScore, tarClass, problemValue, dataobj) {
				// 获取备注信息
				var that = this,
					probdata = {};
				var $target = $(e.currentTarget),
					remarkmessage = $target.attr("data-remark");
				console.log(remarkmessage);
				remark = new Remark();
				remark.show(remarkmessage, that.tip_titile);
				// 点击确认
				$(".remarkTip").on("click", ".remark_confirm", function() {
					// 点击确定保存信息并且关闭弹出框
					var newMessage = $(".mainMsg")[0].value.trim();
					$(".mainMsg")[0].value = newMessage;
					$(".mainMsg").attr("readonly", "readonly");
					remark.hide();
					// 解绑
					$(".remarkTip").off();
				});
				// 点击取消
				$(".remarkTip").on("click", ".remark_cancel", function() {
					// 点击确定保存信息并且关闭弹出框
					remark.hide();
					// 解绑
					$(".remarkTip").off();
				});
			},
			// 计算平均分数
			calculateAverageScore: function() {
				var that = this;
				var $sub_item = $(".sub_item");
				var estAver = 0,
					scoreAver = 0,
					repeatAver = 0,
					ratmLen = 0;
				_.each($sub_item, function(item, index) {
					$score_item = $(item);
					var estsum = 0,
						scoresum = 0,
						repeatsum = 0;
					_.each($score_item, function(editCore, index) {
						$scoreNum = $(editCore);
						$editCore = $scoreNum.find(".editCoreDetail");
						ratmLen = $editCore.length;
						_.each($editCore, function(scoreNum, index) {
							$scoreNum = $(scoreNum);
							// console.log($scoreNum);
							var reptime = $scoreNum.find(".repeat").attr("data-value") || 0;
							var scoreEsti = $scoreNum.find(".estimate").attr("data-value") || 0;
							var scoreVa = $scoreNum.find(".scoreValue").attr("data-value") || 0;
							estsum += parseInt(scoreEsti, 10);
							scoresum += parseInt(scoreVa, 10);
							repeatsum += parseInt(reptime, 10);
						});
						// 设置rtam项平均分数
						var $averScore = $editCore.parent().prev(".sub_item_title");
						estAver = (estsum / ratmLen).toFixed(1);
						scoreAver = (scoresum / ratmLen).toFixed(1);
						repeatAver = (repeatsum / ratmLen).toFixed(0);
						$averScore.find(".estAver").text(estAver).attr("data-value", estAver);
						$averScore.find(".scoreAver").text(scoreAver).attr("data-value", scoreAver);
						$averScore.find(".repeatAver").text(repeatAver).attr("data-value", repeatAver);
					});
				});
			},
			handelCore: function(e) {
				var $target = $(e.currentTarget),
					className = $target.attr("class"),
					$parent = $target.parents(".sub_item");
				if (className == "toggleDown") {
					console.log("down");
					$parent.find(".toggleUp").show();
					$parent.find(".toggleDown").hide();
					$parent.find(".itemCantain").hide();
				} else if (className == "toggleUp") {
					$parent.find(".toggleUp").hide();
					$parent.find(".toggleDown").show();
					$parent.find(".itemCantain").show();
				}
				// 隐藏所有项目
			},
			// 将暂存的分数赋值给当前页面与课程打分页面不同
			renderTemp: function() {
				var that = this;
				var template = $('#resultGather_template').html();
				this.baseParams = Piece.Store.loadObject("baseParams");
				var params = this.baseParams;
				// 获取回显数据
				var data = Util.getLessonInfoFromCacheByType(this.baseParams, Util.CACHE_TYPE_PEND_4_DISP);
				console.log("data-------");
				console.log(data);
				if (data) {
					data.lang = Locale;
					var webSite = _.template(template, data);
					$('#scroller').append(webSite);
					// 计算平均分
					that.calculateAverageScore();
					// 弹出是否上传
					//-1 - 不用显示
					// 0 - 不通过
					// 1 - 通过
					var message = Util.parseUrl().message;
					that.uploadHandle(message);
					this.myScroll = new iScroll('wrapper', {
						hScroll: false,
						checkDOMChanges: true
					});
				}
				this.setHeaderinfo();
			},
			setHeaderinfo: function() {
				var courseInfo = {},
					studentInfo = {},
					stuSeat = "",
					Params, courseInfoText, studentInfoText;
				Params = this.baseParams;
				// console.log("Params=======");
				// console.log(Params);
				if (Params.studentSeat == "L") {
					stuSeat = Locale.stuPF;
				} else if (Params.studentSeat == "R") {
					stuSeat = Locale.stuPNF;
				}

				var data = Util.getDownloadCourse(Params.courseId);
				if (data) {
					var result = data.result;
					courseInfo.courseYear = result.courseYear || "";
					courseInfo.courseYearperiod = result.courseYearperiod || "";
					courseInfo.actype = result.actype || "";
					courseInfo.courseType = result.courseType || "";
					courseInfo.lessonNo = Params.lessonNo || "";
					courseInfo.lessonType = Params.lessonType || "";
					// studentInfo.studentSeat = Params.studentSeat || "";
					studentInfo.studentId = Params.studentId || "";
					studentInfo.pnf = Params.pnf || "";
					courseInfoText = [courseInfo.courseYear + Locale.year,
						courseInfo.courseYearperiod,
						courseInfo.actype + Locale.acType,
						courseInfo.courseType + Locale.course,
						Locale.the + courseInfo.lessonNo + Locale.lesson,
						"(" + courseInfo.lessonType + ")"
					].join("");
					studentInfoText = ["PF：" + studentInfo.studentId,
						"(" + stuSeat + ")",
						" | ",
						"PNF：" + studentInfo.pnf
					].join("");
				}
				$(".courseInfo").text(courseInfoText);
				$(".rightTop").text(studentInfoText);
			},
			onShow: function() {

				//write your business logic here :)
				var that = this;
				that.renderTemp();
			}
		}); //view define

	});