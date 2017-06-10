$(window).load(function() {
	$('.right-wrap').animate({right:'0%'}, 600);
	$('.left-wrap').animate({width: '50%'}, 600);
	alertify.set({ delay: 3000 });
	
$('#expand_contract').hover(function() {
		$(this).animate({opacity: "1"}, 200);
	},
	function() {
		$(this).animate({opacity: "0.15"}, 200);
});

//collapse/expand arrow
$("#expand_contract").on("click", function() {
	if($('.left-wrap').is(':animated') || $('.right-wrap').is(':animated')) return;
	else if(calcWidth($('.left-wrap')) > 60) {
		$('.left-wrap').animate({width: '50%'}, 800);
		$('.right-wrap').animate({right:'0%'}, 800, function() {
			editor.refresh(); //avoids line selection issues
		});
		$("#expand_contract").text(">");
	}
	else {
		$('.right-wrap').animate({right:'-50%'}, 800);
		$('.left-wrap').animate({width: '100%'}, 800, function() {
			editor.refresh();
		});
		$("#expand_contract").text("<");
	}
});

//text-toolbar buttons:
$('#text-toolbar').find("li").hover(function() {
	$(this).animate({opacity: "0.2"}, 200);},
	function() {
		$(this).animate({opacity: "1"}, 200);
		}
);

$('.tt-run').on("click", function() {
	//remove error line
	if(scenes["startup"].getValue()) {
		alertify.log("Loading...");
		document.getElementById("viewport").src = 'index.html';
		if(calcWidth($('.left-wrap')) > 60) { $('.right-wrap').animate({right:'0%'}, 800); $('.left-wrap').animate({width: '50%'}, 800); $("#expand_contract").text(">"); }
	} else { 
			alertify.alert("Write (or paste) some code in the startup scene first!");
	}
});

$('.tt-raw').on("click", function() {
	if (document.getElementById('code').style.display == "none") {
		openRaw();
	} else {
		closeRaw();
	}
});

$('.tt-settings').on("click", function() {
	if($('.panel').is(':animated')) return;
	var offset = $('#settings-panel').offset();
	var topOffset = offset.top;
	var offset = $('#var-panel').offset();
	var topOffsetVar = offset.top;
	if(topOffset < 0) {
		$('#settings-panel').animate({top: "25px", bottom: "0px"}, 600);
		if (topOffsetVar > 0) {
			$('#var-panel').animate({top: "-100%", bottom: "100%"}, 600);
		}
	}
	else {
		$('#settings-panel').animate({top: "-100%", bottom: "100%"}, 600);
	}
});

$('.tt-delete').on("click", function() {
	var sel = document.getElementById("scene-selector");
	var this_scene = sel.value;
	if(this_scene == "startup" || this_scene == "choicescript_stats") {
		alertify.confirm("You cannot delete " + this_scene + ", would you like to clear its contents?", function (e) {
			if (e) {
				editor.setValue("");
				editor.focus();
				return;
			}
			else {
				return;
			}
		});
	}
	else {
		alertify.confirm("Permanently delete this scene?", function (e) {
			if (e) {
				editor.setValue("");
				delete scenes[this_scene];
				sel.value = "startup";
				selectScene(editor, "startup");
				$("#scene-selector").find("option[value='" + this_scene + "']").remove();
				alertify.log("Scene '" + this_scene + "' deleted!");
			}
			else {
				return;
			}
		});
		
	}
});

//autosave?
window.autosave = false;
$('.tt-save').on("click", function() {
	IDEsave();
});

$('.tt-menu').on("click", function() {
	if ($('#text-toolbar').find("ul").is(":animated")) return;
	if ($('#text-toolbar').find("ul").first().css("top") != "0px") {
		$('#text-toolbar').find("ul").animate({top: "0px"});
	}
	else {
		$('#text-toolbar').find("ul").animate({top: "-24px"});
	}
});

$('.tt-export-game').on("click", function() {
	alertify.log("<img src='img/ui/loading.gif'> Working...");
	compile();
});

$('.tt-export-scenes').on("click", function() {
	alertify.log("<img src='img/ui/loading.gif'> Working...");
	var fullString = "<b>Scene Files</b><br><i>Click to download</i><br><br>";
	for (var name in scenes) {
		if (scenes.hasOwnProperty(name)) {
			var scene_text = scenes[name].getValue();
			var blob = new Blob([scene_text], {type: "text/plain"});
			var blob_url = URL.createObjectURL(blob);
			fullString += "<a download='" + name + ".txt' href='" + blob_url + "'>" + name + "</a><br>";
		}
	}
	alertify.alert(fullString);
});

$('.tt-help').on("click", function() {
	if (self.frames[0].stats) {
			alertify.confirm("There is a game running, progress will be lost!", function (e) {
			if (e) {
				document.getElementById("viewport").src = 'default.html';
			}
			else {
				return;
			}
		});
	}
	else {
		//do nothing?
		return;
	}
});

$('.tt-vars').on("click", function() {
	if($('.panel').is(':animated')) return;
	var offset = $('#var-panel').offset();
	var topOffset = offset.top;
	var offset = $('#settings-panel').offset();
	var topOffsetSet = offset.top;
	if(topOffset < 0) {
		$('#var-panel').animate({top: "25px", bottom: "0px"}, 600);
		if (topOffsetSet > 0) {
			$('#settings-panel').animate({top: "-100%", bottom: "100%"}, 600);
		}
	}
	else {
		$('#var-panel').animate({top: "-100%", bottom: "100%"}, 600);
	}
});

$('.tt-load').on("click", function() {
	IDEload();
});


$('#scene-selector').on("focus", function() {
	window.currentScene = this.value;
}).on("change", function() {
	if (this.value == "newScene") {
		newScene(currentScene);
	}
	else {
		selectScene(editor, this.options[this.selectedIndex].value);
	}
});

$('#tab-type-control').on("change", function() {
	if (this.value == "spaces") {
		CodeMirror.keyMap.basic.Tab = "spacedTab";
		editor.setOption("indentWithTabs", false);
		alertify.log("Tab Type set to SPACES");
	}
	else {
		CodeMirror.keyMap.basic.Tab = "defaultTab";
		editor.setOption("indentWithTabs", true);
		alertify.log("Tab Type set to TABS");
	}
});

$('#tab-size-control').on("change", function() {
	editor.setOption("tabSize", parseInt(this.value));
	editor.setOption("indentUnit", parseInt(this.value));
	alertify.log("Tab Size set to " + parseInt(this.value));
});

$('#smart-indent-control').on("change", function() {
	if (this.value == 'on') { 
		editor.setOption("smartIndent", true); 
		alertify.log("smartIndent is now ON");
	} else {
		editor.setOption("smartIndent", false); 
		alertify.log("smartIndent is now OFF");
	} 
});

$('#line-wrap-control').on("change", function() {
	if (this.value == 'on') { 
		editor.setOption("lineWrapping", true);
		editor.on("renderLine", function(cm, line, elt) {
			var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
			var pixelTabSize = 8 * editor.options.tabSize;
			var indentLevel = off / pixelTabSize;
			var leftMargin = pixelTabSize * indentLevel;
			elt.style.paddingLeft = leftMargin + "px";
			elt.style.textIndent = "-" + (leftMargin / (indentLevel + 1)) + "px";
		});
		editor.refresh();
		alertify.log("lineWrapping is now ON");
	} else {
		delete editor._handlers.renderLine;
		editor.setOption("lineWrapping", false); 
		editor.refresh();
		alertify.log("lineWrapping is now OFF");
	} 
});

$('#font-size-control').on("change", function() {
	$('#editor-wrap').css("font-size", this.value);
	editor.refresh();
	alertify.log("Font size changed to " + this.value);
});

//variable tracker
$('ul').on('focus', 'input', function() {
	$('#var-tracker-status').html("Editing...");
	clearInterval(intervalTimer);
});

$('ul').on('focusout', 'input', function() {
	$('#var-tracker-status').html("");
	intervalTimer = setInterval(function() {
		updateTracker();
	}, 5000);
});

$("#var-panel").on('keydown', 'input', function(e){
	if (e.keyCode === 13) {
		inputbox = $(this);
		inputbox.animate({opacity:0.2}, 200, 
			function() { 
				setTimeout(function() {
					inputbox.animate({opacity:1}, 200, 
						function() {
							inputbox.removeAttr('disabled');
						}
					);
				}, 1500);
			}
		);
		inputbox.attr('disabled', true);
		var name = $(this).prev("span").text();
		self.frames[0].stats.scene.temps[name] = $(this).val();
		if(self.frames[0].stats.scene.temps[name] = $(this).val()) {
			alertify.log("Value of " + name + " changed to " + $(this).val());
		}
		else {
			alertify.error("Error: Unable to update variable.");
		}
	}
});
	
});

