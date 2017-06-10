knownScenes = [];
var scene_object = "";
var csTitle = "";
var success = true;
var skip = false;
var loadFailed = false;

function getScene(name) {
	var text = scenes[name].getValue();
	return text;
}

function compile(){

	scene_object = "";

	//7.1 Find scene files (as we can't read the dir)
	console.log("");
	console.log("Searching for scene files...");
	
	for (var name in scenes) {
		if (scenes.hasOwnProperty(name)) {
			knownScenes.push(name); //add scene to array
			console.log(name);
		}
		else {
			 return; //do nothing
		}
	}
	
	//7.2 Create the allScenes object
	console.log("");
	console.log("Combining scene files...");
	var scene_data = "";
	for (var i = 0; i < knownScenes.length; i++) {
		if (knownScenes[i] == 'choicescript_upgrade.txt') continue;
		scene_data = getScene(knownScenes[i]);
		var scene = new Scene();
		scene.loadLines(scene_data);
		if (knownScenes[i] == 'startup') {
			//Look for CS Title
			var patt = /^\*title[\s](\w*)/i;
			try {
				csTitle = scene_data.match(patt)[1];
			}
			catch(e) {
				csTitle = "My Game";
			}
		}
		var sceneName = knownScenes[i].replace(/\.txt/gi,"");
		sceneName = sceneName.replace(/ /g, "_");
		scene_object = scene_object + "\"" + sceneName + "\": {\"crc\":" + scene.temps.choice_crc + ", \"lines\":" + toJson(scene.lines)+ ", \"labels\":" + toJson(scene.labels) + "}";
		if ((i + 1) != knownScenes.length) {
			scene_object += ",";
		}
	}
	
	scene_object = "allScenes = {" + scene_object + "}";
		
	//8. Reassemble the document (selfnote: allScenes object seems to cause issues if not in its own pair of script tags)
	//javascript
	jsStore = "";
	jsStore = getFile("../scene.js");
	jsStore = jsStore + getFile("../scene.js");
	jsStore = jsStore + getFile("../navigator.js");
	jsStore = jsStore + getFile("../util.js");
	jsStore = jsStore + getFile("../ui.js");
	jsStore = jsStore + getFile("../navigator.js");
	jsStore = jsStore + getFile("../alertify.min.js");
	jsStore = jsStore + getFile("../mygame.js");
	
	//css
	cssStore = getFile("../style.css");
	cssStore = cssStore + getFile("../alertify.css");
	
	var bottom = '</head><body><div id="advertisement"></div><div id="header"><div id="identity"><a href="#" id="email">you@example.com</a><a href="#" id="logout">Sign Out</a></div>'
			   + '<h1 class="gameTitle">' + csTitle + '</h1><h2 id="author" class="gameTitle"></h2><p id="headerLinks"></p><p id="buttons"><button id="statsButton" class="spacedLink" onclick="showStats()">Show Stats</button>'
			   + '<button id="restartButton" onclick="restartGame(\'prompt\')">Restart</button></p></div><div id="main"><div id="text"></div><script>startLoading();</script></div><div id="mobileLinks" class="webOnly">'
			   + '</div><p id="emailUs">Love it?  Hate it?  Write us at <a id="supportEmail" href=\'mailto:support-external@choiceofgames.com\'>support@choiceofgames.com</a></p>';
			   + '<noscript><p>This game requires JavaScript; please enable JavaScript and refresh this page.</p><p>If you can\'t get the game to work, please write to us at';
			   + '<a href="mailto:support-external@choiceofgames.com">support-external@choiceofgames.com</a> for assistance.</p></noscript></body></html>';
	
	var top = '<!DOCTYPE html><html><!--Copyright 2010 by Dan Fabulich.Dan Fabulich licenses this file to you under theChoiceScript License, Version 1.0 (the "License"); you maynot use this file except in compliance with the License.'
			  + 'You may obtain a copy of the License at http://www.choiceofgames.com/LICENSE-1.0.txtSee the License for the specific language governingpermissions and limitations under the License.Unless required by applicable law or agreed to in writing,'
			  + 'software distributed under the License is distributed on an"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.--><head><meta http-equiv="X-UA-Compatible" content="IE=edge" />'
			  + '<meta name = "viewport" content = "width = device-width, initial-scale = 1.0, maximum-scale = 1.0"><!-- INSERT correct meta values --><title>' + csTitle + '</title>';

	console.log("Assembling new html file...");
	var new_game = top + "<script>" + scene_object + "</script><script>" + jsStore + "</script><style>" + cssStore + "</style>" + bottom;
	var blob = new Blob([new_game], {type: "text/html"});
	var bloburl = URL.createObjectURL(blob);
	console.log(bloburl);
	console.log("Export Complete!");
	alertify.alert("Click <a id='link' download='" + csTitle + "' href='" + bloburl + "'>here</a> to download your compiled game.");
	//Dropbox.save(document.getElementById('link').href, csTitle + '.html');
	//document.write('<a href=' + bloburl + ' class="dropbox-saver"></a>');
	doneLoading();

}

function printBody(msg, parent) {
    if (msg === null || msg === undefined || msg === "") return;
    if (!parent) parent = document.body;
    if (msg == " ") {
      // IE7 doesn't like innerHTML that's nothing but " "
      parent.appendChild(document.createTextNode(" "));
      return;
    }

    msg = (msg+"").replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\[b\]/g, '<b>')
      .replace(/\[\/b\]/g, '</b>')
      .replace(/\[i\]/g, '<i>')
      .replace(/\[\/i\]/g, '</i>');
    var frag = document.createDocumentFragment();
    temp = document.createElement('div');
    temp.innerHTML = msg;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    parent.appendChild(frag);

}

function doneLoading() {
  var loadingDiv = document.getElementById("loading");
  if (loadingDiv) loadingDiv.parentNode.removeChild(loadingDiv);
}

function verifyFileName(name) {
  addFile(name);
}

var oldLog = console.log;
console.log = function() {
  var msg = arguments[0];
  printBody(msg);
  var br = document.createElement("br");
  document.body.appendChild(br);
  br.scrollIntoView();
  oldLog.apply(this, arguments);
}

function getFile(url) {
	xhr = new XMLHttpRequest();
	try {
		xhr.open("GET", url, false); //IE errors on xhr.open
		xhr.send();
	}
	catch (x) {
		if (window.location.protocol == "file:" && /Chrome/.test(navigator.userAgent)) {
			doneLoading();
			console.log("We're sorry, Google Chrome has blocked ChoiceScript from functioning.  (\"file:\" URLs cannot "+
			  "load files in Chrome.)  ChoiceScript works just fine in Chrome, but only on a published website like "+
			  "choiceofgames.com.  For the time being, please try another browser like Mozilla Firefox.");
			success = false;
		  }
		  loadFailed = true;
	}
	
	if (xhr.status && xhr.status != 200) {
		loadFailed = true;
	}
	
	if (loadFailed) {
		doneLoading();
		console.log("EXPORT FAILED");
		console.log("Error: Could not open " + url);
		success = false;
		//only Firefox:
		if (typeof InstallTrigger == 'undefined') {
			console.log("Your browser may not be supported. We recommend using Mozilla Firefox with compile.html.");
		}
		return;
	}
	
	if (success) {
		return xhr.responseText;
	}
	else {
		console.log("An unknown error occurred, please email dan at fabulich.com with details");
		exit();
	}
}