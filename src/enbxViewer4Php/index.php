<?php
    require("./ext.php");
?>


<!DOCTYPE html>
<html>
	<head>
		<meta charset='utf-8' />
		<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
		<title>OpenEnow.JS - Enbxviewer(php) Example</title>
	</head>
	<body>
		<center>
			<form action="./view.php" method="POST" enctype="multipart/form-data" style="overflow:hidden;margin-top:10%;border:3px solid #65ad57; width:400px; height:250px;">
				<div align="left" style="width:100%;line-height:15px;padding:10px;color:#FFF;background:#65ad57;">请上传ENBX课件（小于15MB，保存40分钟）</div>
				<br>
				<input type="file" name="file" accept=".enbx" style="margin:10px;border:2px solid #65ad57;padding:8px;">
				<br>
				<input type="submit" value="上传并预览" style="margin:10px; background:#65ad57; color:#FFF; border:none; border-radius:5px; padding:8px;">
			</form>
		</center>
	</body>
</html>
