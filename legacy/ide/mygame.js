nav = new SceneNavigator(["startup"]);
stats = {};

Scene.prototype.lineMsg = function lineMsg() { 
	//ensure we're looking at the error document
	if (stats.sceneName != parent.window.editor.getDoc()) {
		parent.window.selectScene(parent.window.editor, stats.sceneName);
		var sel = parent.window.document.getElementById("scene-selector");
		sel.value = stats.sceneName;
	}
	parent.window.editor.setCursor(this.lineNum);
	parent.window.editor.addLineClass(this.lineNum, 'background', 'CodeMirror-error-background');
	setTimeout(function() {
		var line = $(window.parent.document).find('.CodeMirror-lines .CodeMirror-error-background');
		$(window.parent.document).find('.CodeMirror-scroll').scrollTop(0).scrollTop(line.offset().top - $(window.parent.document).find('.CodeMirror-scroll').offset().top - Math.round($(window.parent.document).find('.CodeMirror-scroll').height()/2));
	}, 1000);
	return "line " + (this.lineNum + 1) + ": ";
}    

Scene.prototype.loadScene = function loadScene(url) {
	//CJW overwrites core CS function
      if (this.loading) return;
    this.loading = true;
    startLoading();
    var self = this;
    var done = true;
	try {
        var result = parent.window.scenes[this.name].getValue();
        scene = result;
        scene = scene.replace(/\r/g, "");
        this.loading = false;
        self.loadLines(scene);
        if (self.executing) {
            safeCall(self, function () {
              doneLoading();
              self.execute();
            });
        }
	}
	catch(e) {
		alertify.alert("Error loading Scene '" + this.name + "' - it may not exist.");
	}
};

Scene.prototype.script = function() {
	alertify.alert("Use of *script is disallowed.");
}

function changeTitle(title) {
  document.title = title;
  //addition for IDE:
  parent.window.document.title = title;
  var h1 = document.getElementsByTagName("h1");
  if (h1) h1 = h1[0];
  h1.innerHTML = "";
  h1.appendChild(document.createTextNode(title));
}