function updateTracker() {
	if(self.frames[0].stats) {

		$('#var-panel').find("ul").html("");
		$('#var-tracker-status').html("<img src='img/ui/loading.gif'> Updating...");
		setTimeout(function() { $('#var-tracker-status').html(""); }, 2000);
		var myVars = new Array();
	
		//globals
		var object = self.frames[0].stats.scene.stats;
		$('#var-panel').find("ul").append("<li><span>GLOBAL VARIABLES</span></li>");
		
		for (var name in object) {
			if (object.hasOwnProperty(name)) {
				myVars.push(name + ": " + object[name]);
				$('#var-panel').find("ul").append("<li>" + "<span>" + name + "</span>" + ": <input class='var-value' style='height: 14px;' value='"+object[name]+"'></input></li>");
			}
			else {
				 return; //do nothing
			}
		}

		//temps
		object = self.frames[0].stats.scene.temps;
		$('#var-panel').find("ul").append("<br><li><span>TEMP VARIABLES</span></li>");
		
		for (name in object) {
			if (object.hasOwnProperty(name)) {
				myVars.push(name + ": " + object[name]);
				$('#var-panel').find("ul").append("<li>" + "<span>" + name + "</span>" + ": <input class='var-value' style='height: 14px;' value='"+object[name]+"'></input></li>");
			}
			else {
				 return; //do nothing
			}
		}
	}
}

