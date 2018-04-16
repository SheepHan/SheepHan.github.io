require('emf')
require('emf/src/js/util/util-nativepi')
import { setColor, JumpHKQuotation } from '@commonjs/tmplHelpers'
import FastClick from 'fastclick'
import echarts from '@commonjs/echarts.min'
import bottompop from './bottompop'
import GubaData from '@commonjs/gudadatas'
import common from '../js/matchcommon'
import { RData } from '@commonjs/config'

let zhMainTemp = require('../tmpl/zhdetail.main.html')
let gbDisgustTemp = require('../tmpl/zhdetail.gb.html')
let zhFooterTemp = require('../tmpl/zhdetail.footer.html')
let zhMathMainTemp = require('../tmpl/zhdetail.dasai.main.html')

const showEmoji = (txt) => {
  let t = ['微笑', '大笑', '鼓掌', '不说了', '为什么', '哭', '不屑', '怒', '滴汗', '拜神', '胜利', '亏大了', '赚大了', '牛', '俏皮', '傲', '好困惑', '兴奋', '赞', '不赞', '摊手', '好逊', '失望', '加油', '困顿', '想一下', '围观', '献花', '大便', '爱心', '心碎', '毛估估', '成交', '财力', '护城河', '复盘', '买入', '卖出', '满仓', '空仓', '抄底', '看多', '看空', '加仓', '减仓'], s = new RegExp('\\[.+?\\]', 'ig')
  return txt.replace(s, function (e) {
    for (var i = 0; i < t.length; i++) {
      if ('[' + t[i] + ']' == e) {
        return 9 > i ? '<img title="' + t[i] + '" src="http://gbres.dfcfw.com/face/emot/emot0' + (i + 1) + '.png" alt="' + e + '">' : '<img title="' + t[i] + '" src="http://gbres.dfcfw.com/face/emot/emot' + (i + 1) + '.png" alt="' + e + '">'
      }
    }
    return e
  })
}

/**
 * 组合标识
 */
module.zhbs = ''

/**
 * 该组合对应的zjzh 也就是 fundid
 */
module.zjzh = ''

/**
 * 组合标识对应的股吧id
 */
module.gubaid = ''

/**
 * 该组合对应的Uid
 */
module.zhuid = ''

/**
 * 组合类型 0：模拟；1：大赛
 */
module.zhtype = '0'

/**
 * 评论页码
 */
module.commentpageno = 1

/**
 * 评论排序 1：倒叙 -1：正序
 */
module.commentpagesort = 1

/**
 * 每页评论数
 */
module.commentpagecount = 10

/**
 * 是否正在加载评论
 */
module.isLoadingcomment = false

/**
 * 是否在app里面
 */
module.inApp = AG.InApp
//module.inApp = true

/**
 * 判断是不是当前登录用户自己
 */
module.isSelf=()=>{
  return common.account.isLogin ? common.account.passport.uid == module.zhuid : false
}

/**
 * 模板辅助方法添加
 */
