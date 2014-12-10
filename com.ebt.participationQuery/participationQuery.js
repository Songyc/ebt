define(['text!com.ebt.participationQuery/participationQuery.html', 'text!com.ebt.participationQuery/template/participationQuery_template.html', '../base/util', '../base/openapi', 'i18n!../base/nls/messageResource', '../base/idangerous.swiper-2.1.min','i18n!../com.ebt.participationQuery/nls/participationQuery'],
	function(viewTemplate, participationQuery_template, Util, OpenAPI, baseLocale, swiper,Locale) {
		return Piece.View.extend({
			id: 'com.ebt.participationQuery_participationQuery',
			datas: null,
			events: {
				"click .coursebtn": "showdialog",
				"click .dialogdel": "closedialog",
				'click .queryList': 'queryList',
				"click header img": "returnBack",
				"click .time": "chooseCourseTime"
			},
			//导航
			returnBack: function() {
				var url = 'com.ebt.course/allCourse';
				this.navigateModule(url, {
					trigger: true
				});
			},
			//时间控件
			chooseCourseTime:function(){
				//调用（显示）系统原生选择日期的控件
				//console.log(courseYear+'-'+courseYearPeriod);
 				cordova.exec(function(obj) {
 					//obj = '2014年-上半年';
 					var word = obj.split('-');
 					var courseYear = $(".courseYear").text(word[0]+Locale.year+" "+word[1]);
 					//$('.obj').val(obj);
 				}, function(e) {
 					console.log("Error: " + e);
 				}, "DatePlugin", "showDatePickView", [10, $('.courseYear').text().substr(0,4)+'-'+$('.courseYear').text().substr(6)]);
 				// var obj = '2014年-上半年';
 				// var word = obj.split('-');
 				// var courseYear = $(".courseYear").text(word[0]+" "+word[1]);
 				// console.log($(".courseYear").text().substr(6));
 				//console.log($('.courseYear').text().substr(0,4)+'-'+$('.courseYear').text().substr(6));
			},
			//显示课程详细信息
			queryList: function(e) {
				var that = this;
				var target = $(e.currentTarget).find('.listItemSide');
				console.log($(e.currentTarget));
				target.show();
				//console.log('=============' + target);
				that.showCourse(target);
			},
			//复制课程信息，放到下面显示
			showCourse: function(target) {
				var that = this;
				var clone = target.clone();
				$('.showCourse').html('');
				$('.showCourse').append(clone);
				$('.showCourse').show();
				target.hide();
			},
			paramsObj: {
				cacheId: "participationQuery_participationQuery",
				isReloadRequest: true
			},
			//显示查询信息
			showdialog: function() {
				var that = this;
				//console.log(that.value);
				var value = $('.studentId').val();
				if(value.length == 0 && value == ''){
					$('.names').css('color','red');
					Piece.Toast(Locale.write_studentName);
				}
				else{
					$('.names').css('color','#000');
					//if(Util.checkConnection()){
						that.renderingTemplate();
					// }
					// else{
					// 	Piece.Toast(baseLocale.network_not_available);
					// }
				}
			},
			//隐藏查询框
			closedialog: function() {
				$(".searchDailog").hide();
				$(".masker").hide();
				$('.studentId').val('');
			},
			render: function() {
				var viewTemp = _.template(viewTemplate,{
					lang:Locale
				})
				$(this.el).html(viewTemp + participationQuery_template);
				Piece.View.prototype.render.call(this);
				return this;
			},
			//判断学员还是教员
			stuOrInstr: function() {

			},
			paramOne:null,
			//渲染模板，请求数据
			renderingTemplate: function() {
				var that = this;
				var roles = Piece.Session.loadObject("roles");
				var rolesInfo;
				//var objTime = $('.obj').val();
				var word;
				var courseYear = $('.courseYear').text().substr(0,4);
				var courseYearPeriod = $('.courseYear').text().substr(6);
				//console.log(courseYearPeriod);
				paramOne = {
					"access_token": Piece.Session.loadObject("accessToken"),
				};
				if(courseYearPeriod === Locale.firstHalfYear){
					courseYearPeriod = 0;
				}
				else{
					courseYearPeriod = 1;
				}

				paramOne.courseYear = courseYear;
				paramOne.courseYearperiod = courseYearPeriod;
				
				var value = $('.name').find('input').val();
				paramOne.studentId = value;
				paramOne.instructorId = Piece.Session.loadObject('currentUserId');

				console.log(paramOne);
				Util.Ajax(
					//本地数据
					// OpenAPI.participationQuery_template,
					// null,
					//后台数据
					OpenAPI.completeCourseList,
					paramOne,
					null,
					function(data, textStatus, jqHRX) {
						//console.log('requestSuccess======================');
						var html = $('#participationQuery_template').html();
						//console.log(typeof data.result);
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							data.lang = Locale;
							console.log(data);
							var web = _.template(html, data);
							//把web作为子元素添加到前面
							$('.searchDailog').html('');
							$('.searchDailog').prepend(web);
							that.subString();
							that.slider();
							$(".searchDailog").show();
							$(".masker").show();
						} else {
							Piece.Toast(baseLocale.no_trainer_result_info);
						}
					},
					null,
					function(){},
					null
					// ,
					// that.paramsObj
				);

			},
			//动态添加外层div,课程横排序
			subString: function() {
				var length = $('.queryList').length;
				//var oDiv = document.createElement('div');
				var divLength = Math.ceil(length / 3);
				//每三个.queryList外加一个div层
				if ($('.searchbody>.queryList')[0]) {
					for (var j = 1; j <= divLength; j++) {
						var oDiv = document.createElement('div');
						oDiv.className = 'swiper-slide';
						//oDiv.style.height = '56px!important;';
						for (var i = 0; i < 3; i++) {
							if ($('.searchbody>.queryList')[0]) {
								oDiv.appendChild($('.searchbody>.queryList')[0]);
							}
						}
						$('.searchbody').append(oDiv);
					}
				}
				var width = $('.queryList').width();
				$('.searchbody').width(width * divLength);
			},
			//左右滑动，仿引导页面
			slider: function() {

				var mySwiper = new Swiper('.swiper-container', {
					pagination: '.pagination',
					paginationClickable: true
				})
				var width =  $('.swiper-pagination-switch').length*($('.swiper-pagination-switch').width()+20);
				 $('.pagination').width(width);
			},
			//获取当前时间年和上半年
			getTime:function(){
				var date = new Date();
				var fullYear = date.getFullYear()+Locale.year;
				
				var currentMonth = date.getMonth()+1;
				var courseYearPeriod;
				console.log(currentMonth);
				if(currentMonth>0 && currentMonth<7){
					courseYearPeriod = Locale.firstHalfYear;
				}
				else{
					courseYearPeriod = Locale.secondHalfYear;
				};
				$('.courseYear').text(fullYear+" "+courseYearPeriod);
				
			},
			//没有网络提示
			// noData:function(){
			// 		$('.content').hide();
			// 		Util.ResultWarn(document.body,baseLocale.network_not_available);
			// },
			onShow: function() {
				//消除一进页面时就显示弹出框
				var that = this;
				if(!Util.checkConnection()){
					Piece.Toast(baseLocale.network_not_available);
				}
				else{
					// $(".searchDailog").hide();
					that.getTime();
				}	
			}
		}); //view define
	});