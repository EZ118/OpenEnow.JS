/**
 * ENOW.js - A modern library to render .enbx courseware directly from a JSZip object.
 */

/**
 * 简化版 XML 转 JSON 函数
 */
function xml2json(xmlNode) {
	if (xmlNode.nodeType === Node.TEXT_NODE || xmlNode.nodeType === Node.CDATA_SECTION_NODE) {
		return xmlNode.nodeValue.trim() || null;
	}

	if (xmlNode.nodeType !== Node.ELEMENT_NODE) {
		return {};
	}

	const result = {};

	// 处理属性
	if (xmlNode.attributes && xmlNode.attributes.length > 0) {
		for (let attr of xmlNode.attributes) {
			result[`@${attr.nodeName}`] = attr.nodeValue;
		}
	}

	// 处理子节点
	let hasChildElements = false;
	let textContent = '';

	for (let i = 0; i < xmlNode.childNodes.length; i++) {
		const child = xmlNode.childNodes[i];

		if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
			textContent += child.nodeValue;
		} else if (child.nodeType === Node.ELEMENT_NODE) {
			hasChildElements = true;
			const childName = child.nodeName;
			const childData = xml2json(child);

			if (childData !== null) {
				if (result[childName] === undefined) {
					result[childName] = childData;
				} else {
					if (!Array.isArray(result[childName])) {
						result[childName] = [result[childName]];
					}
					result[childName].push(childData);
				}
			}
		}
	}

	if (!hasChildElements) {
		textContent = textContent.trim();
		return textContent || null;
	}

	textContent = textContent.trim();
	if (textContent) {
		result['#text'] = textContent;
	}

	return result;
}

function xmlStr2Json(xmlStr) {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

	if (xmlDoc.querySelector("parsererror")) {
		console.error("XML Parsing Error:", xmlDoc.querySelector("parsererror").textContent);
		return {};
	}

	const rootElement = xmlDoc.documentElement;
	return xml2json(rootElement);
}

class ENOW {
	constructor() {
		this.sliPath = "Slides/";
		this.resPath = "Resources/";
		this.name = "Enbx Courseware";
		this.containerSelector = "body";
		this.zip = null;
		this.resourceCache = new Map(); // 缓存资源的blob URL
	}

	CONFIG(options) {
		if (!options || !options.container || !options.zip) {
			throw new Error("CONFIG requires 'container' (selector) and 'zip' (JSZip instance) options.");
		}
		this.containerSelector = options.container;
		this.zip = options.zip;
		this.sliPath = options.slides || this.sliPath;
		this.resPath = options.resources || this.resPath;
	}

	async _getFileAsText(filePath) {
		if (!this.zip) {
			throw new Error("ZIP file not loaded. Call CONFIG() first.");
		}
		const file = this.zip.file(filePath);
		if (!file) {
			throw new Error(`File not found in ZIP: ${filePath}`);
		}
		return await file.async("text");
	}

	/**
	 * 从ZIP中获取资源文件并创建blob URL
	 * @param {string} resourceId - 资源ID（去掉id://前缀）
	 * @param {string} extension - 文件扩展名
	 * @returns {Promise<string>} - blob URL
	 */
	async _getResourceUrl(resourceId, extension) {
		const cacheKey = `${resourceId}.${extension}`;

		// 检查缓存
		if (this.resourceCache.has(cacheKey)) {
			return this.resourceCache.get(cacheKey);
		}

		try {
			// 尝试不同的可能路径
			const possiblePaths = [
				`${this.resPath}${resourceId}.${extension}`,
				`${this.resPath}${resourceId}`,
				`Resources/${resourceId}.${extension}`,
				`Resources/${resourceId}`,
				`${resourceId}.${extension}`,
				resourceId
			];

			let file = null;
			let foundPath = null;

			for (const path of possiblePaths) {
				file = this.zip.file(path);
				if (file) {
					foundPath = path;
					break;
				}
			}

			if (!file) {
				console.warn(`Resource not found: ${resourceId}.${extension}`);
				console.log('Available files in ZIP:', Object.keys(this.zip.files));
				return null;
			}

			console.log(`Found resource at: ${foundPath}`);

			// 根据文件类型获取适当的数据
			let mimeType = this._getMimeType(extension);
			const blob = await file.async("blob");
			const blobWithType = new Blob([blob], { type: mimeType });
			const blobUrl = URL.createObjectURL(blobWithType);

			// 缓存URL
			this.resourceCache.set(cacheKey, blobUrl);
			return blobUrl;

		} catch (error) {
			console.error(`Failed to load resource ${resourceId}.${extension}:`, error);
			return null;
		}
	}

