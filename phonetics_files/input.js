var textarea;
var is_GECKO = navigator.userAgent.indexOf('Gecko') != -1;
var ipawin;
var repeatDelay = 200;
var repeatRate = 25;
var timer = null;
var pressedKey = '';
var pressedNode = null;
var textarea_selection;
var symbolsUsedBox;
var useEntities = false;
var useHex = true;

function engageKey(){
	textarea.focus();
	saveSelection();
	pressedKey = '';
	pressedNode = this;

	//var target = (e ? e.target : ipawin.event.srcElement);
	if(this.firstChild)
		pressedKey = this.firstChild.data.replace(/\s|[\u2000-\u200A\u25CC]/g, '');
	else
		return;
	var fileName = './' + pressedKey + '.mp3';
	new Audio(fileName).play();
};

function disengageKey(){
	pressedKey = 0;
	self.clearInterval(timer);
	if(pressedNode == this){
		textarea.focus();
		if(textarea_selection)
			textarea_selection.select();
	}
	pressedNode = null;
	
	if(this.nodeName.toLowerCase() == 'a'){
		top.status = top.defaultStatus;
	}
}

function mouseoverSymbol(){
	this.style.backgroundColor = "#FFFF66";
}

function mouseoutSymbol(){
	this.style.backgroundColor = "transparent";
}

function fallbackInit(){
	//move to top iframe
	if(self == window.top){
		window.location.href = "/phonetics/ipa/chart/keyboard/";
		return false;
	}
}

function init(){
	//definitions
	top.document.getElementById('inputFrame').onresize = resizeTextarea;
	if(is_GECKO)
		self.onresize = resizeTextarea;
	else if(navigator.userAgent.match(/MSIE (4|5)/))
	{
		alert("Note: this keyboard does not work in MSIE 5. Please upgrade to version 6, or more preferably, upgrade to Mozilla Firefox.");
		top.location.href = "../index.html";
		return false;
	}

	textarea = document.getElementById('inputField');
	ipawin = top.frames[0];
	symbolsUsedBox = document.getElementById('symbolsUsed');
	useEntities = document.getElementById('insertEntities').checked;
	document.getElementById('insertEntities').onclick = function(){useEntities = this.checked};
	
	//make the document unselectable so that repeated clicks don't select text
	var ipachart = ipawin.document.getElementById('chart');
	var toolbarDiv = document.getElementById('toolbar');
	if(document.all){
		ipachart.onselectstart = function(){return false};
		toolbarDiv.onselectstart = ipachart.onselectstart;
	}
	var abandonClick = function(){return false};
	var focusOnField = function(){
		if(textarea_selection)
			textarea_selection.select();
		textarea.focus();
		return true;
	};
	var overrideAbandonment = function(e){
		e.stopPropagation();
	};
	
	ipachart.onmousedown = abandonClick;
	toolbarDiv.onmousedown = abandonClick;
	ipachart.onclick = focusOnField;
	toolbarDiv.onclick = focusOnField;
	if(document.addEventListener){ //allow the controls to be interactive
		document.getElementById('clearButton').addEventListener('mousedown', overrideAbandonment, false);
		document.getElementById('insertEntities').addEventListener('mousedown', overrideAbandonment, false);
	}
	
	//add event handlers to capture the characters
	var nodes, i;
	function addHandlers(nodes, option){
		for(i = 0; i < nodes.length; i++){
			if(!nodes.item(i).firstChild || !nodes.item(i).firstChild.data)
				continue;
			switch(option){
				case 'yinbiao':
					if(nodes.item(i).className.match(/\bimpossible\b/))
						continue;
					break;
			}
			nodes.item(i).style.cursor = 'pointer';
			if(document.addEventListener){
				nodes.item(i).addEventListener('mousedown', engageKey, false);
				nodes.item(i).addEventListener('mouseup', disengageKey, false);
				nodes.item(i).addEventListener('mouseout', disengageKey, false);
				nodes.item(i).addEventListener('mouseover', mouseoverSymbol, false);
				nodes.item(i).addEventListener('mouseout', mouseoutSymbol, false);
			}
			else {
				nodes.item(i).onmousedown = engageKey;
				nodes.item(i).onmouseup = disengageKey;
				nodes.item(i).onmouseout = disengageKey;
				nodes.item(i).onmouseover = mouseoverSymbol;
				nodes.item(i).onmouseout = mouseoutSymbol;
			}
		}
	}
	
	addHandlers(ipawin.document.getElementById('yinbiao').getElementsByTagName('span'), 'yinbiao');
	resizeTextarea();
	textarea.focus();
}

function resizeTextarea(){
	var height = 0;
	if(self.innerHeight)
		height = self.innerHeight;
	else if(document.documentElement && document.documentElement.clientHeight)
		height = document.documentElement.clientHeight;
	else if(document.body && document.body.clientHeight)
		height = document.body.clientHeight;
	height -= document.getElementById('toolbar').offsetHeight;
	textarea.style.height =  height + "px";
}

function getDocumentWidth(){
	var width = 0;
	if(self.innerWidth)
		width = self.innerWidth;
	else if(document.documentElement && document.documentElement.clientWidth)
		width = document.documentElement.clientWidth;
	else if(document.body && document.body.clientWidth)
		width = document.body.clientWidth;
	return width;
}

//returns the selected element from the edit window (tries to get elementName)
function saveSelection(){
	if(document.selection){//Internet Explorer
		textarea_selection = ipawin.document.selection.createRange();
		textarea_selection.type = ipawin.document.selection.type;	
	}
}

function writekey(){
	textarea.focus();
	if(textarea_selection)
		textarea_selection.select();
	
	//Gecko/Opera
	if (textarea.selectionStart || textarea.selectionStart == '0'){
		var startPos = textarea.selectionStart;
		var endPos = textarea.selectionEnd;
		textarea.value = textarea.value.substring(0, startPos) + pressedKey + textarea.value.substring(endPos, textarea.value.length);
		textarea.selectionStart = startPos+pressedKey.length;
		textarea.selectionEnd = startPos+pressedKey.length;
	}
	//MSIE
	else if(document.selection)
		textarea_selection.text = pressedKey;
	else
		textarea.value += pressedKey;
		
	if(textarea_selection)
		textarea_selection.select();
}

function showSymbolsUsed(){
	document.getElementById('symbolsUsedLabel').style.display = 'inline';
	symbolsUsedBox.style.display = 'inline';
	document.getElementById('instructions').style.display = 'none';
}

function clearField(){
	if(!textarea) return false;
	textarea.value = '';
	textarea_selection = null;
}
