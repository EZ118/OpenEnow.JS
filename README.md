# OpenEnow.JS   
## 概述    
用于打开（由希沃白板创建的）ENBX格式文件的开源项目。   
*An open source project to open 'ENBX' format files (which are created by EasiNote 5).*   
   
该项目的解压步骤需要依赖python3解释器   

## 配置&使用   
### 引入模块   
**注意：建议将下文所述的所有脚本至于所有html代码`<body>`末尾**    
```html
<div id="enow-show" align=left></div> <!--课件展示部分-->
<script src="./openEnow.js"></script>
```   
### 初始化&配置   
```js
var en = new ENOW();
en.CONFIG({
	"slides":"./courseware/Slides/", /*enbx解压出的Slides目录的路径*/
	"resources":"./courseware/Resources/", /*enbx解压出的Resources目录的路径*/
	"name":"综合练习5", /*课件名称*/
	"container":"enow-show" /*用于装载课件<div>的ID*/
});
```   
### 展示课件指定幻灯片   
```javascript
en.display(1);
/*
 语法：display(page, mode)
 page 页码（从1开始）【必填】
 mode 同步或异步 【选填，默认false（同步）】
*/

//en.Xml2Html(en.GetSlideSource("Slide_0.xml")); 
/*
 en.GetSlideSource("Slide_0.xml") 获取xml内容
 en.Xml2Html() 由xml内容转为浏览器可显示的html代码
 */
```   
**须知：**
+ Slide_0.xml表示第一张幻灯片；Slide_1.xml表示第二张幻灯片；以此类推 ......    
+ 展示幻灯片函数可以在网页加载完成后反复调用   

### 用户使用   
*该项目需要使用静态服务器才能正常运行*   
请按顺序操作以下步骤，即可使用   
 1. enbx解压   
	可以双击使用src目录下的 UNZIP_COURSEWARE.BAT ，自动解压simple目录下的“courseware.enbx”解压到src目录下。   
	亦可以使用其他解压软件，将其手动解压（需注意index.html的课件路径配置）   
2. 配置index.html   
	在`en.CONFIG()`中配置了幻灯片路径、和资源路径，需要按照实际情况改动；如果使用的是`UNZIP_COURSEWARE.BAT` 进行解压，那么无需配置，因为作者已经配置好了。   
3. 打开服务器，并浏览器打开相应网址即可   

## 作者留言   
### 未来项目的改进   
目前可以展示其中的文本内容，但还不完善，作者将会继续完善，实现对图片、形状等功能的支持，其次才会完善显示效果。   
### 创立项目的启发   
作者编写本项目的目的是为了实现简单的enbx打开器，而在预览课件的同时，不需要下载（大小足足有200多MB的）希沃白板软件。   
**那作者哪来的ENBX课件呢？**   
学校网课，使用立知课堂上课，上课平台有很多漏洞可以利用。作者利用了它们制作了ENBX课件下载器   
提供链接：[EZ118/LiZhi-OnlineClassroom-Courseware-Tool](https://github.com/EZ118/LiZhi-OnlineClassroom-Courseware-Tool)   

