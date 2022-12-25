<?php
	require("./ext.php");
	ini_set("display_errors", 0);
?>

<?php
if($_REQUEST["name"]){
	$_FILES["file"]["name"] = $_REQUEST["name"];
} else {
	$allowedExts = array("enbx", "zip");
	$temp = explode(".", $_FILES["file"]["name"]);
	$extension = end($temp);     // 获取文件后缀名
	if ($_FILES["file"]["size"] < 157286400 && in_array($extension, $allowedExts)) {
		if ($_FILES["file"]["error"] > 0) {
			echo "错误: " . $_FILES["file"]["error"] . "<br>";
		}
		else {
			//echo "上传文件名: " . $_FILES["file"]["name"] . "<br>";
			//echo "文件类型: " . $_FILES["file"]["type"] . "<br>";
			//echo "文件大小: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
			//echo "文件临时存储的位置: " . $_FILES["file"]["tmp_name"] . "<br>";
			
			$_FILES["file"]["name"] = mt_rand(1000, 99999);
			
			if(!is_dir("./Temp/" . $_FILES["file"]["name"] . "/")){
				mkdir("./Temp/" . $_FILES["file"]["name"] . "/");
			} else {					
				//设置需要删除的文件夹
				$path = "./Temp/" . $_FILES["file"]["name"] . "/";
				//调用函数，传入路径
				deldir($path);
				mkdir("./Temp/" . $_FILES["file"]["name"] . "/");
			}
			
			unzip($_FILES["file"]["tmp_name"], "./Temp/" . $_FILES["file"]["name"] . "/");
		}
	} else {
		echo "非法的文件格式";
	}
}


?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset='utf-8' />
		<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
		<title>OpenEnow.JS</title>
		<script src="./openEnow.js"></script>
		<link rel='stylesheet' href='./openEnow.css' type='text/css'/>
	</head>
	<body>
		<center style="border-radius:10px;width:640px;height:360px;overflow:hidden;border:2px solid #65ad57;">
			<div id="enow-show" align=left></div>
		</center>
		
		<table width="640px">
			<tr>
				<td align="left"><a id="left-hand" href="javascript:void(0);">< BACK</a></td>
				<td align="right"><a id="right-hand" href="javascript:void(0);">NEXT ></a></a></td>
			</tr>
		</table>
		
		
		
		<script>
			var en = new ENOW();
			en.CONFIG({
				"slides":"<?php echo "./Temp/" . $_FILES["file"]["name"] . "/Slides/";?>",
				"resources":"<?php echo "./Temp/" . $_FILES["file"]["name"] . "/Resources/";?>",
				"name":"<?php echo $_FILES["file"]["name"];?>",
				"container":"enow-show"
			});
			var pg = 0;
			//en.Xml2Html(en.GetSlideSource("Slide_" + pg + ".xml"));
			en.display(pg);
			
			var l = document.getElementById("left-hand");
			var r = document.getElementById("right-hand");
			
			l.onclick = function() {
				if(pg > 0) {
					pg -= 1;
					en.display(pg);
				}
				else{return;}
			}
			r.onclick = function() {
				pg += 1;
				en.display(pg);
			}
			
			
			
		</script>
		
		分享链接：<?php echo curPageURL() . "?name=" . $_FILES["file"]["name"];?>
		
		<!--配置说明-->
		<br><br><br>
		<b>如何配置？</b><br>
		首先用unzip.py或解压工具，将enbx文件中的resources、slides目录复制到指定路径<br>
		再更改index.html中的en.CONFIG函数传递的配置信息，通过字典传递，其中slides、resources表示两目录的相对路径<br>
		<br><br>
		<b>如何使用？</b><br>
		该项目需要静态服务器（XMLHttpRequest）<br>
		<br><br>
		<b>目前支持显示的课件组件</b><br>
		·&nbsp;普通文本<br>
		·&nbsp;图片<br>
		·&nbsp;音频<br>
		·&nbsp;视频<br>
	</body>
</html>