var intervalTimer = setInterval(function() {
	updateTracker();
}, 5000);

//other functions
function calcWidth(ele) {
	var width = ele.width();
	var parentWidth = ele.offsetParent().width();
	var percent = 100*width/parentWidth;
	return percent;
}

function newScene(currentScene) {
	alertify.prompt("New scene name?", function (e, name) {
		// str is the input text
		if (e) {
			if (scenes.hasOwnProperty(name) || name == "newScene") {
				alertify.alert("There is already a scene with that name.");
				return;
			}
			else {
				openScene(name, "", "choicescript");
				selectScene(editor, name);
				var sel = document.getElementById("scene-selector");
				sel.value = name;
				alertify.log("Scene '" + name + "' created!");
			}
		} else {
			var sel = document.getElementById("scene-selector");
			sel.value = currentScene;
			return;
		}
	}, "Scene " + countObjectProps(scenes));


}

function countObjectProps(object) {
	var count = 0;
	for (i in object) {
		if (object.hasOwnProperty(i)) {
			count += 1;
		}
	}
	
	//say we have 2 scenes this is the 3rd.
	count += 1; 

	//check for any identical scene names
	while (scenes["Scene " + count]) {
		count += 1;
	}
	return count;
}
function openScene(name, text, mode) {
  scenes[name] = CodeMirror.Doc(text, mode);
  var opt = document.createElement("option");
  opt.value = name;
  opt.appendChild(document.createTextNode(name));
  document.getElementById("scene-selector").appendChild(opt);
}


