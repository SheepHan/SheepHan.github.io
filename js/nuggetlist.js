//import js
require('emf')
require('emf/src/js/util/util-nativepi')
require('pop')
import {RData} from '@commonjs/config'
import common from '../js/matchcommon'
import {setColor,setMMColor} from '@commonjs/tmplHelpers'
import SignUp from '@commonjs/signupdata';
//import hmtl
let guanggaoTmpl = require('../tmpl/guanggao.html');
let topTemp = require('../tmpl/nuggetlist.top.html')
let mrTemp = require('../tmpl/nuggetlist.mr.html')
let mcTemp = require('../tmpl/nuggetlist.mc.html')
let zuheTemp = require('../tmpl/nuggetlist.zuhe.html')

let topHeadTemp = require('../tmpl/nuggetlist.head.top.html')
let mrHeadTemp = require('../tmpl/nuggetlist.head.mr.html')
let mcHeadTemp = require('../tmpl/nuggetlist.head.mc.html')
let zuheHeadTemp = require('../tmpl/nuggetlist.head.zuhe.html')

window.isajax = false;
let pageNum = 0;
let pageSize = 20;
let hasMore = true;

module.getQueryString = (name) => {   
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return '';
}

let rankType = module.getQueryString("listType");
//top 100
module.GetTopData = () => {
    RData.juejin("Rank/GetUserNewTran",{
        userid:0,
        pgno:pageNum,
        pgType:pageSize
        },(json)=>{
            if(json.result == 0){
                if (json.data.length > 0) {
                    let data = json.data;
                    $("#dataMoreList").append(EM.Template.render(topTemp, {topData:data}));
                }
                if (json.data.length == 0 || json.data.length < pageSize) {
                    $(".com-tip").text("暂无更多数据");
                    hasMore = false;
                }
                window.isajax = false;
            }else{
                $(".com-tip").text("暂无更多数据");
                hasMore = false;
            }
    })
}
//热门买
module.GetHotMrData = () => {    
    RData.juejin("Rank/GetHotStockRanking",{
        tranType:0,
        userid:0,
        pgno:pageNum,
        pgType:pageSize
        },(json)=>{
            if(json.result == 0){
                if (json.data.length > 0) {
                    let data = json.data;
                    $("#dataXdMoreList").append(EM.Template.render(mrTemp, {mrData:data}));
                }    
                if (json.data.length == 0 || json.data.length < pageSize) {
                    $(".com-tip").text("暂无更多数据");
                    hasMore = false;
                }
                window.isajax = false;
            }else{
                $(".com-tip").text("暂无更多数据");
                hasMore = false;
            }
    })
}
//热门卖
module.GetHotMcData = () => { 
    RData.juejin("Rank/GetHotStockRanking",{
        tranType:1,
        userid:0,
        pgno:pageNum,
        pgType:pageSize
        },(json)=>{
            if(json.result == 0){
                if (json.data.length > 0) {
                    let data = json.data;
                    $("#dataXdMoreList").append(EM.Template.render(mcTemp, {mcData:data}));
                }
                if (json.data.length == 0 || json.data.length < pageSize) {
                    $(".com-tip").text("暂无更多数据");
                    hasMore = false;
                }
                window.isajax = false;
            }else{
                $(".com-tip").text("暂无更多数据");
                hasMore = false;
            }
    })
}
//人气关注
module.GetAttentionData = () => { 
    RData.juejin("Rank/GetAttentionRateRanking",{
        userid:0,
        pgno:pageNum,
        pgType:pageSize
        },(json)=>{
            if(json.result == 0){
                if (json.data.length > 0) {
                    let data = json.data;
                    if(common.account.isLogin){
                        module.getMyFollowedList(data);
                    }else{
                        data.map(function (item) {
                        item.isfocus = false;
                    })
                    $("#dataZhMoreList").html(EM.Template.render(zuheTemp, {zuheData: data}));
                    }
                }
                if (json.data.length == 0 || json.data.length < pageSize) {
                    $(".com-tip").text("暂无更多数据");
                    hasMore = false;
                }
                window.isajax = false;
            }else{
                $(".com-tip").text("暂无更多数据");
                hasMore = false;
            }
    })
}

// 我的关注列表
module.getMyFollowedList = (setData) => {
	RData.matchJsonp("vhacsrq", {
        type: "vthacs_concrened_zuhes",
        userId: common.account.passport.uid,
        recIdx: 0,
        recCnt: 1000,
        cb: 'cb'
      }, (json) => {
        setData.map(function (item) {
            item.isfocus = false;
          if(json.result == 0 && json.data.length>0){
            json.data.map(function (d) {
              if (d.zhbs && item.zhbs && d.zhbs == item.zhbs) {
                item.isfocus = true;
              }
            })
          }
        })
        $("#dataZhMoreList").append(EM.Template.render(zuheTemp, {zuheData:setData}));
      });
}

