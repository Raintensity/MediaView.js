console.log("Build MediaView.js");

const fs=require("fs");
const uglifyJS=require("uglify-es");
const uglifyCSS=require("uglifycss");
const package=require("../package");

const minified_header="/*! MediaView v"+package.version+" | (C) Raintensity | MIT License */\r\n";
const minify_options={
	ecma: 7,
	sourceMap: true
};

let path=process.cwd();

let cssFile=fs.readFileSync(path+"/src/mediaview.css","utf-8");
let css=uglifyCSS.processString(cssFile);

let jsFile=fs.readFileSync(path+"/src/mediaview.js","utf-8");
let parsedJS=jsFile.split(/\r\n|\r|\n/);
let line=parsedJS.findIndex(val=>{
	return val.includes("css:");
});
parsedJS[line]="\tcss:`"+css+"`,";

let js=parsedJS.join("\r\n");
let minified_js=uglifyJS.minify(js,minify_options);

try{
	fs.statSync(path+"/dist");
}catch(e){
	fs.mkdirSync(path+"/dist");
}

try{
	fs.mkdirSync(path+"/dist/"+package.version);
	console.log("Created: "+package.version);
}catch(e){
	console.error("[ERROR] Already exist version folder.");
	process.exit(1);
}

try{
	fs.writeFileSync(path+"/dist/"+package.version+"/mediaview.js",js);
	console.log("Created: mediaview.js");
}catch(e){
	console.error("[ERROR] Couldn't create: mediaview.js");
}

try{
	fs.writeFileSync(path+"/dist/"+package.version+"/mediaview.min.js",minified_header+minified_js.code);
	console.log("Created: mediaview.min.js");
}catch(e){
	console.error("[ERROR] Couldn't create: mediaview.min.js");
}

try{
	fs.writeFileSync(path+"/dist/"+package.version+"/mediaview.min.js.map",minified_js.map);
	console.log("Created: mediaview.min.js.map");
}catch(e){
	console.error("[ERROR] Couldn't create: mediaview.min.js.map");
}