module.attachTmplHelper = () => {
  EM.Template.helper('setColor', setColor)
  EM.Template.helper('jumpHKQuotation', JumpHKQuotation)
  EM.Template.helper('renderCommentText', showEmoji)
  EM.Template.helper('showItem', value => {return value && value.length > 0 ? value : '--'})
  EM.Template.helper('optClass', value => {return value == '买入' ? 'font_red' : 'font_green'})
  EM.Template.helper('getCode', value => {return value.substr(3)})
  EM.Template.helper('getMarket', value => {return value.substr(0, 2)})
  EM.Template.helper('getBuyName', isself => {return isself ? '模拟买入' : '跟买'})
  EM.Template.helper('getSaleName', isself => {return isself ? '模拟卖出' : '跟卖'})
  EM.Template.helper('getUpedClass', isuped => {return isuped ? 'icons-uped' : ''})
  EM.Template.helper('getTradeDate', tradeDate => {
    return tradeDate && tradeDate.length == 8 ? tradeDate.substring(0, 4) + '<br>' + tradeDate.substring(4, 6) + '/' + tradeDate.substring(6, 8) : ''
  })
  EM.Template.helper('getReplyTime', (replyTime) => {
    return replyTime && replyTime.length == 19 ? replyTime.substring(5, 16) : ''
  })
  EM.Template.helper('jumpBuyPage', (zjzh, isself, market, code, name) => {
    return  isself ? common.jumpMockTradeBuy(zjzh, 'HK', code, name) : common.jumpTradeBuy('HK', code, name)
  })
  EM.Template.helper('jumpSalePage', (zjzh, isself, market, code, name) => {
    return  isself ? common.jumpMockTradeSale(zjzh, 'HK', code, name) : common.jumpTradeSale('HK', code, name)
  })
  EM.Template.helper('showFooterFirst', (zubs, zhtype, zhuid, isself) => {
    if (zhtype == '0') {
      if (!isself) {
        return '<a href=""><span class="sprite-ico icons-wd"></span>创建</a>'
      }else {
        return ''
      }
    }else {
      if (isself) {
        return '<a href="accountindex.html"><span class="sprite-ico icons-wd"></span>我的大赛</a>'
      }else {
        return '<a href="signup.html"><span class="sprite-ico icons-wd"></span>报名参赛</a>'
      }
    }
  })
  EM.Template.helper('showFooterLast', (zjzh, zhtype, zhuid, isself) => {
    if (isself) {
      return '<a href="{0}"><span class="sprite-ico icons-wd"></span>模拟买卖</a>'.format(common.jumpMockTradeBuy(zjzh, 'HK'))
    }else {
      return '<a href=""><span class="sprite-ico icons-gd"></span>更多</a>'
    }
  })
}

/** 
 * 页面初始化 
 */
module.initialize = () => {
  common.setTitle("组合详情")
  let zhtype = EM.QueryString.zhtype
  if (zhtype && zhtype.length > 0) {
    module.zhtype = zhtype
    module.zhbs = EM.QueryString.zhbs
    if (module.zhbs && module.zhbs.length > 0) {
      module.zhuid = EM.QueryString.zhuid
      if (module.zhuid && module.zhuid.length > 0) {
        common.checkLogin(function () {
          module.attachTmplHelper()
          module.loadPage()
          module.loadEvents()
        }, false)
      }else {
        common.dialog('未获取到组合对应的用户标识')
      }
    }else {
      common.dialog('未获取到组合编号')
    }
  }else {
    common.dialog('未获取到组合类型')
  }
}

/**
 * 加载页面数据
 */
module.loadPage = () => {
  if (module.zhtype == '0') {
    common.getDataFromMatchInterface('vhacsrq', {type: 'vtha_zuhe_detail', ctToken: common.account.passport.ct, utToken: common.account.passport.ut, zhbs: module.zhbs},
      (response) => {
        module.zjzh = response.data.detail.fundid
        response.data.inapp = module.inApp
        response.data.isself = module.isSelf()
        //response.data.tradeSumApp = response.data.tradeSumApp.slice(0, 2)
        $('#zh-main').html(EM.Template.render(zhMainTemp, response.data))
        module.loadLineChart(response.data.tendency)
        module.loadPieChart(response.data.stkholdpiep, response.data.pieplot)
      }
    )
  }else {
    common.getDataFromMatchInterface('vhacsrq', {type: 'vthacs_zuhe_detail', ctToken: common.account.passport.ct, utToken: common.account.passport.ut, zhbs: module.zhbs},
      (response) => {
        module.zjzh = response.data.detail.fundid
        response.data.inapp = module.inApp
        response.data.isself = module.isSelf()
        //response.data.tradeSumApp = response.data.tradeSumApp.slice(0, 2)
        $('#zh-main').html(EM.Template.render(zhMathMainTemp, response.data))
        module.loadLineChart(response.data.tendency)
        module.loadPieChart(response.data.HoldPosition, response.data.pieplot)
      }
    )
  }
  module.getGubaComments(true)
  if(module.inApp){
    module.showFooter()
    module.getGubaPostId()
  }
}

