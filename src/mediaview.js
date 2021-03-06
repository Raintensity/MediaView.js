/**
 * MediaView.js
 * See {@link https://github.com/Raintensity/MediaView.js} or {@link https://blog.usx.jp/javascript/mediaview/}.
 * @author Raintensity
 * @license MIT-License
 */
(function(window,document){
const MediaView={
	template:`<div id="media-view"><header><h3></h3><p>FullScreen</p><p>Download</p><p>Close</p></header><p><img src="" draggable="false"><progress max="100" value="0"></progress></p><div><p>&laquo;</p><p>&raquo;</p></div></div>`,
	css:`#media-view *{box-sizing:border-box}#media-view{all:initial;position:fixed;top:0;left:0;width:100%;height:100%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-color:rgba(0,0,0,.8);font-size:0;z-index:10000}:fullscreen #media-view{background-color:#000}#media-view>header{background-color:rgba(0,0,0,.4);color:#ccc;display:flex;position:absolute;width:100%;z-index:1}#media-view>header>*{padding:5px 15px}#media-view>header>h3{flex:1;margin:0;font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#media-view>header>p{margin:0;padding-top:8px;font-size:14px;cursor:pointer}#media-view.media-view-loading>header>p:not(:last-child){pointer-events:none;color:#666}#media-view>header>p:hover{background-color:rgba(255,255,255,.1)}#media-view>header>p:active{background-color:rgba(255,255,255,.07)}#media-view>header>p:last-child{background-color:rgba(255,0,0,.2)}#media-view>header>p:last-child:hover{background-color:rgba(255,0,0,.4)}#media-view>header>p:last-child:active{background-color:rgba(255,0,0,.1)}#media-view>p{margin:0;width:100%;height:100%;padding-top:38px;overflow:hidden;display:flex;justify-content:center;align-items:center}#media-view>p>img{border:0;width:auto;height:auto;max-width:100%;max-height:100%;cursor:zoom-in;background-color:transparent;background-image:linear-gradient(45deg,rgba(0,0,0,.25) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.25) 75%,rgba(0,0,0,.25)),linear-gradient(45deg,rgba(0,0,0,.25) 25%,transparent 25%,transparent 75%,rgba(0,0,0,.25) 75%,rgba(0,0,0,.25));background-position:0 0,10px 10px;background-size:20px 20px}#media-view>p.media-view-zoom{justify-content:flex-start;align-items:flex-start;position:relative}#media-view>p.media-view-zoom.media-view-zoom-x{justify-content:center}#media-view>p.media-view-zoom.media-view-zoom-y{align-items:center}#media-view>p.media-view-zoom>img{max-width:unset;max-height:unset;cursor:zoom-out;position:absolute}#media-view>p>progress{display:none;width:80%;height:8px;-webkit-appearance:none}#media-view>p>img[src='']{display:none}#media-view>p>img[src='']+progress{display:inline}#media-view>div>p{margin:0;padding:5px;z-index:0;display:flex;align-items:center;font-size:35px;height:calc(100% - 38px);position:absolute;color:rgba(255,255,255,.5);bottom:0;font-weight:bold;background-color:rgba(255,255,255,.05);cursor:pointer}#media-view>div>p:hover{background-color:rgba(255,255,255,.2)}#media-view>div>p:active{background-color:rgba(255,255,255,.1)}#media-view>div>p:first-child{left:0}#media-view>div>p:last-child{right:0}#media-view>div>p.media-view-disabled{cursor:default;background-color:initial;color:rgba(255,255,255,.2)}#media-view>div>p.media-view-disabled:hover{background-color:initial}#media-view>div>p.media-view-disabled:active{background-color:initial}#media-view>p.media-view-zoom+div>p.media-view-disabled{display:none}@media screen and (max-width:480px){#media-view>header>p:not(:last-child){display:none}}`,
	current:null,
	currentDOM:null,
	currentEvent:{},
	currentXHR:null,
	currentObject:null,
	dPos:{},
	init(){
		let cssNode=document.createElement("style");
		cssNode.appendChild(document.createTextNode(this.css));
		document.head.appendChild(cssNode);

		let node=document.querySelectorAll("img[src],[data-media-view]");
		for(let i=0;i<node.length;i++){
			let val=node[i].dataset.mediaView?node[i].dataset.mediaView.toLowerCase():null;
			if(!val||val==="")node[i].dataset.mediaView="[default]";
			if(val==="[false]"||val==="!")continue;
			if(val==="[null]"||val===".")node[i].dataset.mediaView="[null]";
			node[i].addEventListener("click",this.show.bind(this));
		}
	},
	show(e){
		e.preventDefault();
		let self=this.current=e.currentTarget;
		if(document.getElementById("media-view"))return;
		let dom=this.currentDOM=new DOMParser().parseFromString(this.template,"text/html").getElementById("media-view");
		let imgNode=dom.getElementsByTagName("img")[0];

		//Set image info
		if(self.dataset.mediaViewSrc)this.load(self.dataset.mediaViewSrc);
		else imgNode.src=self.src;
		dom.getElementsByTagName("h3")[0].textContent=((self.dataset.mediaView&&self.dataset.mediaView!=="[null]"&&self.dataset.mediaView!=="[default]")?self.dataset.mediaView+" - ":"")+(self.alt||self.src.split("/").pop());
		
		//Hide-Event
		this.currentEvent.keyboardEvent=this.keyboardEvent.bind(this);
		imgNode.parentNode.addEventListener("click",this.hide.bind(this));
		document.addEventListener("keydown",this.currentEvent.keyboardEvent);

		//Zoom-Event
		imgNode.addEventListener("click",e=>e.stopPropagation());
		imgNode.addEventListener("contextmenu",e=>e.preventDefault());
		imgNode.addEventListener("mousemove",this.mouseEvent.bind(this));
		imgNode.addEventListener("mouseup",this.mouseEvent.bind(this));
		imgNode.addEventListener("touchend",e=>e.preventDefault());
		imgNode.addEventListener("dragstart",e=>e.preventDefault());//Fix firefox

		//Pager-Event
		let prevNode=dom.childNodes[2].childNodes[0],nextNode=dom.childNodes[2].childNodes[1];
		prevNode.addEventListener("click",this.page.bind(this,-1));
		nextNode.addEventListener("click",this.page.bind(this,1));

		//Prevent scroll
		this.currentEvent.scrollEvent=window.scrollTo.bind(null,window.pageXOffset,window.pageYOffset);
		window.addEventListener("scroll",this.currentEvent.scrollEvent);

		//Action buttons
		let actButtons=dom.childNodes[0].getElementsByTagName("p");
		if(this.util.canFullScreen())actButtons[0].addEventListener("click",this.util.toggleFullScreen.bind());
		else actButtons[0].style.display="none";
		actButtons[1].addEventListener("click",this.util.execDownload.bind(null,imgNode.src));
		actButtons[2].addEventListener("click",this.hide.bind(this));

		let pages=this.util.getPages(this.current);
		if(pages.length===1||self.dataset.mediaView==="[null]")dom.childNodes[2].style.display="none";
		else{
			let nowPage=pages.indexOf(this.current);
			if(nowPage-1<0)dom.childNodes[2].childNodes[0].classList.add("media-view-disabled");
			if(pages.length<=nowPage+1)dom.childNodes[2].childNodes[1].classList.add("media-view-disabled");
		}

		//Add to body element
		document.body.appendChild(dom);
	},
	load(url){
		if(this.currentXHR)this.currentXHR.abort();
		if(this.currentObject){
			URL.revokeObjectURL(this.currentObject);
			this.currentObject=null;
		}
		this.currentDOM.classList.add("media-view-loading");
		this.currentXHR=new XMLHttpRequest();
		this.currentXHR.open("GET",url,true);
		this.currentXHR.responseType="blob";
		this.currentXHR.addEventListener("load",this.loaded.bind(this));
		this.currentXHR.addEventListener("progress",this.loading.bind(this));
		this.currentXHR.addEventListener("error",this.failed.bind(this));
		this.currentXHR.send();
	},
	loading(e){
		this.currentDOM.getElementsByTagName("progress")[0].value=~~(e.loaded/e.total*100);
	},
	loaded(e){
		this.currentObject=URL.createObjectURL(this.currentXHR.response);
		this.currentDOM.getElementsByTagName("img")[0].src=this.currentObject;
		this.currentDOM.getElementsByTagName("progress")[0].value=0;
		this.currentXHR=null;
		this.currentDOM.classList.remove("media-view-loading");
	},
	failed(){
		this.hide();
		this.error.show("Failed load image.");
	},
	mouseEvent(e){
		e.stopPropagation();
		if(e.type==="mousemove"){
			if((e.buttons&0b00001)!==1)return;
			if(!this.currentDOM.getElementsByTagName("img")[0].parentNode.classList.contains("media-view-zoom"))return;
			if(e.movementX!==0||e.movementY!==0)this.dPos={x:e.pageX,y:e.pageY};
			this.grab.call(this,e);
		}else if(e.type==="mouseup"){
			if(e.button!==0)return;
			if(Object.keys(this.dPos).length===0)this.zoom.call(this,e);
			this.dPos={};
		}
	},
	keyboardEvent(e){
		if(e.keyCode===27){//Esc
			e.preventDefault();
			this.hide.call(this,e);
		}else if(e.keyCode===37){//Left-arrow
			e.preventDefault();
			this.page.call(this,-1);
		}else if(e.keyCode===39){//Right-arrow
			e.preventDefault();
			this.page.call(this,1);
		}
	},
	hide(e){
		if(document.fullscreenElement&&e.currentTarget===this.currentDOM.getElementsByTagName("img")[0].parentNode)return;
		if(document.fullscreenElement)this.util.toggleFullScreen();
		if(this.currentXHR)this.currentXHR.abort();
		if(this.currentObject)URL.revokeObjectURL(this.currentObject);
		document.body.removeChild(this.currentDOM);
		document.removeEventListener("keydown",this.currentEvent.keyboardEvent);
		window.removeEventListener("scroll",this.currentEvent.scrollEvent);
		this.current=this.currentDOM=this.currentXHR=this.currentObject=null;
		delete this.currentEvent.keyboardEvent;
	},
	zoom(e){
		let imgNode=this.currentDOM.getElementsByTagName("img")[0];
		if(!imgNode.parentNode.classList.contains("media-view-zoom")){
			if(imgNode.naturalWidth===imgNode.width&&imgNode.naturalHeight===imgNode.height)return;
			let style=document.body.currentStyle||window.getComputedStyle(document.body);
			let scrollbarWidth=(window.innerWidth-document.body.clientWidth-parseFloat(style.marginLeft)-parseFloat(style.marginRight));
			
			//Centering
			if(imgNode.naturalWidth<window.innerWidth-scrollbarWidth)imgNode.parentNode.classList.add("media-view-zoom-x");
			if(imgNode.naturalHeight<window.innerHeight)imgNode.parentNode.classList.add("media-view-zoom-y");
			
			imgNode.parentNode.classList.add("media-view-zoom");

			//Scroll to center
			imgNode.parentNode.scrollLeft=imgNode.naturalWidth/2-(window.innerWidth-scrollbarWidth)/2;
			imgNode.parentNode.scrollTop=imgNode.naturalHeight/2-(window.innerHeight-scrollbarWidth)/2;
		}else{
			imgNode.parentNode.classList.remove("media-view-zoom");
		}
	},
	grab(/** @type MouseEvent */e){
		let imgParentNode=this.currentDOM.getElementsByTagName("img")[0].parentNode;
		imgParentNode.scrollLeft-=e.movementX;
		imgParentNode.scrollTop-=e.movementY;
	},
	page(n){
		let pages=this.util.getPages(this.current);
		let nowPage=pages.indexOf(this.current);
		if(nowPage+n<0||pages.length<=nowPage+n||this.current.dataset.mediaView==="[null]")return;
		let imgNode=this.currentDOM.getElementsByTagName("img")[0];

		this.current=pages[nowPage+n];
		imgNode.src="";
		if(this.current.dataset.mediaViewSrc)this.load(this.current.dataset.mediaViewSrc);
		else imgNode.src=this.current.src;
		this.currentDOM.getElementsByTagName("h3")[0].textContent=((this.current.dataset.mediaView&&this.current.dataset.mediaView!=="[null]"&&this.current.dataset.mediaView!=="[default]")?this.current.dataset.mediaView+" - ":"")+(this.current.alt||this.current.src.split("/").pop());
		imgNode.parentNode.classList.remove("media-view-zoom");

		//Prev/Next button state check.
		if(nowPage+n-1<0)this.currentDOM.childNodes[2].childNodes[0].classList.add("media-view-disabled");
		else this.currentDOM.childNodes[2].childNodes[0].classList.remove("media-view-disabled");
		if(pages.length<=nowPage+n+1)this.currentDOM.childNodes[2].childNodes[1].classList.add("media-view-disabled");
		else this.currentDOM.childNodes[2].childNodes[1].classList.remove("media-view-disabled");
	},
	error:{
		current:[],
		show(msg){
			let elem=document.createElement("p");
			elem.setAttribute("style","all:initial;position:fixed;top:0;left:0;width:100%;text-align:center;z-index:10000;font-size:16px;padding:5px 10px;background-color:rgba(255,220,220,.8);color:#a44;font-weight:bold;cursor:pointer;margin:0;");
			elem.appendChild(document.createTextNode(msg));
			elem.addEventListener("click",this.hide.bind(this));
			let key=window.setTimeout(()=>elem.dispatchEvent(new MouseEvent("click")),5000);
			this.current.push({key,elem});
			document.body.appendChild(elem);
		},
		hide(e){
			for(let i=0;i<this.current.length;i++){
				if(e.currentTarget!==this.current[i].elem)continue;
				window.clearTimeout(this.current[i].key);
				document.body.removeChild(this.current[i].elem);
				delete this.current[i];
				this.current=this.current.filter(Boolean);
				break;
			}
		}
	},
	util:{
		getPages(current){
			let groupName=current.dataset.mediaView;
			return Array.from(document.querySelectorAll("[data-media-view='"+groupName+"']"));
		},
		canFullScreen(){
			return document.webkitFullScreenEnabled||document.mozFullScreenEnabled||document.msFullScreenEnabled||document.fullscreenEnabled;
		},
		toggleFullScreen(){
			if(document.fullscreenElement){
				if(document.webkitFullScreenEnabled)document.webkitCancelFullScreen();
				else if(document.mozFullScreenEnabled)document.mozCancelFullScreen();
				else if(document.msFullScreenEnabled)document.msExitFullscreen();
				else if(document.fullscreenEnabled)document.exitFullscreen();
			}else{
				if(document.webkitFullScreenEnabled)document.body.webkitRequestFullscreen();
				else if(document.mozFullScreenEnabled)document.body.mozRequestFullScreen();
				else if(document.msFullScreenEnabled)document.body.msRequestFullscreen();
				else if(document.fullscreenEnabled)document.body.requestFullscreen();
			}
		},
		execDownload(url){
			let dummyElem=document.createElement("a");
			dummyElem.href=url;
			dummyElem.setAttribute("download","");
			dummyElem.setAttribute("target","_blank");
			dummyElem.dispatchEvent(new MouseEvent("click"));
			dummyElem=null;
		}
	}
};

window.document.addEventListener("DOMContentLoaded",()=>MediaView.init());

})(window,window.document);
