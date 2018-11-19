/*
* @Author: willi
* @Date:   2017-09-17 21:27:49
* @Last Modified by:   willi
* @Last Modified time: 2017-09-23 22:04:42
*/
$.fn.extend({
	waterfall:function(){
		var $_this=this;

		//分别计算：
		//1.容器总宽度
		//2.单个元素宽度
		//3.一排元素的个数
		//4。元素之间的间距
		var totalwidth=$_this.width();
		var itemwidth=$_this.children('.item').width();
		var count=Math.floor(totalwidth/itemwidth);
		var margin=(totalwidth-itemwidth*count)/(count-1);

		//给高度数组的元素赋初值
		var heightArr=[];
		for(var i=0;i<count;i++){
			heightArr[i]=10;
		}




		$_this.children('.item').each(function(index, el) {
				//遍历出高度数组中最小值
				var miniIndex=0;
				var miniHeight=heightArr[miniIndex];
				for(var i=1;i<heightArr.length;i++){
					if(heightArr[i]<miniHeight){
						miniIndex=i;
						miniHeight=heightArr[miniIndex];
					}
				};

				//给当前元素放置到瀑布流中的合适位置
				$(el).css({
					top:miniHeight+margin,
					left:(itemwidth+margin)*miniIndex
				});


				//更新高度数组元素的值
				heightArr[miniIndex]=miniHeight+$(el).height()+margin;

				//更新父盒子的高度
				//1.遍历出高度数组中最大高度
				var maxIndex=0;
				var maxHeight=heightArr[maxIndex];
				for(var i=1;i<heightArr.length;i++){
					if(heightArr[i]>maxHeight){
						maxIndex=i;
						maxHeight=heightArr[maxIndex];
					}
				}
				//2.更新父盒子的高度
				$_this.height(maxHeight);



		});

	}
})