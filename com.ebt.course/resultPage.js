define(['text!com.ebt.course/resultPage.html', 'text!com.ebt.course/template/resultPage_template.html', 'text!com.ebt.course/template/resultPage_problem_template.html', '../base/util', '../base/openapi', '../base/components/remark', 'i18n!../com.ebt.course/nls/courseall', '../base/date'],
	function(viewTemplate, templateContent, problemListTemplate, Util, OpenAPI, Remark, Locale, DateUtil) {
		return Piece.View.extend({
			id: 'com.ebt.course_resultPage',
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
				"click .remark": "showRemark",
				"click .zcun": "saveData",
				'click .sub_title_pic img': 'handelCore',
				"click .submit": "uploadHandle",
				"click .score_item .score_pre": "score_reduce",
				"click .score_item .score_next": "score_add",
				"click .repeatAver .score_pre": "repeat_reduce",
				"click .repeatAver .score_next": "repeat_add",
				"keydown textarea.mainMsg": "wordsTip"
			},
			baseParams: null,
			myScroll: null,
			tip_titile: Locale.remark_title,
			otherinfo_titile: Locale.otherInfo_title,
			uploadHandle: function() {
				// 如果完成上传
				var saveData = this.saveData(1);
				if (saveData) {
					// 验证是否通过
					this.validIfpass();
				}
			},
			validIfpass: function() {
				var that = this,
					uploadParam = [],
					Params = this.baseParams;
				var param = {},
					courseTip,
					instructorid = Params.instructorId,
					studentid = Params.studentId,
					courseid = Params.courseId,
					lessonid = Params.lessonId;
				param = {
					"instructorId": instructorid,
					"studentId": studentid,
					"courseId": courseid,
					"lessonId": lessonid,
					"type": Util.CACHE_TYPE_PEND
				};
				uploadParam.push(param);
				console.log("uploadParam-----");
				console.log(uploadParam);
				// 如果没有网络直接提示没有网络跳转不执行下面的流程
				var checkNet = that.checkConnection();
				if (!checkNet) {
					var tip = encodeURIComponent(Locale.no_net);
					that.navigate("resultGather?message=" + tip, {
						trigger: true
					});
					return;
				}
				Util.uploadLessons(uploadParam, that.goUploadPage(that), true);
			},
			checkConnection: function() {
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					return false;
				}
				return true;
			},
			goUploadPage: function(that) {
				return function(argum) {
					var tip = that.messTip(argum);
					tip = encodeURIComponent(tip);
					that.navigate("resultGather?message=" + tip, {
						trigger: true
					});
				};
			},
			messTip: function(argum) {
				console.log(argum);
				/*
				-1 - 不用显示
				0 - 不通过
				1 - 通过
				*/
				var tip;
				var errorResult = argum.errorResult;
				var succResult = argum.succResult;
				if (errorResult.length > 0) {
					if (errorResult[0].resultData && errorResult[0].resultData.resultCode == 1) {
						tip = Locale.unknowenStu;
					} else {
						tip = Locale.unknowenpass;
					}
				} else if (succResult.length > 0) {
					if (succResult[0].resultData) {
						var pass = succResult[0].resultData.result.passed;
						if (pass == "1") {
							tip = Locale.succpass;
						} else if (pass == "0") {
							tip = Locale.failpass;
						} else if (pass == "-1") {
							tip = "noshow";
						}
					}
				}
				return tip;
			},
			repeat_reduce: function(e) {
				var $target = $(e.currentTarget);
				this.changerepeat(0, $target);
			},
			repeat_add: function(e) {
				var $target = $(e.currentTarget);
				this.changerepeat(1, $target);
			},
			changerepeat: function(addOrCut, $target) {
				var $root = $target.parents(".repeatAver"),
					$score = $root.find(".score"),
					// 获取当前分数
					curScore = parseInt($score.attr("data-value"), 10),
					num = parseInt($score.text(), 10);
				if (addOrCut) {
					if (num >= 2) {
						new Piece.Toast(Locale.repeat_tip);
					}
					if (curScore < 3) {
						curScore++;
						$score.attr("data-value", curScore).find("span").text(curScore);
					}
				} else {
					if (curScore > 0) {
						curScore--;
						$score.attr("data-value", curScore).find("span").text(curScore);
					}
				}
			},
			score_reduce: function(e) {
				var $target = $(e.currentTarget);
				this.changeScore(0, $target);
			},
			score_add: function(e) {
				var $target = $(e.currentTarget);
				this.changeScore(1, $target);
			},
			//检测还能输多少字
			wordsTip: function() {
				var wordLen = 200 - $(".mainMsg")[0].value.trim().length;
				console.log($(".mainMsg")[0].value.trim().length);
				var tip = Locale.input + wordLen + Locale.word;
				$('.wordsTip').text(tip);
			},
			// 编辑分数
			changeScore: function(addOrCut, $target) {
				var that = this;
				var probdata = {},
					scoreArrId = 0,
					$root = $target.parents(".score_item"),
					$parScore = $target.parents(".sub_item_detail"),
					$score = $parScore.find(".score"),
					// 获取当前分数
					curScore = parseInt($score.attr("data-value"), 10),
					// 获取存在问题数组
					proValue = $(".problem").attr("data-problem"),
					// 记录当前存在问题数组
					problemValue = JSON.parse(proValue),
					classList = $score.attr("class"),
					// 当前分数项classlist
					tarClass = "." + classList.split(" ")[1],
					// 当前父类classlist
					parclassList = $target.parent().attr("class"),
					partarClass = parclassList.split(" ")[1],
					$editDiv = $target.parents(".editCoreDetail"),
					$showDiv = $editDiv.next(".showCoreDetail"),
					// 获取备注信息
					$remark = $editDiv.find(".remark"),
					// 获取分数区间在此区间则改变数字
					rtamid = $editDiv.attr("data-rtamid"),
					problArr = $editDiv.attr("data-proscoresarr"),
					// 获取rtam名称
					rtamName = $editDiv.find(".rtamName").attr("data-name"),
					// 获取分数可选择的范围
					numRange = $editDiv.attr("data-scoreranges"),
					// 获取分数数组详细信息
					scoreArrStr = $editDiv.attr("data-scorearr"),
					// 得分标准
					scoreStand = "",
					// 获取红色项分数
					warnScore = $editDiv.attr("data-warnscore");
				scoreArr = JSON.parse(scoreArrStr);
				// 点击的是重复次数========
				// 点击的是分数============
				if (addOrCut) {
					// 先判断当前分数是否在分数区间不在则再--保证分数不变
					curScore++;
				} else {
					curScore--;
				}
				// 获取分数相用来修改对应的ID
				_.each(scoreArr, function(item, index) {
					if (item.score === parseInt(curScore, 10)) {
						scoreArrId = item.scoreId;
						scoreStand = item.remark;
					}
				});
				console.log(scoreArrId);
				// 如果分数在给定的分数区间修改分数
				if (numRange.indexOf(curScore) > -1) {
					// 如果点击的为成绩评定分数
					if (partarClass == "scoreItem") {
						// 提示评分标准
						if (scoreStand) {
							new Piece.Toast(scoreStand);
						}
						var dataobj = {
							"name": rtamName,
							"id": rtamid
						};
						// 如果当前分数为红色项分数触发对话框
						if (curScore == warnScore) {
							// 传入分数项
							this.showRemark(null, $showDiv, $score, curScore, tarClass, problemValue, dataobj, scoreArrId, $remark, $root, partarClass);
							// $remark.trigger("click", [$showDiv, $score, curScore, tarClass, problemValue, dataobj,scoreArrId]);
						} else {
							// 如果点到的不是红色项则隐藏备注
							// 如果是黄色去掉高亮删除所在问题中的item项
							if (problArr.indexOf(curScore) > -1) {
								problemValue = that.getProArr(problemValue, dataobj);
							} else {
								// 如果不是黄色项则加入数组
								_.each(problemValue, function(item, index) {
									if (item.id == dataobj.id) {
										problemValue.splice(index, 1);
									}
								});
							}
							$showDiv.find(tarClass).find("span").attr("id", "");
							$remark.hide();
							$showDiv.find(".remark").attr("data-remark", "");
							$showDiv.find(".remark").hide();
							$score.attr("data-value", curScore).find("span").text(curScore);
							$score.attr("data-scoreid", scoreArrId);
							$showDiv.find(".scoreValue").attr("data-scoreid", scoreArrId);
							probdata.remarkArr = problemValue;
							this.renderproblist(probdata);
							var datapro = JSON.stringify(problemValue);
							$(".problem").attr("data-problem", datapro);
							// 获取不可编辑下的相同类名的字段设置其值
							$showDiv.find(tarClass).attr("data-value", curScore).find("span").text(curScore);
							// 如果分数为4分或者5分的时候同步分数到成绩评定或者预估评分
							if (curScore == "4" || curScore == "5") {
								that.checkIfAsycScore($root, curScore, scoreArrId, partarClass);
							}
						}
					} else {
						// 点击预估分数
						$score.attr("data-value", curScore).find("span").text(curScore);
						$score.attr("data-estimate", scoreArrId);
						$showDiv.find(".estimate").attr("data-estimate", scoreArrId);
						// 获取不可编辑下的相同类名的字段设置其值
						$showDiv.find(tarClass).attr("data-value", curScore).find("span").text(curScore);
						// 如果分数为4分或者5分的时候同步分数到成绩评定或者预估评分
						if (curScore == "4" || curScore == "5") {
							that.checkIfAsycScore($root, curScore, scoreArrId, partarClass);
						}
					}
				}
				// 计算平均分
				this.calculateAverageScore();
			},
			// 当预评估分=4或5的时候，就自动给评分=4或5同时改变不能编辑的数据状态
			checkIfAsycScore: function($root, curScore, scoreArrId, partarClass) {
				var $scoreItem;
				var itemScore;
				var scroeType = "";
				// 获取不可编辑的元素以便修改分数
				var $showItem = $root.next();
				// 这一段为新增
				if (partarClass == "scoreItem") {
					// 后来只有预评估分=4或5的时候，就自动给评分=4或5，但是评分为4或者5分时，不需要将预估分变为4或5.
					return;
				}
				// 这一段为新增end
				if (partarClass == "scoreItem") {
					scroeType = ".estimateItem";
					$showScoreItem = $showItem.find(".estimate");
				} else if (partarClass == "estimateItem") {
					scroeType = ".scoreItem";
					$showScoreItem = $showItem.find(".scoreValue");
				}

				var $tar = $root.find(scroeType);
				$scoreItem = $tar.find(".score");
				if ($scoreItem.length < 1) {
					return;
				}
				if (partarClass == "scoreItem") {
					$scoreItem.attr("data-estimate", scoreArrId);
					$showScoreItem.attr("data-estimate", scoreArrId);
				} else if (partarClass == "estimateItem") {
					$scoreItem.attr("data-scoreid", scoreArrId);
					$showScoreItem.attr("data-scoreid", scoreArrId);
				}
				$scoreItem.attr("data-value", curScore).find("span").text(curScore);
				$showScoreItem.attr("data-value", curScore).find("span").text(curScore);
			},
			// 弹出编辑备注
			// 点击颜色值传递参数过来problemValue, dataobj参数为了同步设置存在问题的数组
			showRemark: function(e, $showDiv, $score, curScore, tarClass, problemValue, dataobj, scoreArrId, $remark, $root, partarClass) {
				// 获取备注信息
				var that = this,
					probdata = {};
				// 如果存在事件说明是点击备注进入否则是选择分数触发
				if (e && e.currentTarget) {
					$target = $(e.currentTarget);
				} else {
					$target = $remark;
				}
				var remarkmessage = $target.attr("data-remark");
				console.log(remarkmessage);
				remark = new Remark();
				remark.show(remarkmessage, that.tip_titile);
				that.wordsTip();
				// 点击确认
				$(".remarkTip").on("click", ".remark_confirm", function() {
					// 点击确定保存信息并且关闭弹出框
					var newMessage = $(".mainMsg")[0].value.trim();
					$(".mainMsg")[0].value = newMessage;
					if (newMessage.length < 1) {
						Piece.Toast(Locale.remark_content);
						return;
					}
					if (newMessage.length > 200) {
						new Piece.Toast(Locale.maxLen);
						return;
					}
					console.log(newMessage);
					$target.attr("data-remark", newMessage);
					// 设置颜色值以及高亮当前分数值
					// 如果传了参数
					if ($score) {
						// 如果本身就包含了存在问题说明里面则不添加
						// 获取存在问题数组
						problemValue = that.getProArr(problemValue, dataobj);
						probdata.remarkArr = problemValue;
						that.renderproblist(probdata);
						var datapro = JSON.stringify(problemValue);
						// 把存在问题列表存进dom中
						$(".problem").attr("data-problem", datapro);
						$showDiv.find(".remark").attr("data-remark", newMessage);
						// 保存备注信息
						$showDiv.find(tarClass).find("span").attr("id", "lhscore");
						$score.attr("data-value", curScore).find("span").text(curScore);
						$score.attr("data-scoreid", scoreArrId);
						// 显示备注按钮
						$target.show();
						$showDiv.find(".remark").show();
						// 获取不可编辑下的相同类名的字段设置其值
						$showDiv.find(tarClass).attr("data-value", curScore).find("span").text(curScore);
						// 如果分数为4分或者5分的时候同步分数到成绩评定或者预估评分
						if (curScore == "4" || curScore == "5") {
							that.checkIfAsycScore($root, curScore, scoreArrId, partarClass);
						}
						// 计算平均分
						that.calculateAverageScore();

					}
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
				// 判断输入字数
				$(".mainMsg").on("input", function() {
					that.wordsTip();
				});
			},
			// 返回存在问题数组
			getProArr: function(problemValue, dataobj) {
				var ifExsit = false;
				_.each(problemValue, function(item, index) {
					if (item.id == dataobj.id) {
						ifExsit = true;
					}
				});
				if (!ifExsit) {
					problemValue.push(dataobj);
				}
				return problemValue;
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
						// 不保留小数
						repeatAver = (repeatsum / ratmLen).toFixed(0);
						$averScore.find(".estAver").text(estAver).attr("data-value", estAver);
						$averScore.find(".scoreAver").text(scoreAver).attr("data-value", scoreAver);
						//$averScore.find(".repeatAver").text(repeatAver).attr("data-value", repeatAver);
					});
				});
			},
			handelCore: function(e) {
				var $target = $(e.currentTarget),
					className = $target.attr("class"),
					$parent = $target.parents(".sub_item");
				switch (className) {
					case "showCore":
					case "editCore":
						if (className == "editCore") {
							$parent.find(".repeatAver").find(".editrepeat").show().siblings().hide();
							$parent.find(".editCore").hide();
							$parent.find(".showCore").show();
						} else if (className == "showCore") {
							$parent.find(".repeatAver").find(".showrepeat").show().siblings().hide();
							$parent.find(".editCore").show();
							$parent.find(".showCore").hide();
						}
						$parent.find(".score_item ").addClass("disNone");
						// 展示所需项目
						$parent.find("." + className + "Detail").removeClass("disNone");
						break;
					case "toggleDown":
					case "toggleUp":
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

						break;
				}
				this.myScroll.refresh();
				// 隐藏所有项目
			},
			// 暂存
			saveData: function(valid) {
				// 获取上传分数数据
				var options = {};
				var datainfo = this.setlocalScore(valid);
				// 如果没有通过验证则返回
				if (!datainfo) {
					return;
				}
				options.scoreInfo = datainfo.scoreInfo;
				// 继承默认参数对象
				var common = $(".improve_text")[0].value;
				var otherInfo = $(".otherinfo_text")[0].value;
				this.baseParams.common = common;
				this.baseParams.otherInfo = otherInfo;
				// 记录结束时间
				var dateEnd = new Date();
				this.baseParams.endTime = DateUtil.dateFormat(dateEnd, "yyyy/MM/dd hh:mm");
				if (valid == 1) {
					this.baseParams.finish = "true";
				}
				options = _.extend(options, this.baseParams);
				// 上传分数参数
				// console.log(this.baseParams);
				// console.log(options);
				// 同步分数到缓存(用来回显)
				if (valid == 1) {
					Util.cacheLessonInfoByType(this.baseParams, options, Util.CACHE_TYPE_PEND);
					this.updatelocaldata(options, valid);
				} else {
					Util.cacheLessonInfoByType(this.baseParams, options, Util.CACHE_TYPE_UNFI);
					this.updatelocaldata(options);
				}
				// 获取用来验证是否上传成功
				// var datatest = Util.getLessonInfoFromCacheByType(this.baseParams, 1);
				// console.log("datatest");
				// console.log(datatest);
				return true;
			},
			setlocalScore: function(valid) {
				var that = this;
				var $sub_list = $(".sub_item");
				// 用来验证第四点
				$(".subjectName").attr("style", "");
				var Validation = true,
					ValidA = true,
					repeatValue,
					datainfo = {};
				// 分数数组
				var scoreInfo = [],
					scoreTestInfo = [];
				_.each($sub_list, function(item, index) {
					// 用来验证第四点
					var ValidsameScore = true;
					// 科目
					var scoreParam = null;
					var subValue = $(item).attr("data-subjectId"),
						checked = $(item).attr("data-checked"),
						repeatValue = $(item).find(".repeatAver").find(".repeat").attr("data-value");
					$sub = $(item).find(".showCoreDetail");
					_.each($sub, function(subitem, subindex) {
						// 检查项
						var $subItem = $(subitem);
						var rtamValue = $subItem.attr("data-rtamId"),
							scoreValue = $subItem.find(".scoreValue").attr("data-value"),
							warnScore = $subItem.attr("data-warnScore"),
							scoreId = $subItem.find(".scoreValue").attr("data-scoreid"),
							estimateValue = $subItem.find(".estimate").attr("data-value"),
							gradeValue = $subItem.find(".estimate").attr("data-estimate"),
							remarkValue = $subItem.find(".remark").attr("data-remark");
						// 如果是第二课时或者第三课时预估评分为undefined，默认成""
						if (typeof gradeValue == "undefined" || gradeValue == "none") {
							gradeValue = "";
						}
						// 如果是第1课时或者第3课时预估评分为undefined，默认成""
						if (typeof repeatValue == "undefined") {
							repeatValue = 0;
						}
						scoreParam = {
							"subjectId": subValue,
							"ratmId": rtamValue,
							"estimate": gradeValue,
							"estimateValue": estimateValue || "",
							"scoreId": scoreId,
							"scoreValue": scoreValue,
							"warnScore": warnScore,
							"repeat": repeatValue,
							"checked": checked || "",
							"remark": remarkValue || ""
						};
						// 如果vaild===1,验证打分信息打分规则如下
						// 1. 含预评估分和评定分数
						// 2. 当成绩评定与评估分不一致，重复次数不能为0，需要>=1
						// 3. 当重复次数=3，提示该操作已重复3次
						// 4. 如果选择与评估分和成绩评定一致，则不记录一次重复次数
						//例如，默认为4分，最后预估=5，评定=5，不记录重复次数
						if (valid === 1) {
							// 如果为第一课程
							if (that.baseParams.lessonNo == 1) {
								if (estimateValue != scoreValue) {
									ValidsameScore = false;
									if (repeatValue == 0) {
										Validation = false;
										$(item).find(".subjectName").css({
											"color": "#f00"
										});
										return;
									}
								}
							}
						}
						scoreTestInfo.push(scoreValue);
						scoreInfo.push(scoreParam);
					});
					if (valid === 1 && that.baseParams.lessonNo == 1) {
						// 用来验证第四点
						if (ValidsameScore && repeatValue > 0) {
							ValidA = false;
							$(item).find(".subjectName").css({
								"color": "#f00"
							});

							return;
						}
					}
				});
				if (valid === 1) {
					// 验证第二点
					if (!Validation) {
						new Piece.Toast(Locale.repeat_tip1);
						return;
					}
					if (!ValidA) {
						// 验证第四点
						new Piece.Toast(Locale.repeat_tip2);
						return;
					}
					var unipArr = _.uniq(scoreTestInfo);
					if (scoreTestInfo.length>1&&unipArr.length < 2) {
						new Piece.Toast(Locale.warnTip);
						return;
					}
				}
				// 保留验证逻辑
				datainfo.scoreInfo = scoreInfo;
				datainfo.Validation = Validation;
				return datainfo;
			},
			// 同步分数到缓存
			updatelocaldata: function(options, option) {
				// 取出数据进行对比
				var courseId = this.baseParams.courseId;
				var data = Util.getDownloadCourse(courseId);
				var params = this.baseParams; // 根据参数获取课时信息
				var courseData = data.result.lessons[params.lessonNo - 1];
				courseData = _.extend(courseData, params);
				_.each(courseData.seqs, function(seq_item, index) {
					_.each(seq_item.subjects, function(subject_item, index) {
						_.each(subject_item.ratms, function(ratms_item, index) {
							// 将页面数据与缓存数据对比修改缓存数据
							_.each(options.scoreInfo, function(item, index) {
								// 如果科目ID与检查要素ID都相等，则为缓存数据新增分数字段
								if (subject_item.subjectId == item.subjectId && ratms_item.ratmId == item.ratmId) {
									ratms_item.scoreId = item.scoreId;
									ratms_item.scoreValue = item.scoreValue;
									ratms_item.remark = item.remark;
									ratms_item.repeat = item.repeat;
									ratms_item.estimate = item.estimate;
									ratms_item.estimateValue = item.estimateValue;
									ratms_item.warnScore = item.warnScore;
									// 设置重复次数
									subject_item.repeat = item.repeat;
									// 记录是否被点击
									subject_item.checked = item.checked;
									console.log(item.remark);
								}
							});
						});
					});
				});
				if (option == 1) {
					Util.cacheLessonInfoByType(params, courseData, Util.CACHE_TYPE_PEND_4_DISP);
					console.log("tijiao");
				} else {
					console.log("zancun");
					Util.cacheLessonInfoByType(params, courseData, Util.CACHE_TYPE_UNFI_4_DISP);
					Piece.Toast(Locale.zcSuccess);
				} // 用来查看信息是否保存
				// var huixian = Util.getLessonInfoFromCacheByType(this.baseParams, 4);
				// console.log(huixian);
			},
			// 将暂存的分数赋值给当前页面与课程打分页面不同
			renderTemp: function() {
				var that = this;
				var template = $('#resultPage_template').html();
				this.baseParams = Piece.Store.loadObject("baseParams");
				var params = this.baseParams;
				// 获取回显数据
				var data = Util.getLessonInfoFromCacheByType(this.baseParams, Util.CACHE_TYPE_UNFI_4_DISP);
				console.log("data-------");
				console.log(data);
				if (data) {
					data.lang = Locale;
					var webSite = _.template(template, data);
					$('#scroller').append(webSite);
					// 计算平均分
					that.calculateAverageScore();
					this.myScroll = new iScroll('wrapper', {
						hScroll: false,
						checkDOMChanges: true
					});
				} else {
					Util.ResultWarn(that.el, Locale.nodata);
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
			renderproblist: function(data) {
				var problemListtemplate = $('#resultPage_problem_template').html();
				data.noproblem = Locale.noproblem;
				data.exsitProblem = Locale.exsitProblem;
				var protem = _.template(problemListtemplate, data);
				$('.problem').html("");
				$('.problem').append(protem);
				this.myScroll.refresh();
			},
			onShow: function() {

				//write your business logic here :)
				var that = this;
				that.renderTemp();
			}
		}); //view define

	});