function selectScene(editor, name) {
  var scene = scenes[name];
  var old = editor.swapDoc(scene);
  editor.focus();
}

function getQueryParams() {
    var qs =  location.search.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
		
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

function get_short_url(long_url, login, api_key, func)
{
    $.getJSON(
        "http://api.bitly.com/v3/shorten?callback=?", 
        { 
            "format": "json",
            "apiKey": api_key,
            "login": login,
            "longUrl": long_url
        },
        function(response)
        {
            func(response.data.url);
        }
    );
}

var login = "o_pe89467ns";
var api_key = "R_c586a0f8ddb044a749dbd9cf94d2cc00";

function getShortUrl() {
	get_short_url(window.location.pathname, login, api_key, function(short_url) {
		console.log(short_url);
	});
}

window.onload = function() {
				openScene("startup", "", "choicescript");
     openScene("choicescript_stats", "", "choicescript");

				selectScene(editor, "startup");
				var sel = document.getElementById("scene-selector");
				sel.value = "startup"; 
	
	var x = getQueryParams();
	
 	if (x.url) {
		$.get( x.url, function( data ) {
			var a= document.createElement('a');
			a.href = x.url;
			var filename= a.pathname.split('/').pop(); // filename.php
			filename = filename.substring(0, filename.lastIndexOf("."));
			document.title = filename;
			if (x.autorun == "true") document.getElementById("viewport").src = 'index.html';
			editor.setValue(data);
			//alertify.alert( "An external scene was loaded." );
		})
		.fail(function() {
			alert("Unable to load external code, is the url correct?");
		});
	} 
	
	//check for saved data:
	var saveData = localStorage["online-choicescript-tester"];
	if (saveData) {
		var conf = confirm("There is saved project data, would you like to load it?");
		if (conf) {
			IDEload();
		}
	}
}

function openRaw() {
	var textArea = document.getElementById('code');
	textArea.style.display = "inline";
	textArea.value = editor.getValue();
}

function closeRaw() {
	var textArea = document.getElementById('code');
	textArea.style.display = "none";
	editor.setValue(textArea.value);
}

function IDEsave() {
	if (!window.autosave) {
		var conf = window.confirm("Would you like to activate autosaving?");
		if (conf) {
			window.autosave = true;
			window.autosaveInterval = setInterval(function() {
				IDEsave();
			}, 60000);
		}
	}
	for (var name in scenes) {
		if (scenes.hasOwnProperty(name)) {
			savedScenes[name] = {
				name: name,
				content: scenes[name].getValue()
			};
		}
		else {
			 return; //do nothing
		}
	}
	try {
		localStorage["online-choicescript-tester"] = JSON.stringify(savedScenes);
		if(localStorage["online-choicescript-tester"]) {
			alertify.success("Project Saved!");
		}
		else {
			alertify.error("The save was unsuccessful.");
		}
	} catch(e) {
		alertify.alert(e.message);
		if (window.autosave) {
			window.autosave = false;
			clearInterval(autosaveInterval);
		}
		
	}
}

function IDEload() {
	var saveData = localStorage["online-choicescript-tester"];
	if (!saveData) {
		alertify.alert("There is no saved data.");
		return;
	}
	alertify.confirm("Current scenes will be deleted, continue?", function(e) {
		if (e) {
			$('#scene-selector').html("<option value='newScene'>New...</option>");
			var sceneList = JSON.parse(saveData);
			for (var name in sceneList) {
				 openScene(sceneList[name].name, sceneList[name].content, "choicescript");
			}
			selectScene(editor, "startup");
			var sel = document.getElementById("scene-selector");
			sel.value = "startup";	
		}
		else {
			return;
		}
	});
}