/**
 * 加载事件
 */
module.loadEvents = () => {
  /**
   * 赛季收益说明弹窗
   */
  if(module.zhtype=='1'){
    $('body').on('click', '#profitExplain', function () {
      common.dialog('统计周期为本赛季的比赛日', '赛季收益说明')
    })
  }

  /**
   * 更多调仓记录
   */
  $('body').on('click', '.more-link', function () {
    location.href='adjustdetail.html?zhbs={0}&userid={1}'.format(module.zhbs, module.zhuid)
  })

  /**
   * 股票持仓详情
   */
  $('body').on('click', '.hold-link', function () {
    location.href='holdingdetail.html?zhbs={0}&userid={1}'.format(module.zhbs, module.zhuid)
  })

  /**
   * 调仓记录点击事件
   */
  $('body').on('click', '.adjust_record', function () {
    $(this).find(".opt").toggleClass('hide')
  })

  /**
   * 区间切换事件
   */
  $('body').on('click', '#tendency-nav>span', function () {
    let $this = $(this)
    $this.addClass('active').siblings().removeClass('active')
    $('#index-code').text('恒生指数')
    RData.matchJsonp('vhacsrq', { type: 'vtha_rate_line', zhbs: module.zhbs, Frequency: $this.data('frequency'), cb: 'callback' },
      (response) => {
        module.loadLineChart(response.tendency)
      }
    )
  })

  /**
   * 指数切换事件
   */
  $('body').on('click', '#index-code-select', function () {
    bottompop({
      popId: 'pop01', // 多个弹窗时必须区分
      maskHide: true,
      className: 'bottom-popup',
      data: [
        { label: '恒生指数', value: 'HSI'},
        { label: '香港国企指数', value: 'HSCEI' },
        { label: 'AH股溢价', value: 'HSAHP' },
        { label: '中华沪港通300', value: 'CES300' }
      ],
      onSelect: function (v, t) {
        $('#index-code').text(t)
        RData.matchJsonp('vhacsrq', { type: 'vtha_index_line', IndexCode: v, zhbs: module.zhbs, Frequency: $('#tendency-nav>span').filter('.active').data('frequency'), cb: 'callback' },
          (response) => {
            module.loadLineChart(response.tendency)
          }
        )
      },
      onCancel: function () {}
    })
  })

  /**
   * 评论排序选择
   */
  let $selector = $('.selector')
  let $selectorItems = $('.selector-items')

  /**
   * 股吧评论切换事件
   */
  $('.user-dp .nav>span').on('click', function () {
    let $this = $(this)
    if (!$this.hasClass('active')) {
      $selector.removeClass('expanded')
      $selectorItems.addClass('hide')

      /* //重置排序
      module.commentpagesort = 1
      $selector.removeClass('expanded')
      $selectorItems.addClass('hide')
      $selectorItems.find('li').eq(0).removeClass('selected')
      $selectorItems.find('li').eq(1).addClass('selected')
      $selector.html($selectorItems.find('li').eq(1).html()) */
      $this.addClass('active').siblings().removeClass('active')
      module.getGubaComments(true)
    }
  })

  /**
   * 股吧评论排序切换
   */
  $selector.on('click', function () {
    $(this).toggleClass('expanded')
    $selectorItems.toggleClass('hide')
  })
  $selectorItems.on('click', 'li', function () {
    if (!$(this).hasClass('selected')) {
      $selectorItems.find('li').removeClass('selected')
      $(this).addClass('selected')
      $selector.removeClass('expanded')
      $selectorItems.addClass('hide')
      let selectValue = $(this).html()
      $selector.html(selectValue)
      selectValue == '最新' ? module.commentpagesort = 1 : module.commentpagesort = -1
      module.getGubaComments(true)
    }
  })

  /**
   * 评论展开收起事件
   */
  $('body').on('click', '.comment_item', function () {
    $(this).toggleClass('fold')
  })

  /**
   * 帖子评论事件
   */
  $('#comment').on('click', function () {
    if(module.checkLogin()){
      module.sendComment('', '')
    }
  })

  /**
   * 点赞/取消点赞 事件
   */
  $('body').on('click', '.icons-up', function () {
    if(module.checkLogin()){
      module.handlerLikeOperate($(this))
    }
  })

  /**
   * 评论的评论事件
   */
  $('body').on('click', '.icons-comment', function () {
    if(module.checkLogin()){
      let $this = $(this)
      module.sendComment($this.data('replyid'), $this.data('replynickname'))
    }
  })

  /**
   * 滚动加载股吧评论
   */
  $(window).unbind("scroll").bind("scroll",
    function(e) {
        var scrollTop = $(this).scrollTop();
        var windowHeight = $(this).height();
        if (scrollTop + windowHeight == $(document).height()) {
          module.getGubaComments(false)
        }
    }
  )
}