	/**
	 * 根据文件扩展名获取MIME类型
	 */
	_getMimeType(extension) {
		const mimeTypes = {
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'gif': 'image/gif',
			'bmp': 'image/bmp',
			'svg': 'image/svg+xml',
			'mp3': 'audio/mpeg',
			'wav': 'audio/wav',
			'ogg': 'audio/ogg',
			'mp4': 'video/mp4',
			'webm': 'video/webm',
			'avi': 'video/avi'
		};
		return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
	}

	async display(page) {
		try {
			page = parseInt(page, 10);
			if (isNaN(page) || page < 0) {
				throw new Error(`Invalid page number: ${page}`);
			}

			const slideFileName = `Slide_${page}.xml`;
			const fullPath = this.sliPath + slideFileName;

			console.log(`[ENOW] Loading slide: ${fullPath}`);
			const xmlText = await this._getFileAsText(fullPath);
			const slide = xmlStr2Json(xmlText);

			console.log(`[ENOW] Parsed slide data:`, slide);

			await this._renderSlide(slide);

		} catch (error) {
			console.error(`[ENOW] Failed to load or render slide ${page}:`, error.message);
			const container = document.querySelector(this.containerSelector);
			if (container) {
				container.innerHTML = `<div style="color: red; font-family: Arial, sans-serif; padding: 20px;">
                    <h3>Error</h3>
                    <p>Failed to load slide ${page}.</p>
                    <p>${error.message}</p>
                </div>`;
			}
		}
	}

	async _renderSlide(slide) {
		if (!slide) {
			throw new Error("Invalid slide data: slide is null or undefined.");
		}

		const container = document.querySelector(this.containerSelector);
		if (!container) {
			throw new Error(`Container element not found: ${this.containerSelector}`);
		}

		// 设置幻灯片大小
		const width = parseInt(slide.Width || 1280, 10);
		const height = parseInt(slide.Height || 720, 10);

		container.style.width = width + "px";
		container.style.height = height + "px";
		container.style.position = "relative";
		container.style.overflow = "hidden";
		container.style.border = "1px solid #ccc"; // 添加边框便于调试

		// 清空容器
		container.innerHTML = '';

		// 设置背景
		if (slide.Background && slide.Background.ImageBrush && slide.Background.ImageBrush.Source) {
			const bgResourceId = slide.Background.ImageBrush.Source.replace("id://", "");
			console.log(`[ENOW] Loading background: ${bgResourceId}`);

			// 尝试常见的图片格式
			const bgFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
			for (const format of bgFormats) {
				const bgUrl = await this._getResourceUrl(bgResourceId, format);
				if (bgUrl) {
					container.style.backgroundImage = `url('${bgUrl}')`;
					container.style.backgroundSize = "100% 100%";
					container.style.backgroundRepeat = "no-repeat";
					console.log(`[ENOW] Background loaded: ${format}`);
					break;
				}
			}
		}

		// 处理元素
		if (slide.Elements) {
			await this._renderElements(slide.Elements, container);
		}

		console.log(`[ENOW] Slide rendered successfully`);
	}

	async _renderElements(elements, container) {
		// 处理文本元素
		const textElements = this._ensureArray(elements.Text);
		for (const txt of textElements) {
			await this._renderTextElement(txt, container);
		}

		// 处理图片元素
		const pictureElements = this._ensureArray(elements.Picture);
		for (const img of pictureElements) {
			await this._renderPictureElement(img, container);
		}

		// 处理音频元素
		const audioElements = this._ensureArray(elements.Audio);
		for (const audio of audioElements) {
			await this._renderAudioElement(audio, container);
		}

		// 处理视频元素
		const videoElements = this._ensureArray(elements.Video);
		for (const video of videoElements) {
			await this._renderVideoElement(video, container);
		}
	}

