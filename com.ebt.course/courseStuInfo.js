define(['text!com.ebt.course/courseStuInfo.html', "text!com.ebt.course/template/station_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/courseall", '../base/date'],
    function(viewTemplate, stationTemp, OpenAPI, Util, baseLocale, Locale, DateUtil) {
        return Piece.View.extend({
            id: 'com.ebt.course_courseStuInfo',
            events: {
                "click .beginCourseBtn": "beginCourse",
                "click .stationItem": "chooseStation",
                "click .leftTop": "goBack",
                "click .seattype": "chooseStutype",
                "click .dialog_cancel": "dialog_cancel",
                "click .dialog_Confirm": "dialog_Confirm",
                "click .trainDateInput": "chooseTrainTime"
            },
            nextPageUrl: "",
            goBack: function() {
                window.history.back();
            },
            chooseStutype: function(e) {
                var $curtarget = $(e.currentTarget),
                    $target = $(e.target),
                    targetValue = $target.text(),
                    $parent = $curtarget.parent(),
                    $LSide = $(".LSide"),
                    $RSide = $(".RSide"),
                    parClass = $parent.attr("class");
                if (parClass == "LSide") {
                    if (targetValue == "PF") {
                        $RSide.find(".pnf").addClass("active").siblings().removeClass("active");
                        $RSide.find("input").attr("data-value", "PNF");
                    } else if (targetValue == "PNF") {
                        $RSide.find(".pf").addClass("active").siblings().removeClass("active");
                        $RSide.find("input").attr("data-value", "PF");
                    }

                } else if (parClass == "RSide") {
                    if (targetValue == "PF") {
                        $LSide.find(".pnf").addClass("active").siblings().removeClass("active");
                        $LSide.find("input").attr("data-value", "PNF");
                    } else if (targetValue == "PNF") {
                        $LSide.find(".pf").addClass("active").siblings().removeClass("active");
                        $LSide.find("input").attr("data-value", "PF");
                    }

                }
                $curtarget.prev("input").attr("data-value", targetValue);
                $target.addClass("active").siblings().removeClass("active");
            },
            chooseStation: function(e) {
                $(".selectStation .stationItem").removeClass('stationItemActive');
                var $target = $(e.currentTarget);
                $target.addClass('stationItemActive');
            },
            beginCourse: function() {
                var that = this,
                    urlParam = Util.parseUrl(),
                    courseId = urlParam.courseId,
                    lessonId = urlParam.lessonId,
                    lessonNo = urlParam.lessonNo,
                    comeformUpload = urlParam.comefrom,
                    changeLocal = false,
                    lessonType = urlParam.lessonType,
                    startTime = urlParam.startTime,
                    trainTime = $('.trainDateInput').text(),
                    stuPF = $("input[data-value=PF]").val().trim(),
                    stuPNF = $("input[data-value=PNF]").val().trim(),
                    studentSeat = $("input[data-value=PF]").attr("data-studentSeat"),
                    station = me.find("div.stationItemActive").attr("data-value");
                //console.error(station);
                var reg = />+|'+|‘+|’+|“+|”+|"+|<+/;
                console.log(stuPF);
                console.log(reg.test(stuPF));
                var stationCodeValueDecode = me.find("div.stationItemActive").html();
                var stationCodeValue = encodeURIComponent(me.find("div.stationItemActive").html());
                if (Util.isNull(stuPF)) {
                    new Piece.Toast(baseLocale.stuPF_empty_tip);
                    return;
                } else if (reg.test(stuPF)) {
                    new Piece.Toast(Locale.userTip);
                    return;
                }
                if (!Util.isNull(stuPNF)) {
                    if (reg.test(stuPNF)) {
                        new Piece.Toast(Locale.userTip);
                        return;
                    }
                }
                stuPF = encodeURIComponent($("input[data-value=PF]").val().trim());
                stuPNF = encodeURIComponent($("input[data-value=PNF]").val().trim());
                // 验证是否允许上课
                var toUploadCourseData = Util.getLessonsFromCacheByType(Util.CACHE_TYPE_PEND);
                var tofinishCourseData = Util.getLessonsFromCacheByType(Util.CACHE_TYPE_UNFI);
                var toUploadCourseArr;
                var teacher = Piece.Session.loadObject(Util.CURRENT_USER_ID);
                var stuInfo = courseId + "_" + lessonId + "_" + teacher + "_" + stuPF;
                var stuInfoObj = {
                    "courseId": courseId,
                    "lessonId": lessonId,
                    "instructorId": teacher,
                    "studentId": stuPF,
                    "pnf": stuPNF,
                    "stationCode": station,
                    "stationCodeValue": stationCodeValueDecode
                };
                //判断待上传是否达到限制
                // 如果不是从上传页面进来的要对上传次数进行验证
                if (!comeformUpload) {
                    var toUpLen, tofiLen, totalLen;
                    if (toUploadCourseData) {
                        toUpLen = _.keys(toUploadCourseData).length;
                    }
                    if (tofinishCourseData) {
                        tofiLen = _.keys(tofinishCourseData).length;
                    }
                    totalLen = toUpLen + tofiLen;
                    if (totalLen > 59) {
                        new Piece.Toast(Locale.spaceTip);
                        return;
                    }
                } else if (!Util.isNull(tofinishCourseData)) {
                    // 如果是从上传页面进来的也要对待完成页面进行验证
                    toFinishCourseArr = _.keys(tofinishCourseData);
                    if (_.contains(toFinishCourseArr, stuInfo)) {
                        new Piece.Toast(Locale.overCourse);
                        return;
                    }
                }
                // 判断该学员是否已经上过课
                if (!Util.isNull(toUploadCourseData)) {
                    toUploadCourseArr = _.keys(toUploadCourseData);
                    if (_.contains(toUploadCourseArr, stuInfo)) {
                        new Piece.Toast(Locale.overCourse);
                        return;
                    }
                }
                if (!comeformUpload) {
                    that.nextPageUrl = "com.ebt.course/beforefly?courseId=" + courseId + "&lessonId=" + lessonId + "&lessonNo=" + lessonNo + "&lessonType=" + lessonType + "&stuPF=" + stuPF + "&stuPNF=" + stuPNF + "&station=" + station + "&stationCodeValue=" + stationCodeValue + "&startTime=" + startTime + "&studentSeat=" + studentSeat + "&trainTime=" + trainTime;
                } else {
                    if (comeformUpload == "ResultsUpload") {
                        that.nextPageUrl = "com.ebt.ResultsUpload/ResultsUpload";
                    } else if (comeformUpload == "toBeFinish") {
                        that.nextPageUrl = "com.ebt.toBeFinish/toBeFinish";
                    }
                    // 是否改变本地数据
                    changeLocal = true;
                }
                // checkpnf如果pnf通过在检查pf
                // pf参数
                var pfParam = {
                    "stuPF": stuPF,
                    "locationurl": that.nextPageUrl,
                    "changeLocal": changeLocal,
                    "stuInfoObj": stuInfoObj
                };
                // 如果有pnf验证pnf没有就验证pf
                if (stuPNF) {
                    that.checkPnfStudent(stuPNF, pfParam);
                } else {
                    that.checkPfStudent(pfParam);
                }
                // return true;
            },
            checkPnfStudent: function(stuPF, pfParam) {
                var that = this;
                var url = OpenAPI.exists;
                var params = {
                    "accountId": stuPF,
                    "access_token": Piece.Session.loadObject("accessToken")
                };
                if (that.checkConnection()) {
                    Util.Ajax(
                        url,
                        params,
                        function(xhr, settings) {},
                        function(data, text, jqHRX) {
                            if (data && data.result !== null && data.resultCode === 0) {
                                console.log(data);
                                // 如果存在就跳转
                                if (data.result.exists) {
                                    that.checkPfStudent(pfParam);
                                } else {
                                    that.showDialog(Locale.pnfstunoexsit);
                                }
                            } else {
                                // 网络不好就提示信息
                                that.showDialog(Locale.stuNotSure);
                            }
                        }
                    );
                } else {
                    that.showDialog(Locale.stuNotSure);
                }
            },
            checkPfStudent: function(pfParam) {
                var that = this;
                var goUrl = pfParam.locationurl;
                var url = OpenAPI.exists;
                var params = {
                    "accountId": pfParam.stuPF,
                    "student": true,
                    "access_token": Piece.Session.loadObject("accessToken")
                };
                if (that.checkConnection()) {
                    Util.Ajax(
                        url,
                        params,
                        function(xhr, settings) {},
                        function(data, text, jqHRX) {
                            if (data && data.result !== null && data.resultCode === 0) {
                                console.log(data);
                                // 如果存在就跳转
                                if (data.result.exists) {
                                    // 如果从上传页面过来的要修改本地数据
                                    if (pfParam.changeLocal) {
                                        // 修改本地数据
                                        that.changeLocalData(pfParam.stuInfoObj);
                                    }
                                    that.navigateModule(goUrl, {
                                        trigger: true
                                    });
                                } else {
                                    that.showDialog(Locale.pfstunoexsit);
                                }
                            } else {
                                // 网络不好就提示信息
                                that.showDialog(Locale.stuNotSure);
                            }
                        }
                    );
                } else {
                    that.showDialog(Locale.stuNotSure);
                }
            },
            changeLocalData: function(stuInfoObj) {
                var that = this,
                    urlParams = Util.parseUrl();
                if (urlParams.comefrom == "ResultsUpload") {
                    // 修改待上传详细列表数据
                    Util.setLessonInfoFromCacheByType(urlParams, Util.CACHE_TYPE_PEND_4_DISP, stuInfoObj);
                    // 修改待上传分数信息
                    Util.setLessonInfoFromCacheByType(urlParams, Util.CACHE_TYPE_PEND, stuInfoObj);
                    // 修改待上传回显信息
                    Util.setLessonsFromCacheByType4Srh(Util.CACHE_TYPE_PEND_4_DISP, urlParams, stuInfoObj);

                } else if (urlParams.comefrom == "toBeFinish") {
                    // 修改待完成详细列表数据
                    Util.setLessonInfoFromCacheByType(urlParams, Util.CACHE_TYPE_UNFI_4_DISP, stuInfoObj);
                    // 修改待完成上传分数信息
                    Util.setLessonInfoFromCacheByType(urlParams, Util.CACHE_TYPE_UNFI, stuInfoObj);
                    // 修改待完成分数回显信息
                    Util.setLessonsFromCacheByType4Srh(Util.CACHE_TYPE_UNFI_4_DISP, urlParams, stuInfoObj);
                }
            },
            checkConnection: function() {
                var networkState = navigator.network.connection.type || navigator.connection.type;
                if (Connection.NONE === networkState) {
                    return false;
                }
                return true;
            },
            dialog_Confirm: function() {
                this.hideDialog();
                var msg = $(".tipmsg").text();
                if (msg == Locale.pnfstunoexsit || msg == Locale.pfstunoexsit) {
                    console.log(msg);
                    return;
                }
                this.navigateModule(this.nextPageUrl, {
                    trigger: true
                });
            },
            dialog_cancel: function() {
                this.hideDialog();
            },
            showDialog: function(msg) {
                $(".tipmsg").text(msg);
                $(".uploadTip").show();
                $(".masker").show();
            },
            hideDialog: function() {
                $(".uploadTip").hide();
                $(".masker").hide();
            },
            requestData: function() {
                var that = this;
                var courseId = Util.request("courseId");
                var data = Util.getDownloadCourse(courseId);
                if (!Util.isNull(data)) {
                    data.lang = Locale;
                    that.renderTemp(data);
                } else {
                    new Piece.Toast(baseLocale.request_fail);
                }
            },
            renderTemp: function(data) {
                var that = this;
                var template = me.find("#station_template").html();
                var websiteHtml = _.template(template, data);
                $("#content").html("");
                $("#content").append(websiteHtml);
                // 判断是不是从上传页面过来的
                var comefrom = Util.request("comefrom");
                if (comefrom) {
                    $(".beginCourseBtn").text(Locale.confirm);
                }
                that.setDefaultTrainTime();
            },
            setDefaultTrainTime: function(time) {
                var that = this;
                var dateNew,
                    date,
                    dateLast,
                    dateLastSec,
                    timeSec,
                    dateSec,
                    timeInput;
                date = new Date;
                dateNew = DateUtil.dateFormat(date, "yyyy-MM-dd");
                timeInput = dateNew;
                dateLast = DateUtil.dateFormat(DateUtil.preYear(date), "yyyy-MM-dd");
                dateSec = that.getSec(dateNew);
                dateLastSec = that.getSec(dateLast);
                // 如果参数有值并且日期为过去一年到现在之间
                if (time) {
                    timeSec = that.getSec(time);
                    if ((timeSec < dateSec + 1) && (timeSec > dateLastSec - 1)) {
                        timeInput = time;
                    }else{
                        new Piece.Toast(Locale.trainTimeTip);
                    }
                }
                $(".trainDateInput").text(timeInput);
            },
            getSec: function(date) {
                return new Date(date.replace(/-/g, "/")).getTime();
            },
            chooseTrainTime: function() {
                //调用（显示）系统原生选择日期的控件
                var that = this;
                var time;
                var courseYear = $('.trainDateInput').text();
                cordova.exec(function(obj) {
                    time = obj;
                    that.setDefaultTrainTime(time);
                }, function(e) {
                    console.log("Error: " + e);
                }, "DatePlugin", "showDatePickView", [2, courseYear + " 00:00"]);
            },

            render: function() {
                //添加模板
                me = $(this.el);
                var viewT = _.template(viewTemplate, {
                    lang: Locale
                });
                viewT = viewT + stationTemp;
                me.html(viewT);
                Piece.View.prototype.render.call(this);
                return this;
            },
            onShow: function() {
                //write your business logic here :)
                var that = this;
                that.requestData();

                if (window.localStorage['lang'] !== "" && window.localStorage['lang'] !== undefined && window.localStorage['lang'] !== null && window.localStorage['lang'] === "en-us") {
                    $(".noStations").html("This course no training station information");
                } else {
                    $(".noStations").html(Locale.nodata);
                }



            }
        }); //by sqhom

    });