/**
 * 判断是否已登录
 */
module.checkLogin = () =>{
  if(common.account.isLogin){
    return true
  }else{
    common.dialog('您当前未登录，请登录后操作', null, function(){common.login()}, 'pop-c-two')
    return false
  }
}

/**
 * 展示底部菜单
 */
module.showFooter = () => {
  let $mainDiv = $('#mainDiv')
  $mainDiv.addClass('zuhe-main')
  let footerHtml='<div class="zuhe-footer">'+
    EM.Template.render(zhFooterTemp, {zjzh:module.zjzh, zhtype: module.zhtype, zhuid: module.zhuid, isself: module.isSelf()})+
    '</div>'
  $mainDiv.append(footerHtml)
}

/**
 * 获取组合对应的股吧帖子Id
 */
module.getGubaPostId = () => {
  GubaData.getArticleIdList(`id=${module.zhbs}&type=33`, (response) => {
    if (response.rc == 1) {
      if (response.re && response.re.length > 0) {
        module.gubaid = response.re[0].post_id
      }
    } else { }
  })
}

/**
 * 加载股吧评论
 * @param {*} firstLoad 
 */
module.getGubaComments=(firstLoad)=>{
  /**
   * 如果没有正在加载评论，那么可以进入
   * 如果正在加载评论，但是 firstLoad 是 true 【分类切换的情况】，那么也可以进入，防止评论分类切换后展示的却是前一个分类的情况
   */
  if(!module.isLoadingcomment || (module.isLoadingcomment && firstLoad)){
    /**
     * 第一次加载清除之前的记录
     */
    if (firstLoad) {
      module.commentpageno = 1
      $('.comm-comments dd').remove()
      $('.comm-comments').append('<dd class="com-tip comments-load-tip">加载中...</dd>')
    }else{
      let loadTip = $('.comments-load-tip')
      let showAll = loadTip.data('showall')
      if(showAll && showAll=='1'){
        return
      }else{
        loadTip.html('加载中...')
      }
    }
    
    module.isLoadingcomment=true

    /**
     * 如果jsonp在15秒之后还没有返回，则清除加载状态
     */
    setTimeout(()=>{
      if(module.isLoadingcomment){
        $('.comments-load-tip').html('显示下{0}条'.format(module.commentpagecount))
        module.isLoadingcomment=false
      }
    }, 15000)

    /**
     * 处理响应后的展示
     */
    let reponseHandler = (isAll, response) => {
      module.isLoadingcomment=false
      if (response.rc == 1) {
        response.inapp = module.inApp
        $('.comments-load-tip').remove()
        isAll ? $('#allCommentsCount').html('所有点评({0})'.format(response.count)) : $('#adminCommentsCount').html('管理人点评({0})'.format(response.count))
        $('.comm-comments').append(EM.Template.render(gbDisgustTemp, response))
        if(+response.count<=0){
          $('.comm-comments').append('<dd class="com-tip comments-load-tip" data-showall="1">{0}</dd>'.format(response.me))
        }else{        
          if(+response.count > module.commentpageno * module.commentpagecount){
            $('.comm-comments').append('<dd class="com-tip comments-load-tip">显示下{0}条</dd>'.format(module.commentpagecount))
          }else{
            $('.comm-comments').append('<dd class="com-tip comments-load-tip" data-showall="1">{0}</dd>'.format(isAll ? '共{0}条所有点评'.format(response.count) : '共{0}条管理人点评'.format(response.count)))
          }
          module.commentpageno++
        }
      }else{
        $('.comments-load-tip').html('显示下{0}条'.format(module.commentpagecount))
        common.dialog(response.me)
      }
    }

    if($('#allCommentsCount').hasClass('active')){
      GubaData.getGroupComments(`postid=${module.zhbs}&type=33&p=${module.commentpageno}&ps=${module.commentpagecount}&sort=${module.commentpagesort}`, (response) => {
        reponseHandler(true, response)
      })

      /* GubaData.getGroupComments(`postid=747787742&type=0&p=${module.commentpageno}&ps=${module.commentpagecount}&sort=${module.commentpagesort}`, (response) => {
        reponseHandler(true, response)
      }) */
    }else{
      GubaData.getOperationLogs(`id=${module.zhbs}&type=33&p=${module.commentpageno}ps=${module.commentpagecount}&&uid=${module.zhuid}&sort=${module.commentpagesort}`, (response) => {
        reponseHandler(false, response)
      });

      /* GubaData.getOperationLogs(`id=747787742&type=0&p=${module.commentpageno}ps=${module.commentpagecount}&&uid=${module.zhuid}&sort=${module.commentpagesort}`, (response) => {
        reponseHandler(false, response)
      }) */
    }
  }
}

