require('emf');
require('emf/src/js/util/util-nativepi');
require('pop');
let guanggaoTmpl = require('../tmpl/guanggao.html');
let listTmpl = require('../tmpl/toplist.html');
let pageNum = 0;
let pageSize = 10;
let hasMore = true;
let listType = 0; //更多类型
import common from '../js/matchcommon';
import {
    RData
} from '@commonjs/config';
import {
    setColor,
    getOrderStyle,
    setPercent,
    setMMColor
} from '@commonjs/tmplHelpers';
module.attachTplHelper = () => {
    EM.Template.helper('setColor', setColor);
    EM.Template.helper('getOrderStyle', getOrderStyle);
    EM.Template.helper('setPercent', setPercent);
    EM.Template.helper('setMMColor', setMMColor);
};
module.bindList = () => {
    pageNum += 1;

    RData.juejin("Rank/GetUserNewTran", {
        userid: 0,
        pgno: pageNum,
        pgType: pageSize
    }, (json) => {
        if (json.result == 0) {
            if (json.totalCnt > 0) {
                $("#dsggList").append(EM.Template.render(listTmpl, json));
            }
            if (json.totalCnt == 0 || json.totalCnt < pageSize) {
                $(".com-tip").text('暂无更多数据');
                hasMore = false;
            }
        }
    })
};
module.loadPage = () => {

    listType = common.GetRequest().listType;
    //广告
    RData.guanggao("GAGD/GetGAGD", {
        type: "gmapph5",
        code: 'gmapph5_00000001'
    }, (json) => {
        $("#top_banner").html(EM.Template.render(guanggaoTmpl, json));
    });
    //数据列表
    module.bindList(listType);
};
module.loadEvents = () => {
    $(window).unbind("scroll").bind("scroll", function(e) {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(this).height();
        if (scrollTop + windowHeight == scrollHeight) {
            if (hasMore) {
                module.bindList();
            }
        }
    });
};

module.initialize = () => {
    common.checkLogin(function() {
        if (!common.user.isLogin) {
            location.href = "../pop/index.html";
        } else {
            module.attachTplHelper();
            module.loadPage();
            module.loadEvents();
        }
    });
};
module.initialize();