	async _renderTextElement(txt, container) {
		const richText = txt.RichText;
		let textContent = "";

		if (richText && richText.Text) {
			textContent = richText.Text.toString();
		}

		textContent = textContent.replace(/\r\n|\n|\r/g, '<br/>');

		const x = parseFloat(txt.X || 0);
		const y = parseFloat(txt.Y || 0);
		const w = parseFloat(txt.Width || 100);
		const h = parseFloat(txt.Height || 50);

		// 提取样式
		let fontSize = 16;
		let fontFamily = "Arial";
		let color = "#000000";
		let fontWeight = "normal";
		let fontStyle = "normal";

		if (richText && richText.TextLines && richText.TextLines.TextLine) {
			const textLine = Array.isArray(richText.TextLines.TextLine)
				? richText.TextLines.TextLine[0]
				: richText.TextLines.TextLine;

			if (textLine.TextRuns && textLine.TextRuns.TextRun) {
				const textRun = Array.isArray(textLine.TextRuns.TextRun)
					? textLine.TextRuns.TextRun[0]
					: textLine.TextRuns.TextRun;

				// 字体大小
				if (textRun.FontSize) {
					fontSize = parseFloat(textRun.FontSize);
				}

				// 字体族
				if (textRun.FontFamily && textRun.FontFamily.Source) {
					fontFamily = textRun.FontFamily.Source;
				}

				// 颜色处理 - 支持多种格式
				if (textRun.Foreground && textRun.Foreground.ColorBrush) {
					const colorValue = textRun.Foreground.ColorBrush;
					color = this._parseColor(colorValue);
				}

				// 字体粗细
				if (textRun.FontWeight) {
					fontWeight = textRun.FontWeight.toLowerCase();
					if (fontWeight === 'bold') fontWeight = 'bold';
					else fontWeight = 'normal';
				}

				// 字体样式
				if (textRun.FontStyle) {
					fontStyle = textRun.FontStyle.toLowerCase();
					if (fontStyle === 'italic') fontStyle = 'italic';
					else fontStyle = 'normal';
				}
			}
		}

		console.log(`[ENOW] Text style: color=${color}, fontSize=${fontSize}, fontFamily=${fontFamily}`);

		const textDiv = document.createElement('div');
		textDiv.style.position = 'absolute';
		textDiv.style.left = x + 'px';
		textDiv.style.top = y + 'px';
		textDiv.style.width = w + 'px';
		textDiv.style.height = h + 'px';
		textDiv.style.fontSize = fontSize + 'px';
		textDiv.style.fontFamily = `"${fontFamily}", Arial, sans-serif`;
		textDiv.style.color = color;
		textDiv.style.fontWeight = fontWeight;
		textDiv.style.fontStyle = fontStyle;
		textDiv.style.overflow = 'hidden';
		textDiv.style.lineHeight = '1.2';
		// textDiv.style.border = '1px dashed rgba(255,0,0,0.3)'; // 调试边框 - 可以注释掉
		textDiv.innerHTML = textContent;

		container.appendChild(textDiv);
	}

	async _renderPictureElement(img, container) {
		const resourceId = img.Source ? img.Source.replace("id://", "") : null;
		const pictureName = img.PictureName || "image.png";
		const extension = pictureName.split('.').pop() || 'png';

		if (!resourceId) {
			console.warn("Picture element missing source");
			return;
		}

		const x = parseFloat(img.X || 0);
		const y = parseFloat(img.Y || 0);
		const w = parseFloat(img.Width || 100);
		const h = parseFloat(img.Height || 100);

		console.log(`[ENOW] Loading image: ${resourceId}.${extension} at (${x}, ${y}) size ${w}x${h}`);

		const imgUrl = await this._getResourceUrl(resourceId, extension);

		if (imgUrl) {
			const imgElement = document.createElement('img');
			imgElement.src = imgUrl;
			imgElement.style.position = 'absolute';
			imgElement.style.left = x + 'px';
			imgElement.style.top = y + 'px';
			imgElement.style.width = w + 'px';
			imgElement.style.height = h + 'px';
			imgElement.style.border = '1px dashed rgba(0,255,0,0.3)'; // 调试边框

			imgElement.onload = () => {
				console.log(`[ENOW] Image loaded successfully: ${resourceId}`);
			};

			imgElement.onerror = () => {
				console.error(`[ENOW] Failed to load image: ${resourceId}`);
			};

			container.appendChild(imgElement);
		} else {
			// 创建占位符
			const placeholder = document.createElement('div');
			placeholder.style.position = 'absolute';
			placeholder.style.left = x + 'px';
			placeholder.style.top = y + 'px';
			placeholder.style.width = w + 'px';
			placeholder.style.height = h + 'px';
			placeholder.style.backgroundColor = '#f0f0f0';
			placeholder.style.border = '2px dashed #ccc';
			placeholder.style.display = 'flex';
			placeholder.style.alignItems = 'center';
			placeholder.style.justifyContent = 'center';
			placeholder.innerHTML = `<span style="color: #666;">Image not found<br>${resourceId}</span>`;

			container.appendChild(placeholder);
		}
	}