/**
 * 点赞/取消点赞 事件
 * @param {*}  
 */
module.handlerLikeOperate=($target)=>{
  if (!$target) return
  let replyId=$target.data('replyid')
  let refreshLikeCount = () => {
    GubaData.getLikeCount(`replyids=${replyId}`, (response) => {
        if (response.rc == 1 && response.re && json.response.length) {
          let curLikeData = response.re.find(r => r.reply_id == replyId)
          curLikeData && $target.next().html(curLikeData.like_count)
        }
    })
  }
  if($target.hasClass('icons-uped')){
    GubaData.doCancelLike(`replyid=${replyId}&id=${module.zhbs}&type=33&pitype=1`, (response) => {
      if (response.rc == 1) {
        $target.removeClass('icons-uped')
        refreshLikeCount()
      } else {
        common.dialog(response.me)
      }
    })
  }else{
    GubaData.doLike(`replyid=${replyId}&id=${module.zhbs}&type=33&pitype=1`, (response) => {
      if (response.rc == 1) {
        $target.addClass('icons-uped')
        refreshLikeCount()
      } else {
        common.dialog(response.me)
      }
    })
  }
}

/**
 * 发送评论
 * @param {*} replyid 
 * @param {*} replynickname 
 */
module.sendComment = (replyid, replynickname) => {
  if (module.gubaid && module.gubaid.length > 0) {
    AG.emH5ReplyTieZi(
      (response) => {
        alert(response)}, {
        tid: module.gubaid,
        hid: replyid,
        h_name: replynickname
      }
    )
  }else {
    common.dialog('暂时不支持评论，请稍后再试')
  }
}

/**
 * 加载收益图
 * @param {*} chartData 
 */
