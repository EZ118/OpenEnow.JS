# OpenEnow.JS   
## 概述    
用于打开（由希沃白板创建的）ENBX格式文件的开源项目。   
   
有关如何从希沃的云课堂中下载直播课中的ENBX课件，详见[LiZhi-OnlineClassroom-Courseware-Tool](https://github.com/EZ118/LiZhi-OnlineClassroom-Courseware-Tool)项目。

## 配置与使用   
### 开始使用   
```html
<!-- 引入 -->
<script src="https://unpkg.com/jszip/dist/jszip.min.js"></script>
<script src="./openenow.min.js"></script>

<!-- 幻灯片渲染容器 -->
<div id="slideContainer"></div>
```
### 内置函数
```js
// 初始化对象
const enow = new ENOW();

// 配置幻灯片
enow.CONFIG({
	container: "#slideContainer",
	// 幻灯片渲染容器（元素选择表达式）

	zip: yourJSZipInstance,
	// jszip解压enbx得到的zip对象

	// slides: "Slides/",
	// enbx的幻灯片xml在压缩包的存储路径（不建议设置）

	// resources: "Resources/"
	// enbx的幻灯片xml在压缩包的存储路径（不建议设置）
});

// 显示第0张幻灯片（幻灯片编号为：0 ~ N-1）
await enow.display(0);

// 清理本地缓存资源
// enow.dispose();
```

### 开发提示
- Slide_0.xml表示第一张幻灯片；Slide_1.xml表示第二张幻灯片；以此类推......
- 展示幻灯片函数可以在网页加载完成后反复调用
- 幻灯片浏览完毕后建议清理本地缓存资源
- 使用该库是必须先引入`jszip.js`
- demo代码中包含zepto，但这不是OpenEnow.JS的依赖

## 参考与使用
- [jszip](https://github.com/Stuk/jszip)
- [zepto](https://github.com/madrobby/zepto/)