module.focusEvents = () => {
  $(document).delegate(".addFocus", "click", function () {
    if(common.account.isLogin && SignUp.signUpData.isSignUpCurrent){
        let $this = $(this);
        RData.matchJsonp("vhacsmodify", {
          type: 'vtha_add_concern',
          ctToken: common.account.passport.ct,
          utToken: common.account.passport.ut,
          userId: common.account.passport.uid,
          zhbs: $this.attr('zhbs')
        }, (json) => {
          if (json.result == 0) {
            $this.addClass('already').text('已关注');
          } else {
            module.popTip(json.message);
          }
        })
    }else{
        if (!common.account.isLogin) {
            common.login(function() {
                location.reload();
            });
        } else if (!SignUp.signUpData.isSignUpCurrent) {
            location.href = "signup.html";
        }
      return false;
    }
  })
  
  $(document).delegate(".cnlFocus", "click", function () {
    if(common.account.isLogin && SignUp.signUpData.isSignUpCurrent){
        let $this = $(this);
        RData.matchJsonp("vhacsmodify", {
          type: 'vtha_cancel_concern',
          ctToken: common.account.passport.ct,
          utToken: common.account.passport.ut,
          userId: common.account.passport.uid,
          zhbs: $this.attr('zhbs')
        }, (json) => {
          if (json.result == 0) {
            $this.removeClass('already').text('关注');
          } else {
            module.popTip(json.message);
          }
        })
    }else{
        if (!common.account.isLogin) {
            common.login(function() {
                location.reload();
            });
        } else if (!SignUp.signUpData.isSignUpCurrent) {
            location.href = "signup.html";
        }
      return false;
    }
  })
}

module.getMoreData = () => {
    if (window.isajax) {
        return false;
    }
    window.isajax = true;

    if (hasMore) {
        pageNum += 1;
        switch (rankType) {
            case 'top':
                module.GetTopData();
                break;
            case 'mr':
                module.GetHotMrData();
                break;
            case 'mc':
                module.GetHotMcData();
                break;
            case 'zh':
                module.GetAttentionData();
                break;
        } 
    }
};



module.loadPage = () => {
    //广告
    RData.guanggao("GAGD/GetGAGD", {
        type: "gmapph5",
        code: 'gmapph5_00000005'
    }, (json) => {
        if(json.Result.gmapph5_00000005){
            json.Result.gmapph5_00000005.JumpUrl="javascript:;";
            $("#new_banner").html(EM.Template.render(guanggaoTmpl, json.Result.gmapph5_00000005));
        }
        
    });
	module.getMoreData();
}
module.loadEvents = () => {
    module.setTitleFuc();
    module.focusEvents();
        $(".contain").on("click", "#dataMoreList li,#dataZhMoreList li", function (e) {
            if (!e.target.getAttribute("stoptoparent")) {
                let zhbs = $(this).data("zhbs");
                let userid = $(this).data("userid");
                location.href = "zhdetail.html?zhtype=1&zhbs=" + zhbs+"&zhuid="+userid;;
            }
        });
    
      //买入下单
      $(document).delegate(".tradeBuy", "click", function () {
        if(common.account.isLogin && SignUp.signUpData.isSignUpCurrent){
          let $this = $(this);
          let curCode= $this.data('code');
          window.location.href ='/H5/trade/buy.html?code='+curCode+'&mkt=HK&zjzh='+SignUp.signUpData.current.fundid;
        }else{
            if (!common.account.isLogin) {
                common.login(function() {
                    location.reload();
                });
            } else if (!SignUp.signUpData.isSignUpCurrent) {
                location.href = "signup.html";
            }
          return false;
        }
      })
  
      //卖出下单
      $(document).delegate(".tradeSale", "click", function () {
        if(common.account.isLogin && SignUp.signUpData.isSignUpCurrent){
          let $this = $(this);
          let curCode= $this.data('code');
          window.location.href ='/H5/trade/sale.html?code='+curCode+'&mkt=HK&zjzh='+SignUp.signUpData.current.fundid;
        }else{
            if (!common.account.isLogin) {
                common.login(function() {
                    location.reload();
                });
            } else if (!SignUp.signUpData.isSignUpCurrent) {
                location.href = "signup.html";
            }
          return false;
        }
      })
    $(window).scroll(function () {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(this).height();

        if ((scrollHeight - scrollTop - windowHeight) <= 20 && hasMore) {
            module.getMoreData();
        }
    });
}
module.popTip = (message) => {
    $('body').popup({
      title: '温馨提示',
      message: message,
      popClass: 'pop-c-one'
    });
}
module.attachTmplHelper = () => {
  EM.Template.helper('setColor',setColor);
  EM.Template.helper('setMMColor',setMMColor);
}
module.setTitleFuc = () => {
    switch (rankType) {
        case 'top':
            $("#listTitle").html(EM.Template.render(topHeadTemp,''));
            module.setTitle('赛季100强最新成交');
            break;
        case 'mr':
            $("#listXdTitle").html(EM.Template.render(mrHeadTemp,''));
            module.setTitle('今日热门买入股');
            break;
        case 'mc':
            $("#listXdTitle").html(EM.Template.render(mcHeadTemp,''));
            module.setTitle('今日热门卖出股');
            break;
        case 'zh':
            $("#listZhTitle").html(EM.Template.render(zuheHeadTemp,''));
            module.setTitle('人气关注组合');
            break;
    } 
}

module.setTitle = (title) => {
    setTimeout(function(){
        common.setTitle(title);
    }, 200);
}
module.initialize = () => {
	common.checkLogin(function() {
        module.attachTmplHelper();
        if (common.account.isLogin) {
            SignUp.getSignUp(common.account.passport.ct, common.account.passport.ut, common.account.passport.uid,
                function(returnValue) {
                  module.loadEvents();
                  module.loadPage();
                });
        }else{
        module.loadEvents();
        module.loadPage();
        }
    }, false);
}

module.initialize();