module.loadLineChart = (chartData) => {
  let dateArr = []
  let totalRate = []
  let indexRate = []
  chartData.map(function (td) {
    totalRate.push(Number(td.totalRate))
    indexRate.push(Number(td.indexRate))
    dateArr.push(td.yk_date)
  })
  let chartOption = {
    grid: {
      top: '5%',
      left: '3%',
      right: '8%',
      bottom: '5%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: { backgroundColor: '#6a7985' }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        textStyle: { color: '#333', fontFamily: 'arial' },
        formatter: function (v, i) { return v.substring(4, 6) + '-' + v.substring(6, 8) }
      },
      data: dateArr
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: ['#e7ebf0'] }
      },
      axisLabel: {
        textStyle: { color: '#333', fontFamily: 'arial' },
        formatter: function (v) { return v + '%' }
      }
    },
    series: [
      {
        name: '账户收益率',
        type: 'line',
        showSymbol: false,
        lineStyle: { normal: { color: '#ff8900' } },
        itemStyle: {
          normal: { color: '#ff8900' },
          emphasis: { color: '#ff8900', borderColor: '#fff', borderWidth: 2 }
        },
        data: totalRate
      },
      {
        name: '指数收益率',
        type: 'line',
        showSymbol: false,
        lineStyle: { normal: { color: '#44b2d7' } },
        itemStyle: { normal: { color: '#44b2d7' },
          emphasis: { color: '#44b2d7', borderColor: '#fff', borderWidth: 2 }
        },
        data: indexRate
      }
    ]
  }
  echarts.init(document.getElementById('chart_01')).setOption(chartOption)
}

/**
 * 加载持仓分布图
 * @param {*} d1 
 * @param {*} d2 
 */
module.loadPieChart = (d1, d2) => {
  let data1 = []
  let data2 = []
  let legend1 = []
  let legend2 = []
  let echart = echarts.init(document.getElementById('chart_020'))
  let colors = ['#fcd241', '#3297d9', '#f8a53f', '#1b5079', '#e84742', '#96e4ff']
  d1.map(function (item, index) {
    if (index < 6) {
      let temp = {
        name: '',
        value: 0,
        itemStyle: { normal: { color: '' } }
      }
      legend1.push(item.__name + item.holdPos + '%')
      temp.value = item.holdPos
      temp.name = item.__name + item.holdPos + '%'
      temp.itemStyle.normal.color = colors[index]
      data1.push(temp)
    }
  })
  d2.map(function (item, index) {
    if (index < 6) {
      let temp = {
        name: '',
        value: 0,
        itemStyle: { normal: { color: '' } }
      }
      legend2.push(item.blkName + item.pieRate + '%')
      temp.value = item.pieRate
      temp.name = item.blkName + item.pieRate + '%'
      temp.itemStyle.normal.color = colors[index]
      data2.push(temp)
    }
  })
  let option20 = {
    legend: {
      orient: 'vertical',
      left: '60%',
      top: 'middle',
      icon: 'circle',
      itemWidth: 8,
      itemGap: 5,
      selectedMode: false,
      data: legend1
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: ['60%', '90%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: false,
        hoverAnimation: false,
        label: { normal: { show: false } },
        labelLine: { normal: { show: false } },
        data: data1
      }
    ]
  }
  let option21 = {
    legend: {
      orient: 'vertical',
      left: '60%',
      top: 'middle',
      icon: 'circle',
      itemWidth: 8,
      itemGap: 5,
      selectedMode: false,
      data: legend2
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: ['60%', '90%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: false,
        hoverAnimation: false,
        label: { normal: { show: false } },
        labelLine: { normal: { show: false } },
        data: data2
      }
    ]
  }
  echart.setOption(option20)
  let flag = false
  $('.hd-nav>span').click(function () {
    let $this = $(this)
    let index = $this.index()
    $this.addClass('active').siblings().removeClass('active')
    $('.chart_box_02').eq(index).removeClass('hide').siblings().addClass('hide')
    if (!flag && index == 1) {
      let chart = echarts.init(document.getElementById('chart_021'))
      chart.setOption(option21)
      flag = true
    }
  })
}

FastClick.attach(document.body)
module.initialize()