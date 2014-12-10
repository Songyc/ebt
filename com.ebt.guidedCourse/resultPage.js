define(['text!com.ebt.guidedCourse/resultPage.html','text!com.ebt.guidedCourse/template/guidedResultPage_template.html','../base/util','../base/openapi','i18n!../base/nls/messageResource','i18n!../com.ebt.guidedCourse/nls/resultPage'],
	function(viewTemplate,guidedResultPage_template,Util,OpeaAPI,baseLocale,Locale) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_resultPage',
			events:{
				'click .leConter img': 'show'
			},
			headerContent:function(){
					//var leftTopConter = data.result.courseYear+data.result.courseYearperiod+data.result.courseName;
					$('.time.leftTop').text(courseYear+courseName+lessonType);
					$('.pfName').text(pf);
					$('.pnfName').text(pnf);
					if(studentseat=="L"){
						studentseat=Locale.stuPF;
					}else if(studentseat=="R"){
						studentseat=Locale.stuPNF;
					}
					$('.pnfSkillLevel').text(studentseat);
					//console.log(courseYear+courseName);
			},
			//平均分数
			countScore:function(){
				$.each($('.template'),function(index,item){
					var esti = 0, scor = 0 ,rep = 0;
					var estimate = $(this).find('.checkElement .estimate').find('span');
					var score2 = $(this).find('.checkElement .score2').find('span');
					var repeat = $(this).find('.checkElement .repeat').find('span');					
					
					var that = $(this);
					function eachItem(obj){
						var name = '.'+$(obj).parent().attr('class');
						var priScore = 0;
						if(name.match('redCount')){
							name = '.score2';
						}
						//console.log(typeof name);
						$.each(obj,function(index_obj,item_obj){
							priScore =parseInt(item_obj.innerHTML)+priScore;
						});
						priScore = (priScore.toFixed(1)/obj.length).toFixed(1);
						// 重复次数没有小数点
						if(repeat==obj){
							priScore=parseInt(priScore).toFixed(0);
						}
						that.find('.lesson').find(name).text(priScore);
					}
					if(lessonType.match(Locale.thirdCourse)){
						eachItem(score2);
						$.each($(item).find('.estimate span'),function(index,item_s){
							var text = $(item_s).text('');
						})
						$.each($(item).find('.repeat span'),function(index,item_s){
							var text = $(item_s).text('');
						})
						$('.sup_list .estimate').text('');
						$('.sup_list .repeat').text('');
					}
					else if (lessonType.match(Locale.secondCourse)) {
						eachItem(score2);
						eachItem(repeat);
						var width = $('.sup_list').width()*0.49;
						$('.estimate').hide(width);
						$('.score2').width(width);
						$('.repeat').width(width);
					}
					else{
						eachItem(estimate);
						eachItem(score2);	
						eachItem(repeat);
					}
				});
			},
			//加红色小球
			redCount:function(){
				
				$.each($('.checkElement'),function(index ,item){
					var color = $(this).attr('data-color');
					if(color ==='#f00' || color === 'red' || color === '#F00' || color ==='#ff0000' || color ==='#FF0000'){

						// $.each($('.redCount'),function(index,item){
						// 	var text = parseInt($(this).text());
						// 	if(text<3){
						$(this).find('.redCount div').addClass('redCircle');
						$(this).find('.redCount span').css('color','white');
						//console.log($(this));
						// 	}
						// 	//console.log(typeof text);
						// })
					}
				})
			},
			//height:null,
			//切换向上向下的图片
			show:function(e){
				//$('#scroller').height(0);
				var height;
				
			 	var that = this;
				var urlDown = '/base/img/u02_normal.ing';
				var urlUp = '/base/img/u01_normal.ing';
				
				$(e.currentTarget).parents('.template').find('.checkElement').toggle();

				var url = $(e.currentTarget)[0].src;
				
				if(url.match(urlUp)){
					$(e.currentTarget)[0].src = '..'+urlDown;
				}
				else{
					$(e.currentTarget)[0].src = '..'+urlUp;
				}
				myScroll.refresh();
			},
			render: function() {
				var viewTemp = _.template(viewTemplate,{
					lang:Locale
				})
				$(this.el).html(viewTemp+guidedResultPage_template);

				Piece.View.prototype.render.call(this);
				return this;
			},
			//获取url参数
			lessonId:null,
			courseId:null,
			studentId:null,
			pf:null,
			pnf:null,
			studentseat:null,
			courseYear:null,
			courseName:null,
			lessonType:null,
			//resultId:null,
			getParams:function(){
				var url = location.href;
				url = decodeURI(url);
				var param = Util.parseUrl(url);
				console.log(param);
				lessonId = param['lessonId'];
				courseId = param['courseId'];
				studentId = param['studentId'];
				resultId = param['resultId'];
				pf = param['pf'];
				pnf = param['pnf'];
				studentseat = param['studentseat'];
				courseYear = param['courseYear'];
				courseName = param['courseName'];
				lessonType = param['lessonType'];

				console.log(lessonType.match(Locale.secondCourse));
				//console.log(lessonId);
			},
			//渲染模块，请求数据
			renderTemp:function(){
				var that = this;
				this.getParams();
				var param = {
					"courseId" : courseId,
					"lessonId" : lessonId,
					"studentId" : studentId, 
					"instructor" : Piece.Session.loadObject('currentUserId'),
					"access_token" : Piece.Session.loadObject('accessToken'),
					"resultId": resultId
				}
				//console.log(param);
				Util.Ajax(
					//本地数据
					// OpeaAPI.guidedResultPage_template,
					// null,
					// 后台数据
					OpeaAPI.queryLessonScore,
					param,
					null,
					function(data, text, jqHRX) {
						//console.log(data);	
						if(data && data.result !== null && data.resultCode === 0 && data.result.length !== 0){
							data.lang = Locale;
							//console.log(data,data.lang.courseList);
							var template = $('#guidedResultPage_template').html();
							var webSite = _.template(template, data);
							$('.content').append(webSite);
						}else{
							Util.ResultWarn(document.body,Locale.no_data);
						}
						that.redCount();
						that.countScore();
						that.iScroll();
					},
					null,
					function(){},
					null
					);
				//console.log(OpeaAPI.guidedResultPage_template);
			},
			myScroll:null,
			//滑动
			iScroll: function() {
				// $('.courseList').height(0);
				// var height = $('.courseList').height();

				// $('.courseList').height(height+200);
				myScroll = new iScroll('wrapper', {
					onRefresh:function(){
						myScroll.refresh();
					},
					checkDOMChanges: true
				});

			},
			//没有网络提示
			// noData:function(){
			// 		$('.content').hide();
			// 		Util.ResultWarn(document.body,baseLocale.network_not_available);
			// },
			onShow: function() {
				//write your business logic here :)
				var that = this;
				if(!Util.checkConnection()){
					Piece.Toast(baseLocale.network_not_available);
				}
				else{
					this.renderTemp();
					//this.addClass();
					that.getParams();
					that.headerContent();
				}

				// setTimeout(that.countScore,300);
			}
		}); //view define

	});