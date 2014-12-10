define(['text!com.ebt.trainResultView/trainView.html', 'com.ebt.trainResultView/flotr.amd', '../base/openapi', '../base/util', "text!com.ebt.trainResultView/template/trainView.html", "i18n!../base/nls/messageResource", '../base/idangerous.swiper-2.1.min',"i18n!../com.ebt.trainResultView/nls/trainResultView"],
  function(viewTemplate, Flotr, OpenAPI, Util, trainViewTemp, baseLocale, swiper, Locale) {
    return Piece.View.extend({
      id: 'com.ebt.trainResultView_trainView',
      events: {
        "click .leftTop": "goBack",
        "click .tabItem": "tab",
        "click .slide_right": "slide_next",
        "click .slide_left": "slide_pre"
      },
      mySwiper: null,
      data: null,
      tab: function(e) {
        var that = this;
        $target = $(e.currentTarget);
        var parentId = $target.parent().attr("id");
        $("#" + parentId + " .tabItem").removeClass('tabActive');
        $target.addClass('tabActive');
        var id = $target.attr("id");
        var year = id.split("_")[0];
        var type = id.split("_")[1];
        if (!Util.isNull(that.data)) {
          that.tabToCanvas(that.data, year, type);
        } else {
          new Piece.Toast(baseLocale.request_fail);
        }

      },
      goBack: function() {
        window.history.back();
      },
      render: function() {
        //添加模板
        me = $(this.el);
        var viewT = _.template(viewTemplate, {
          lang: Locale
        });
        viewT = viewT + trainViewTemp;
        me.html(viewT);
        Piece.View.prototype.render.call(this);
        return this;
      },
      requestLocalDataSuccess: function(data) {
        var that = this;
        that.renderTemp(data);
        that.beginCanvas(data);
        that.setSwiperWrapperWidth();
        that.mySwiper = new Swiper('.swiper-container', {
          onSlideChangeStart: function() {
            $(".slide_left").hide();
            $(".slide_right").hide();
          },
          onSlideChangeEnd: function() {
            var len = that.mySwiper.slides.length;
            var index = that.mySwiper.activeIndex;
            if (index == 0 && len > 1) {
              $(".slide_right").show();
            } else if (index == (len - 1)) {
              $(".slide_left").show();
            } else {
              $(".slide_left").show();
              $(".slide_right").show();
            }
          }
          //by sqhom
        });
      },
      slide_pre: function() {
        this.mySwiper.swipePrev();
      },
      slide_next: function() {
        this.mySwiper.swipeNext();
      },
      renderTemp: function(data) {
        console.log("template");
         data.lang = Locale;
        var that = this;
        var template = me.find("#trainView_template").html();
        var websiteHtml = _.template(template, data);
        $(".swiper-wrapper").html("");
        $(".swiper-wrapper").append(websiteHtml);
      },
      canvasCode: function(data, type, TYPE, tyepArr, year, minValue, maxValue) {
        if (typeof tyepArr !== "undefined" && tyepArr !== null && tyepArr !== "" && tyepArr.length !== 0) {
          $("#error" + year).hide();
          var container = document.getElementById("annualItems" + year);

          function basic(container) {
            // Radar Labels
            var item = "item";
            var score = "score";
            ticks = [];
            for (var i = 0; i < data[TYPE].length; i++) {
              var ticksItem = [];
              ticksItem.push(i);
              ticksItem.push(data[TYPE][i].item)
              ticks.push(ticksItem);
            }
            var DATA = [];
            for (var i = 0; i < data[TYPE].length; i++) {
              var DATAItem = [];
              DATAItem.push(0);
              DATAItem.push(data[TYPE][i].score)
              DATA.push(DATAItem);
              //  DATA.push("["+0+","+data[TYPE][i].score+"]");
            }
            //  console.error(DATA);
            var s1 = {
                data: DATA
              },
              graph, ticks;
            // Draw the graph.
            graph = Flotr.draw(container, [s1], {
              radar: {
                show: true
              },
              grid: {
                circular: true,
                minorHorizontalLines: true
              },
              yaxis: {
                min: minValue,
                max: maxValue,
                minorTickFreq: 1
              },
              xaxis: {
                ticks: ticks
              },
              mouse: {
                track: true
              }
            });
          }
          basic(container);
        } else {
          //先请空canvas
          $("#annualItems" + year).html("");
          $("#error" + year).show();
        }
      },
      beginCanvas: function(data) {
        var that = this;
        var resultCode = data.resultCode;
        var myData = data.result;
        //画图开始
        if (resultCode === 0 && typeof myData !== "undefined" && myData !== null && myData !== "" && myData.length !== 0) {
          _.each(myData, function(item, index) {
            // console.error(item);
            that.canvasCode(item, "annualItems", "annualItems", item.annualItems, item.year, item.min, item.max);
          });
        }
      },
      tabToCanvas: function(data, year, type) {
        var that = this;
        var resultCode = data.resultCode;
        var myData = data.result;
        //画图开始
        if (resultCode === 0 && typeof myData !== "undefined" && myData !== null && myData !== "" && myData.length !== 0) {
          _.each(myData, function(item, index) {
            if ((item.year).toString() === year) {
              if (type === "annualItems") {
                that.canvasCode(myData[index], type, type, item.annualItems, item.year, item.min, item.max);
              }
              if (type === "firstHalfYearItems") {
                that.canvasCode(myData[index], type, type, item.firstHalfYearItems, item.year, item.min, item.max);
              }
              if (type === "secondHalfYearItems") {
                that.canvasCode(myData[index], type, type, item.secondHalfYearItems, item.year, item.min, item.max);
              }
            }
          });
        }

        /* },
            function(e, xhr, type) {},
            function() {},
            null,
            that.tabToCanvas_paramsObj
          );*/
      },
      setSwiperWrapperWidth: function() {
        var len = $(".swiper-slide").length;
        var SlideW = $(".swiper-slide").width();
        $(".swiper-wrapper").width((SlideW * len) + "px !important");
      },
      // 获取数据并且存在本地中
      /*------------------------获取数据并且存在本地中逻辑注释
      getData: function() {
        var that = this;
        var userAbilityKey = Util._getUserAbilityKey(Util.CACHE_USER_ABILITY);
        console.info(userAbilityKey);
        var networkState = navigator.network.connection.type || navigator.connection.type;
        if (Connection.NONE === networkState) {
          var data = Piece.Store.loadObject(userAbilityKey);
          if (!Util.isNull(data)) {
            that.navigateModule(url, {
              trigger: true
            });
          } else {
            new Piece.Toast(baseLocale.network_not_available);
            return;
          }
        } else {
          Util.requestUserAbility(function() {
            that.getLocaleData();
          }, function() {
            var data = Piece.Store.loadObject(userAbilityKey);
            if (!Util.isNull(data)) {
              that.getLocaleData();
            } else {
              new Piece.Toast(baseLocale.request_fail);
              return;
            }
          });
        }
      },
------------------------获取数据并且存在本地中逻辑注释end*/
      getData: function() {
        var that = this;
        var networkState = navigator.network.connection.type || navigator.connection.type;
        if (Connection.NONE === networkState) {
          new Piece.Toast(baseLocale.network_not_available);
          return;
        } else {
          Util.requestUserAbility(function(data, textStatus, jqXHR) {
            that.getLocaleData(data, textStatus, jqXHR);
          }, function() {
            new Piece.Toast(baseLocale.request_fail);
            return;
          });
        }
      },
      // 获取存在本地数据
      getLocaleData: function(data, textStatus, jqXHR) {
        var that = this;
        that.data = data;
        if (!Util.isNull(data)) {
          that.requestLocalDataSuccess(data);
        } else {
          Util.ResultWarn(that.el, baseLocale.no_data);
        }
      },
      onShow: function() {
        var that = this;
        Util.clearWarn(that.el);
        that.getData();
      }
    }); //by sqhom

  });