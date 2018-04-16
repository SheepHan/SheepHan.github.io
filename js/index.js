require('emf');
require('emf/src/js/util/util-nativepi');
require('pop');
let guanggaoTmpl = require('../tmpl/guanggao.html');
let index1Tmpl = require('../tmpl/index1.html');
let index2Tmpl = require('../tmpl/index2.html');
let index3Tmpl = require('../tmpl/index3.html');
import common from '../js/matchcommon';
import {
    RData
} from '@commonjs/config';
import SignUp from '@commonjs/signupdata';
import {
    setColor,
    getOrderStyle,
    setPercent
} from '@commonjs/tmplHelpers';
module.attachTplHelper = () => {
    EM.Template.helper('setColor', setColor);
    EM.Template.helper('getOrderStyle', getOrderStyle);
    EM.Template.helper('setPercent', setPercent);
};
//广告
module.loadPage_GuangGao = () => {
    RData.guanggao("GAGD/GetGAGD", {
        type: "gmapph5",
        code: 'gmapph5_00000005'
    }, (json) => {
        if (json.Result.gmapph5_00000005) {
            $("#top_banner").html(EM.Template.render(guanggaoTmpl, json.Result.gmapph5_00000005));
        }
    });
};
//一键报名大赛
module.loadPage_YJBMDS = () => {
    if (common.account.isLogin) {
        SignUp.getSignUp(common.account.passport.ct, common.account.passport.ut, common.account.passport.uid,
            function(returnValue) {
                if (!returnValue.isSignUpCurrent) {
                    $("a.yjbm").show();
                } else {
                    $("a.yjbm").hide();
                }
            });
    }
};
module.loadEvents_YJBMDS = () => {
    $("#yjbmds").click(function() {
        if (!common.account.isLogin) {
            common.login(function() {
                location.replace(location.href);
            });
        } else {
            location.href = $(this).attr("href");
        }
        return false;
    });
};
//现金奖奖励榜
module.loadPage_XJJJLB = () => {
    RData.matchJsonp("vhacsrq", {
        type: "vthacs_reward_money",
        userId: common.account.passport.uid,
        pgNo: 1,
        pgType: 10
    }, (json) => {
        if (json.rewardinfo && json.rewardinfo.length > 0) {
            $("#xjjjlbList").html(EM.Template.render(index1Tmpl, json));
            module.loadEvents_XJJJLB_Item();
            /**/
            var li1 = $("#xjjjlbList li").eq(0);
            if (li1.next()) {
                li1.next().after(li1);
            }
        }
    });
};
module.loadEvents_XJJJLB_Item = () => {
    $("#xjjjlbList li").click(function() {
        var zhbs = $(this).attr("zhbs");
        var zhtype = $(this).attr("zhtype");
        var zhuid = $(this).attr("zhuid");
        location.href = "zhdetail.html?zhbs=" + zhbs + "&zhtype=" + zhtype + "&zhuid=" + zhuid;
    });
};
//收益榜
module.loadPage_SYB = () => {
    //总收益榜
    RData.matchJsonp("vhacsrq", {
        type: "vthacs_get_rank",
        rankType: "10000",
        userId: common.account.passport.uid,
        pgNo: 1,
        pgType: 10
    }, (json) => {
        if (json.data && json.data.length > 0) {
            json.data.map(function(item) {
                item.ifConserned = 0;
            });
            /**/
            RData.matchJsonp("vhacsrq", {
                type: "vthacs_concrened_zuhes",
                userId: common.account.passport.uid,
                recIdx: 0,
                recCnt: 1000,
                cb: "cb1"
            }, (json2) => {
                if (json2.data && json2.data.length > 0) {
                    var list = json.data;
                    var list2 = json2.data;
                    for (var i = 0; i < list.length; i++) {
                        for (var j = 0; j < list2.length; j++) {
                            if (list[i].zhbs == list2[j].zhbs) {
                                list[i].ifConserned = 1;
                                break;
                            }
                        }
                    }
                }
                $("#zsybtip").hide().next().show();
                $("#zsybList").html(EM.Template.render(index2Tmpl, json));
                module.loadEvents_SYB_Item("#zsybList");
            });
        } else {
            $("#zsybtip").text("暂无更多数据");
        }
    });
    //日收益榜
    RData.matchJsonp("vhacsrq", {
        type: "vthacs_get_rank",
        rankType: "10001",
        userId: common.account.passport.uid,
        pgNo: 1,
        pgType: 10
    }, (json) => {
        if (json.data && json.data.length > 0) {
            json.data.map(function(item) {
                item.ifConserned = 0;
            });
            /**/
            RData.matchJsonp("vhacsrq", {
                type: "vthacs_concrened_zuhes",
                userId: common.account.passport.uid,
                recIdx: 0,
                recCnt: 1000,
                cb: "cb2"
            }, (json2) => {
                if (json2.data && json2.data.length > 0) {
                    var list = json.data;
                    var list2 = json2.data;
                    for (var i = 0; i < list.length; i++) {
                        for (var j = 0; j < list2.length; j++) {
                            if (list[i].zhbs == list2[j].zhbs) {
                                list[i].ifConserned = 1;
                                break;
                            }
                        }
                    }
                }
                $("#rsybtip").hide().next().show();
                $("#rsybList").html(EM.Template.render(index2Tmpl, json));
                module.loadEvents_SYB_Item("#rsybList");
            });
        } else {
            $("#rsybtip").text("暂无更多数据");
        }
    });
};
module.loadEvents_SYB_Tab = () => {
    $('.rank>li').click(function() {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
        $('.option-cell').eq($this.index()).removeClass('tab-hide').siblings().addClass('tab-hide');
    });
};
module.loadEvents_SYB_Item = (listID) => {
    $(listID + " a[gzzt='0']").click(function() {
        if (common.account.isLogin && SignUp.signUpData.isSignUpCurrent) {
            var zhbs = $(this).attr("zhbs");
            RData.matchJsonp("vhacsmodify", {
                type: "vtha_add_concern",
                userId: common.account.passport.uid,
                ctToken: common.account.passport.ct,
                utToken: common.account.passport.ut,
                zhbs: zhbs
            }, (json) => {
                if (json.result == "0") {
                    $(this).hide().siblings().show();
                } else {
                    $('body').popup({
                        title: '温馨提示',
                        message: json.message,
                        popClass: 'pop-c-one',
                        ok: "确认",
                        onOk: function() {}
                    });
                }
            });
        } else {
            if (!common.account.isLogin) {
                common.login(function() {
                    location.replace(location.href);
                });
            } else if (!SignUp.signUpData.isSignUpCurrent) {
                location.href = "signup.html";
            }
        }
        return false;
    });
    $(listID + " a[gzzt='1']").click(function() {
        if (common.account.isLogin && SignUp.signUpData.isSignUpCurrent) {
            var zhbs = $(this).attr("zhbs");
            RData.matchJsonp("vhacsmodify", {
                type: "vtha_cancel_concern",
                userId: common.account.passport.uid,
                ctToken: common.account.passport.ct,
                utToken: common.account.passport.ut,
                zhbs: zhbs
            }, (json) => {
                if (json.result == "0") {
                    $(this).hide().siblings().show();
                } else {
                    $('body').popup({
                        title: '温馨提示',
                        message: json.message,
                        popClass: 'pop-c-one',
                        ok: "确认",
                        onOk: function() {}
                    });
                }
            });
        } else {
            if (!common.account.isLogin) {
                common.login(function() {
                    location.replace(location.href);
                });
            } else if (!SignUp.signUpData.isSignUpCurrent) {
                location.href = "signup.html";
            }
        }
        return false;
    });
    $(listID + " li").click(function() {
        var zhbs = $(this).attr("zhbs");
        var zhtype = $(this).attr("zhtype");
        var zhuid = $(this).attr("zhuid");
        location.href = "zhdetail.html?zhbs=" + zhbs + "&zhtype=" + zhtype + "&zhuid=" + zhuid;
    });
};
//大赛公告
module.loadPage_DSGG = () => {
    RData.gonggao("Info/GetListData", {
        columnid: 979,
        page: 1,
        pagesize: 10
    }, (json) => {
        if (json.Status == 0 && json.Result && json.Result.items.length > 0) {
            $("#dsggtip").hide().next().show();
            $("#dsggList").html(EM.Template.render(index3Tmpl, json.Result));
            module.loadEvents_DSGG_Item();
        } else {
            $("#dsggtip").text("暂无更多数据");
        }
    });
};
module.loadEvents_DSGG_Item = () => {
    $("#dsggList li").click(function() {
        var code = $(this).attr("code");
        if (AG.InApp) {
            AG.openInfoweb(code);
        } else {
            location.href = "https://emwap.eastmoney.com/info/detail/" + code;
        }
    });
};
module.loadPage = () => {
    common.setTitle("首页");
    module.loadPage_GuangGao();
    module.loadPage_YJBMDS();
    module.loadPage_XJJJLB();
    module.loadPage_SYB();
    module.loadPage_DSGG();
};
module.loadEvents = () => {
    module.loadEvents_YJBMDS();
    module.loadEvents_SYB_Tab();
};
module.initialize = () => {
    common.checkLogin(function() {
        module.attachTplHelper();
        module.loadPage();
        module.loadEvents();
    }, false);
};
module.initialize();