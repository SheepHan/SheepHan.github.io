<?php 
	header('content-type:text/html; charset= utf-8');
	error_reporting(0); 

	//读取json文件
	$data=file_get_contents('info/data.json');

	//将JSON str→对象  解码
	$objArr=json_decode($data);


	//随机取出数组中的10个值的index 存入到$keyArr
	$keyArr=array_rand($objArr,10);


	//从$data中随机读取10个值存入到数组$strArr中
	$strArr=array();
	for($i=0;$i<count($keyArr);$i++){
		$strArr[$i]=$objArr[$keyArr[$i]];
	}
	
	//对JSON对象的数组进行编码 生成字符串
	$strArr=json_encode($strArr);

	//发送给前端
	print_r($strArr);
 ?>