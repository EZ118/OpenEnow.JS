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
		let res = "";
		
		/*幻灯片大小*/
		let ele = document.getElementById(this.body);
		ele.setAttribute("style", "width:" + json["Slide"]["Width"] + "px;height:" + json["Slide"]["Height"] + "px;background-size:100% 100%;");
		self.width = json["Slide"]["Width"];
		self.height = json["Slide"]["Height"];
		
		/*背景颜色或图片*/
		try{ res = "<style>#" + this.body + "{background:url(" + json["Slide"]["Background"]["ImageBrush"]["Source"].replace("id://", this.resPath) + ");}</style>";}
		catch(e) { res = "<style>#" + this.body + "{background:" + json["Slide"]["Background"]["ColorBrush"] + ";}</style>"; }
		
		let JsonMain = json["Slide"]["Elements"];
		/*显示Text*/
		try{
			let txtc = JsonMain["Text"]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>');
			let txtx = JsonMain["Text"]["X"];
			let txty = JsonMain["Text"]["Y"];
			res += `<div class='richtext' align='left' style='position:absolute;top:` + txty + `px;left:` + txtx + `px;'>` + txtc + `</div><br/>`;
		} catch(e){}
		try{
			for(let i = 0; i < JsonMain["Text"].length; i ++){
				let txtc = JsonMain["Text"][i]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>');
				let txtx = JsonMain["Text"][i]["X"];
				let txty = JsonMain["Text"][i]["Y"];
				res += `<div class='richtext' align='left' style='position:absolute;top:` + txty + `px;left:` + txtx + `px;'>` + txtc + `</div><br/>`;
			}
		} catch(e){}
		try{
			for(let i = 0; i < JsonMain["Group"].length; i ++){
				for(let j = 0; j < JsonMain["Group"][i]["Elements"]["Text"].length; j ++){
					let txtc = JsonMain["Group"][i]["Elements"]["Text"][j]["RichText"]["Text"].replace(/\r\n|\n|\r/g, '<br/>');
					let txtx = JsonMain["Group"][i]["Elements"]["Text"][j]["X"];
					let txty = JsonMain["Group"][i]["Elements"]["Text"][j]["Y"];
					res += `<div class='richtext' align='left' style='position:absolute;top:` + txty + `px;left:` + txtx + `px;'>` + txtc + `</div><br/>`;
				}
			}
		} catch(e){}
		
		/*显示Picture*/
		try{
			let imgurl = JsonMain["Picture"]["Source"].replace("id://", this.resPath);
			let imgformat = JsonMain["Picture"]["PictureName"].split(".");
			let imgw = JsonMain["Picture"]["Width"];
			let imgh = JsonMain["Picture"]["Height"];
			let imgx = JsonMain["Picture"]["X"];
			let imgy = JsonMain["Picture"]["Y"];
			
			imgurl += "." + imgformat[imgformat.length - 1];
			
			res += `<img src='` + imgurl + `' style='width:` + imgw + `px;height:` + imgh + `px;position:absolute;top:` + imgy + `px;left:` + imgx + `px;'>`;
		} catch(e){}
		try{
			for(let i = 0; i < JsonMain["Picture"].length; i ++){
				try{
					let imgurl = JsonMain["Picture"][i]["Source"].replace("id://", this.resPath);
					let imgformat = JsonMain["Picture"][i]["PictureName"].split(".");
					let imgw = JsonMain["Picture"][i]["Width"];
					let imgh = JsonMain["Picture"][i]["Height"];
					let imgx = JsonMain["Picture"][i]["X"];
					let imgy = JsonMain["Picture"][i]["Y"];
					
					imgurl += "." + imgformat[imgformat.length - 1];
					
					res += `<img src='` + imgurl + `' style='width:` + imgw + `px;height:` + imgh + `px;position:absolute;top:` + imgy + `px;left:` + imgx + `px;'>`;
				} catch(e){}
			}
		} catch(e){}
		try{
			for(let j = 0; j < JsonMain["Group"].length; j ++){
				for(let i = 0; i < JsonMain["Group"][i]["Elements"]["Picture"].length; i ++){
					try{
						let imgurl = JsonMain["Group"][j]["Elements"]["Picture"][i]["Source"].replace("id://", this.resPath);
						let imgformat = JsonMain["Group"][j]["Elements"]["Picture"][i]["PictureName"].split(".");
						let imgw = JsonMain["Group"][j]["Elements"]["Picture"][i]["Width"];
						let imgh = JsonMain["Group"][j]["Elements"]["Picture"][i]["Height"];
						let imgx = JsonMain["Group"][j]["Elements"]["Picture"][i]["X"];
						let imgy = JsonMain["Group"][j]["Elements"]["Picture"][i]["Y"];
						
						imgurl += "." + imgformat[imgformat.length - 1];
						
						res += `<img src='` + imgurl + `' style='width:` + imgw + `px;height:` + imgh + `px;position:absolute;top:` + imgy + `px;left:` + imgx + `px;'>`;
					} catch(e){}
				}
			}
		} catch(e){}
		
		/*显示Audio*/
		try{
			let audiourl = JsonMain["Audio"]["Source"].replace("id://", this.resPath);
			let audioformat = JsonMain["Audio"]["MediaName"].split(".");
			let audiow = JsonMain["Audio"]["Width"];
			let audioh = JsonMain["Audio"]["Height"];
			let audiox = JsonMain["Audio"]["X"];
			let audioy = JsonMain["Audio"]["Y"];
			
			audiourl += "." + audioformat[audioformat.length - 1];
			
			res += `<audio controls style='position:absolute;top:` + audioy + `px;left:` + audiox + `px;width:` + audiow + `px;height:` + audioh + `px;'>
					<source src="` + audiourl + `" type="audio/mpeg">
					Unsupported Function
				</audio>`;
		} catch(e){}
		try{
			for(let i = 0; i < JsonMain["Audio"].length; i ++){
				try{
					let audiourl = JsonMain["Audio"][i]["Source"].replace("id://", this.resPath);
					let audioformat = JsonMain["Audio"][i]["MediaName"].split(".");
					let audiow = JsonMain["Audio"][i]["Width"];
					let audioh = JsonMain["Audio"][i]["Height"];
					let audiox = JsonMain["Audio"][i]["X"];
					let audioy = JsonMain["Audio"][i]["Y"];
					
					audiourl += "." + audioformat[audioformat.length - 1];
					
					res += `<audio controls style='position:absolute;top:` + audioy + `px;left:` + audiox + `px;width:` + audiow + `px;height:` + audioh + `px;'>
							<source src="` + audiourl + `" type="audio/mpeg">
							Unsupported Function
						</audio>`;
				} catch(e){}
			}
		} catch(e){}
		
		/*显示Video*/
		try{
			let videourl = JsonMain["Video"]["Source"].replace("id://", this.resPath);
			let videoformat = JsonMain["Video"]["MediaName"].split(".");
			let videow = JsonMain["Video"]["Width"];
			let videoh = JsonMain["Video"]["Height"];
			let videox = JsonMain["Video"]["X"];
			let videoy = JsonMain["Video"]["Y"];
			
			videourl += "." + videoformat[videoformat.length - 1];
			
			res += `<video controls style='position:absolute;top:` + videoy + `px;left:` + videox + `px;width:` + videow + `px;height:` + videoh + `px;'>
					<source src="` + videourl + `">
					Unsupported Function
				</video>`;
		} catch(e){}
		try{
			for(let i = 0; i < JsonMain["Video"].length; i ++){
				try{
					let videourl = JsonMain["Video"][i]["Source"].replace("id://", this.resPath);
					let videoformat = JsonMain["Video"][i]["MediaName"].split(".");
					let videow = JsonMain["Video"][i]["Width"];
					let videoh = JsonMain["Video"][i]["Height"];
					let videox = JsonMain["Video"][i]["X"];
					let videoy = JsonMain["Video"][i]["Y"];
					
					videourl += "." + videoformat[videoformat.length - 1];
					
					res += `<video controls style='position:absolute;top:` + videoy + `px;left:` + videox + `px;width:` + videow + `px;height:` + videoh + `px;'>
							<source src="` + videourl + `">
							Unsupported Function
						</video>`;
				} catch(e){}
			}
		} catch(e){}
		
		document.getElementById(this.body).innerHTML = res;
		return res;
	}
	
	display(page, mode) {
		try{
			page = parseInt(page);
		} catch(e) {
			console.log("[ERROR] Unexpected String in function 'display([page],mode)'!");
			return;
		}
		if(mode == false || mode == null) {
			this.Xml2Html(this.GetSlideSource("Slide_" + page + ".xml"));
		} else {
			var xmlhttp;
			if (window.XMLHttpRequest){xmlhttp=new XMLHttpRequest();}
			else{xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");}
			xmlhttp.onreadystatechange=function(){
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
					this.Xml2Html(xmlhttp.responseXML);
				}
			}
			xmlhttp.open("GET", this.sliPath + "Slide_" + page + ".xml",true);
			xmlhttp.send();
		}
	}
}