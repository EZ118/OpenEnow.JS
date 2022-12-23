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
	
	/*GetXYWH(txt) {
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
	
	Xml2Html(xml) {
		let g = xml.getElementsByTagName("Group");
		
		var gt = "";
		for (let i = 0; i < g.length; i ++){
			let gp = this.GetXYWH(g[i]);
			
			let e = g[i].getElementsByTagName("RichText");
			var et = "";
			for(let j = 0; j < e.length; j ++) {
				
				let tp = this.GetXYWH(e[j]);
				let txt = e[j].getElementsByTagName("Text");
				txt = txt[txt.length - 1].innerHTML;
				
				et += "<div class='richtext' style='top:" + tp[1] + ";\
					  left:" + tp[0] + ";width:" + tp[1] + ";height:" + tp[2] + ";'>" + txt + "</div>";
			}
			et = "<div class='group' style='top:" + gp[1] + ";\
				 left:" + gp[0] + ";width:" + gp[1] + ";height:" + gp[2] + ";'>" + et + "</div>";
			gt += et;
		}
		return gt;
	}*/
	
	Xml2Html(xml){
		let json = xml2json(xml); /*调用函数，xml转json*/
		
		/*幻灯片大小*/
		let ele = document.getElementById(this.body);
		ele.setAttribute("style", ele.getAttribute("style") + ";width:" + json["Slide"]["Width"] + "px;height:" + json["Slide"]["Height"] + "px;background-size:100% 100%;");
		
		/*背景颜色或图片*/
		let res = "";
		try{ res = "<style>#" + this.body + "{background:url(" + json["Slide"]["Background"]["ImageBrush"]["Source"].replace("id://", this.resPath) + ");}</style>";}
		catch(e) { res = "<style>#" + this.body + "{background:" + json["Slide"]["Background"]["ColorBrush"] + ";}</style>"; }
		
		/*显示Text*/
		try{
			for(let i = 0; i < json["Slide"]["Elements"]["Text"].length; i ++){
				res += "<div class='richtext'>" + json["Slide"]["Elements"]["Text"][i]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>') + "</div><br/>";
			}
		} catch(e){}
		try{
			for(let i = 0; i < json["Slide"]["Group"].length; i ++){
				for(let j = 0; j < json["Slide"]["Group"][i]["Elements"]["Text"].length; j ++){
					
					res += "<div class='richtext' align='left'>" + json["Slide"]["Group"][i]["Elements"]["Text"][j]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>') + "</div><br/>";
				}
			}
		} catch(e){}
		
		
		document.getElementById(this.body).innerHTML = res;
		return res;
	}
}