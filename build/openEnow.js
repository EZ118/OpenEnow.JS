/**
 * xml字符串转换xml对象数据
 * @param {Object} xmlStr
 */
function xmlStr2XmlObj(xmlStr) {
  var xmlObj = {};
  if (document.all) {
    var xmlDom = new ActiveXObject("Microsoft.XMLDOM");
    xmlDom.loadXML(xmlStr);
    xmlObj = xmlDom;
  } else {
    xmlObj = new DOMParser().parseFromString(xmlStr, "text/xml");
  }
  return xmlObj;
}

/**
 * xml字符串转换json数据
 * @param {Object} xml
 */
function xmlObj2json(xml) {
  var xmlObj = xmlStr2XmlObj(xml);
  var jsonObj = {};
  if (xmlObj.childNodes.length > 0) {
    jsonObj = xml2json(xmlObj);
  }
  return jsonObj;
}

/**
 * xml转换json数据
 * @param {Object} xml
 */
function xml2json(xml) {
  try {
    var obj = {};
    if (xml.children.length > 0) {
      for (var i = 0; i < xml.children.length; i++) {
        var item = xml.children.item(i);
        var nodeName = item.nodeName;
        if (typeof(obj[nodeName]) == "undefined") {
          obj[nodeName] = xml2json(item);
        } else {
          if (typeof(obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xml2json(item));
        }
      }
    } else {
      obj = xml.textContent;
    }
    return obj;
  } catch (e) {
    console.log(e.message);
  }
}



class ENOW {
	constructor() {
		this.slidesPath = "./Slides/";
		this.resPath = "./Resources/";
		this.name = "Enbx Courseware";
		this.body = document.getElementsByTagName("body")[0];
	}
	
	CONFIG(json) {
		this.sliPath = json["slides"];
		this.resPath = json["resources"];
		this.name = json["name"];
		this.body = json["container"];
	}
	
	GetSlideSource(name) {
		name = this.sliPath + name;

		let xmlhttp = null;
		if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); }
		else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
		xmlhttp.open("GET",name,false);
		xmlhttp.send();
		
		return xmlhttp.responseXML;
	}
	
	/*
	GetXYWH(txt) {
		try{
			let gx = txt.getElementsByTagName("X"); gx = gx[gx.length - 1].innerHTML;
			let gy = txt.getElementsByTagName("Y"); gy = gy[gy.length - 1].innerHTML;
			let gw = txt.getElementsByTagName("Width"); gw = gw[gw.length - 1].innerHTML;
			let gh = txt.getElementsByTagName("Height"); gh = gh[gh.length - 1].innerHTML;
			return [gx, gy, gw, gh];
		} catch(e) {
			return [0, 0, "auto", "auto"];
		}
	}
	*/
	
	Xml2Html(xml){
		let json = xml2json(xml); /*调用函数，xml转json*/
		console.log(json);
		let res = "";
		
		/*幻灯片大小*/
		let ele = document.getElementById(this.body);
		ele.setAttribute("style", "width:" + json["Slide"]["Width"] + "px;height:" + json["Slide"]["Height"] + "px;background-size:100% 100%;");
		self.width = json["Slide"]["Width"];
		self.height = json["Slide"]["Height"];
		
		/*背景颜色或图片*/
		
		try{ res = "<style>#" + this.body + "{background:url(" + json["Slide"]["Background"]["ImageBrush"]["Source"].replace("id://", this.resPath) + ");}</style>";}
		catch(e) { res = "<style>#" + this.body + "{background:" + json["Slide"]["Background"]["ColorBrush"] + ";}</style>"; }
		
		/*显示Text*/
		try{
			for(let i = 0; i < json["Slide"]["Elements"]["Text"].length; i ++){
				let txtc = json["Slide"]["Elements"]["Text"][i]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>');
				let txtx = json["Slide"]["Elements"]["Text"][i]["X"];
				let txty = json["Slide"]["Elements"]["Text"][i]["Y"];
				res += `<div class='richtext' align='left' style='
					position:absolute;top:` + txty + `px;left:` + txtx + `px;'>
					` + txtc + `</div><br/>`;
			}
		} catch(e){}
		try{
			for(let i = 0; i < json["Slide"]["Elements"]["Group"].length; i ++){
				for(let j = 0; j < json["Slide"]["Elements"]["Group"][i]["Elements"]["Text"].length; j ++){
					let txtc = json["Slide"]["Elements"]["Group"][i]["Elements"]["Text"][j]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>');
					let txtx = json["Slide"]["Elements"]["Group"][i]["Elements"]["Text"][j]["X"];
					let txty = json["Slide"]["Elements"]["Group"][i]["Elements"]["Text"][j]["Y"];
					res += `<div class='richtext' align='left' style='
						position:absolute;top:` + txty + `;left:` + txtx + `;'>
						` + txtc + `</div><br/>`;
				}
			}
		} catch(e){}
		
		/*显示Picture*/
		try{
			let imgurl = json["Slide"]["Elements"]["Picture"]["Source"].replace("id://", this.resPath);
			let imgformat = json["Slide"]["Elements"]["Picture"]["PictureName"].split(".");
			let imgw = json["Slide"]["Elements"]["Picture"]["Width"];
			let imgh = json["Slide"]["Elements"]["Picture"]["Height"];
			let imgx = json["Slide"]["Elements"]["Picture"]["X"];
			let imgy = json["Slide"]["Elements"]["Picture"]["Y"];
			
			imgurl += "." + imgformat[imgformat.length - 1];
			
			res += `<img src='` + imgurl + `' width='` + imgw + `' height='` + imgh + `' 
					style='position:absolute;top:` + imgy + `px;left:` + imgx + `px;'>`;
		} catch(e){}
		try{
			for(let i = 0; i < json["Slide"]["Elements"]["Picture"].length; i ++){
				try{
					let imgurl = json["Slide"]["Elements"]["Picture"][i]["Source"].replace("id://", this.resPath);
					let imgformat = json["Slide"]["Elements"]["Picture"][i]["PictureName"].split(".");
					let imgw = json["Slide"]["Elements"]["Picture"][i]["Width"];
					let imgh = json["Slide"]["Elements"]["Picture"][i]["Height"];
					let imgx = json["Slide"]["Elements"]["Picture"][i]["X"];
					let imgy = json["Slide"]["Elements"]["Picture"][i]["Y"];
					
					imgurl += "." + imgformat[imgformat.length - 1];
					
					res += `<img src='` + imgurl + `' width='` + imgw + `' height='` + imgh + `' 
							style='position:absolute;top:` + imgy + `px;left:` + imgx + `px;'>`;
					/*console.log(res);*/
				} catch(e){}
			}
		} catch(e){}
		try{
			for(let j = 0; j < json["Slide"]["Elements"]["Group"].length; j ++){
				for(let i = 0; i < json["Slide"]["Elements"]["Group"][i]["Elements"]["Picture"].length; i ++){
					try{
						let imgurl = json["Slide"]["Elements"]["Group"][j]["Elements"]["Picture"][i]["Source"].replace("id://", this.resPath);
						let imgformat = json["Slide"]["Elements"]["Group"][j]["Elements"]["Picture"][i]["PictureName"].split(".");
						let imgw = json["Slide"]["Elements"]["Group"][j]["Elements"]["Picture"][i]["Width"];
						let imgh = json["Slide"]["Elements"]["Elements"]["Group"][j]["Elements"]["Picture"][i]["Height"];
						let imgx = json["Slide"]["Elements"]["Group"][j]["Elements"]["Picture"][i]["X"];
						let imgy = json["Slide"]["Elements"]["Group"][j]["Elements"]["Picture"][i]["Y"];
						
						imgurl += "." + imgformat[imgformat.length - 1];
						
						res += `<img src='` + imgurl + `' width='` + imgw + `' height='` + imgh + `' 
								style='position:absolute;top:` + imgy + `px;left:` + imgx + `px;'>`;
						/*console.log(res);*/
					} catch(e){}
				}
			}
		} catch(e){}
		
		document.getElementById(this.body).innerHTML = res;
		return res;
	}
}