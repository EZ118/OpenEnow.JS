<?php
	ini_set("upload_max_filesize", "20M");
?>

<?php
	/*
	 * zip解压
	 */
	function unzip($filePath, $path) {
		if (empty($path) || empty($filePath)) {
			return false;
		}
	 
		$zip = new ZipArchive();
	 
		if ($zip->open($filePath) === true) {
			$zip->extractTo($path);
			$zip->close();
			return true;
		} else {
			return false;
		}
	}
?>

<?php
	/*
	 * 删除目录
	 */
    function deldir($path){
        if(is_dir($path)){
            $p = scandir($path);
            if(count($p)>2){
                foreach($p as $val){
                    if($val !="." && $val !=".."){
                        if(is_dir($path.$val)){
                            deldir($path.$val.'/');
                        }else{
                            unlink($path.$val);
                        }
                    }
                }
            }
        }
        return rmdir($path);
    }
?>

<?php
	/*
	 * 删除过期文件
	 */
	function delfile($dir,$n) {
		if(is_dir($dir)) {
			if($dh=opendir($dir)) {
				while (false !== ($file = readdir($dh))) {
					if($file!="." && $file!="..") {
						$fullpath=$dir."/".$file;
						if(is_dir($fullpath)) {
							$filedate=date("Y-m-d h:i:s", filemtime($fullpath));
							$d1=strtotime(date("Y-m-d h:i:s"));
							$d2=strtotime($filedate);
							$Days=round(($d1-$d2)/60);   
							if($Days>$n) deldir($fullpath . "/");
						}
					}
				}
			}
			closedir($dh);
		}
	}
	
	delfile("./Temp",50); //50分钟
?>

<?php
	/* 获得当前页面URL开始 */
	function curPageURL() { 
		$pageURL = 'http'; 
		if ($_SERVER["HTTPS"] == "on") {    // 如果是SSL加密则加上“s” 
			$pageURL .= "s"; 
		} 
		$pageURL .= "://"; 
		if ($_SERVER["SERVER_PORT"] != "80") { 
			$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"]; 
		} else { 
			$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"]; 
		} 
		return $pageURL; 
	} 
	/* 获得当前页面URL结束 */
?>