	async _renderAudioElement(audio, container) {
		const resourceId = audio.Source ? audio.Source.replace("id://", "") : null;
		const mediaName = audio.MediaName || "audio.mp3";
		const extension = mediaName.split('.').pop() || 'mp3';

		if (!resourceId) return;

		const x = parseFloat(audio.X || 0);
		const y = parseFloat(audio.Y || 0);
		const w = parseFloat(audio.Width || 200);
		const h = parseFloat(audio.Height || 30);

		const audioUrl = await this._getResourceUrl(resourceId, extension);

		const audioElement = document.createElement('audio');
		audioElement.controls = true;
		audioElement.style.position = 'absolute';
		audioElement.style.left = x + 'px';
		audioElement.style.top = y + 'px';
		audioElement.style.width = w + 'px';
		audioElement.style.height = h + 'px';

		if (audioUrl) {
			audioElement.src = audioUrl;
		}

		container.appendChild(audioElement);
	}

	async _renderVideoElement(video, container) {
		const resourceId = video.Source ? video.Source.replace("id://", "") : null;
		const mediaName = video.MediaName || "video.mp4";
		const extension = mediaName.split('.').pop() || 'mp4';

		if (!resourceId) return;

		const x = parseFloat(video.X || 0);
		const y = parseFloat(video.Y || 0);
		const w = parseFloat(video.Width || 320);
		const h = parseFloat(video.Height || 240);

		const videoUrl = await this._getResourceUrl(resourceId, extension);

		const videoElement = document.createElement('video');
		videoElement.controls = true;
		videoElement.style.position = 'absolute';
		videoElement.style.left = x + 'px';
		videoElement.style.top = y + 'px';
		videoElement.style.width = w + 'px';
		videoElement.style.height = h + 'px';

		if (videoUrl) {
			videoElement.src = videoUrl;
		}

		container.appendChild(videoElement);
	}

	/**
	 * 解析颜色值，支持多种格式
	 * @param {string} colorValue - 颜色值（如 #FFFFFFFF, #FFFFFF, rgba等）
	 * @returns {string} - 标准的CSS颜色值
	 */
	_parseColor(colorValue) {
		if (!colorValue) return "#000000";

		// 移除空格
		colorValue = colorValue.trim();

		// 如果是8位十六进制颜色 (ARGB格式: #AARRGGBB)
		if (colorValue.match(/^#[0-9A-Fa-f]{8}$/)) {
			// 提取 ARGB
			const a = parseInt(colorValue.substr(1, 2), 16) / 255; // Alpha
			const r = parseInt(colorValue.substr(3, 2), 16);       // Red
			const g = parseInt(colorValue.substr(5, 2), 16);       // Green  
			const b = parseInt(colorValue.substr(7, 2), 16);       // Blue

			// 如果alpha是1，返回标准hex格式，否则返回rgba
			if (a === 1) {
				return `#${colorValue.substr(3, 6)}`;
			} else {
				return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
			}
		}

		// 如果是6位十六进制颜色
		if (colorValue.match(/^#[0-9A-Fa-f]{6}$/)) {
			return colorValue;
		}

		// 如果是3位十六进制颜色
		if (colorValue.match(/^#[0-9A-Fa-f]{3}$/)) {
			return colorValue;
		}

		// 如果已经是rgba或rgb格式
		if (colorValue.startsWith('rgb')) {
			return colorValue;
		}

		// 预定义颜色名称映射
		const colorNames = {
			'white': '#FFFFFF',
			'black': '#000000',
			'red': '#FF0000',
			'green': '#008000',
			'blue': '#0000FF',
			'yellow': '#FFFF00',
			'cyan': '#00FFFF',
			'magenta': '#FF00FF'
		};

		const lowerColor = colorValue.toLowerCase();
		if (colorNames[lowerColor]) {
			return colorNames[lowerColor];
		}

		// 默认返回黑色
		console.warn(`[ENOW] Unknown color format: ${colorValue}, using black`);
		return "#000000";
	}

	_ensureArray(value) {
		if (Array.isArray(value)) return value;
		if (value === undefined || value === null) return [];
		return [value];
	}

	/**
	 * 清理资源缓存
	 */
	dispose() {
		for (const url of this.resourceCache.values()) {
			URL.revokeObjectURL(url);
		}
		this.resourceCache.clear();
	}
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ENOW;
}