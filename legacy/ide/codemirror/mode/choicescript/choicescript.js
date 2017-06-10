CodeMirror.defineMode("choicescript", function(conf, parserConf) {
    var ERRORCLASS = 'error';

    function wordRegexp(words) {
        return new RegExp("^((" + words.join(")|(") + "))\\b");
    }
	
	function CommandRegexp(words) {
		return new RegExp("^\\*(" + words.join('|') + ")");
	}

    var singleOperators = parserConf.singleOperators || new RegExp("^[\\+\\-\/%&|\\^~<>#&$=\*]");
    var singleDelimiters = parserConf.singleDelimiters || new RegExp('^[\\(\\)\\[\\]\\{\\}@,`=\\.]');
    var doubleOperators = parserConf.doubleOperators || new RegExp("^((==)|(!=)|(<=)|(>=)|(<>)|(<<)|(>>)|(//)|(\\*\\*))");
    var doubleDelimiters = parserConf.doubleDelimiters || new RegExp("^((\\+=)|(\\-=)|(\\*=)|(%=)|(/=)|(&=)|(\\|=)|(\\^=))");
    var tripleDelimiters = parserConf.tripleDelimiters || new RegExp("^((//=)|(>>=)|(<<=)|(\\*\\*=))");
    var identifiers = parserConf.identifiers|| new RegExp("^[_A-Za-z][_A-Za-z0-9]*");

    var wordOperators = wordRegexp(['and', 'or', 'not']);
    var commonkeywords = ['/^\*label /'];
	var commonCommands =["abort", "achievement", "achieve", "advertisement", "allow_reuse", "author", "bug", "check_achievements", 
						"check_purchase", "check_registration", "choice", "comment", "create", "delay_break", "delay_ending", 
						"delete", "disable_reuse", "elseif", "elsif", "else", "end_trial", "ending", "fake_choice", "finish",
						"gosub_scene", "gosub", "goto_random_scene", "goto_scene", "gotoref", "goto", "hide_reuse", "if", "image",
						"input_number", "input_text", "line_break", "link_button", "link", "login", "looplimit", "more_games",
						"page_break", "print", "purchase", "rand", "reset", "restart", "restore_game", "restore_purchases", "return", 
						"save_game", "selectable_if", "scene_list", "script", "setref", "set", "share_this_game", "show_password", "sound", "stat_chart",
						"subscribe", "temp", "title"];
	var commentWords = ["comment"];
	var indentCommands = ["choice", "if", "scene_list", "elseif", "else", "elsif", "fake_choice", "stat_chart"];
	var dedentCommands = ["finish", "goto_scene", "goto", "ending"];
	
	
/*     if (!!parserConf.version && parseInt(parserConf.version, 10) === 3) {
        var stringPrefixes = new RegExp("^(([rb]|(br))?('{3}|\"{3}|['\"]))", "i");
    } else {
        var stringPrefixes = new RegExp("^(([rub]|(ur)|(br))?('{3}|\"{3}|['\"]))", "i");
    } */
	
    var keywords = /^\*label| $/;

    var builtins = CommandRegexp(commonCommands);
	var comments = CommandRegexp(commentWords);
	var indentCommands = CommandRegexp(indentCommands);
	var dedentCommands = CommandRegexp(dedentCommands);
    var indentInfo = null;

    // tokenizers
    function tokenBase(stream, state) {
	
		var ch = stream.peek();
		
        // Handle scope changes (sol = start of line)
         if (stream.sol()) {
            var scopeOffset = state.scopes[0].offset;
            if (stream.eatSpace()) {
                var lineOffset = stream.indentation();
                if (lineOffset > scopeOffset) {
                    indentInfo = 'indent';
                } else if (lineOffset < scopeOffset) {
                    indentInfo = 'dedent';
                }
                return null;
            } else {
                if (scopeOffset > 0) {
                    dedent(stream, state);
                }
            }
        }
        if (stream.eatSpace()) {
            return null;
        } 
		
        // Handle Comments
		if (stream.match(comments)) {
			stream.skipToEnd();
            return 'comment';
		}

        // Handle Strings (disabled for now)
        // if (stream.match(stringPrefixes)) {
            // state.tokenize = tokenStringFactory(stream.current());
            // return state.tokenize(stream, state);
        // }

        // Handle operators and Delimiters
        if (stream.match(tripleDelimiters) || stream.match(doubleDelimiters)) {
            return null;
        }
		if (stream.match(builtins)) {
            return 'builtin';
        }
        if (stream.match(keywords)) {
            return 'keyword';
        }
        if (stream.match(doubleOperators) || stream.match(singleOperators)) { // || stream.match(wordOperators)
            return 'operator';
        }
        if (stream.match(singleDelimiters)) {
            return null;
        }

        if (stream.match(identifiers)) {
            if (state.lastToken == 'def' || state.lastToken == 'class') {
                return 'def';
            }
            //return 'variable';
			return null;
        }

        // Handle non-detected items
        stream.next();
        return null; //could be ERRORCLASS
    }

    function tokenStringFactory(delimiter) {
        while ('rub'.indexOf(delimiter.charAt(0).toLowerCase()) >= 0) {
            delimiter = delimiter.substr(1);
        }
        var singleline = delimiter.length == 1;
        var OUTCLASS = 'string';

/*         function tokenString(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^'"\\]/);
                if (stream.eat('\\')) {
                    stream.next();
                    if (singleline && stream.eol()) {
                        return OUTCLASS;
                    }
                } else if (stream.match(delimiter)) {
                    state.tokenize = tokenBase;
                    return OUTCLASS;
                } else {
                    stream.eat(/['"]/);
                }
            }
            if (singleline) {
                if (parserConf.singleLineStringErrors) {
                    return ERRORCLASS;
                } else {
                    state.tokenize = tokenBase;
                }
            }
            return OUTCLASS;
        } */
        tokenString.isString = true;
        return tokenString;
    }

    function indent(stream, state, type) {
        type = type || 'py';
        var indentUnit = 0;
        if (type === 'py') {
            if (state.scopes[0].type !== 'py') {
                state.scopes[0].offset = stream.indentation();
                return;
            }
            for (var i = 0; i < state.scopes.length; ++i) {
                if (state.scopes[i].type === 'py') {
                    indentUnit = state.scopes[i].offset + conf.indentUnit;
                    break;
                }
            }
        } else {
            indentUnit = stream.column() + stream.current().length;
        }
        state.scopes.unshift({
            offset: indentUnit,
            type: type
        });
    }

     function dedent(stream, state, type) {
        type = type || 'py';
        if (state.scopes.length == 1) return;
        if (state.scopes[0].type === 'py') {
            var _indent = stream.indentation();
            var _indent_index = -1;
            for (var i = 0; i < state.scopes.length; ++i) {
                if (_indent === state.scopes[i].offset) {
                    _indent_index = i;
                    break;
                }
            }
            if (_indent_index === -1) {
                return true;
            }
            while (state.scopes[0].offset !== _indent) {
                state.scopes.shift();
            }
            return false;
        } else {
            if (type === 'py') {
                state.scopes[0].offset = stream.indentation();
                return false;
            } else {
                if (state.scopes[0].type != type) {
                    return true;
                }
                state.scopes.shift();
                return false;
            }
        }
    } 

    function tokenLexer(stream, state) {
        indentInfo = null;
        var style = state.tokenize(stream, state);
        var current = stream.current();

        // Handle decorators
        if ((style === 'variable' || style === 'builtin')
            && state.lastStyle === 'meta') {
            style = 'meta';
        }
		if (current.match(/#/)) {
			var moreHashes = stream.skipTo("#");
			if (!moreHashes) {
				indentInfo = 'indent'; 
			}
		}
        if (current.match(indentCommands)) {// stream.eol() is a crap way of ensuring multiple commands (on one line) only result in a single indent
			if (current.match(/if/)) {
				var isChoice = stream.skipTo("#"); //prevent double indent when using *if with *choice
				if (!isChoice) indentInfo = 'indent';
			} else {
				indentInfo = 'indent';
			}
		}
		if (indentInfo === 'indent') {
			//state.dedent -= 1;
			indent(stream, state);
		}
		else if (current.match(dedentCommands)) {  //stream.eol() see .match(indentCommands)
			state.dedent += 1; //DEDENT
		}
        var delimiter_index = '('.indexOf(current);
        if (delimiter_index !== -1) {
            indent(stream, state, ')'.slice(delimiter_index, delimiter_index+1));
        }
        if (indentInfo === 'dedent') {
            if (dedent(stream, state)) {
                return ERRORCLASS;
            }
        }
        delimiter_index = ')'.indexOf(current);
        if (delimiter_index !== -1) {
            if (dedent(stream, state, current)) {
                return ERRORCLASS;
            }
        }
        if (state.dedent > 0 && stream.eol() && state.scopes[0].type == 'py') {
            if (state.scopes.length > 1) state.scopes.shift();
            state.dedent -= 1;
        }
        return style;
    }

    var external = {
        startState: function(basecolumn) {
            return {
              tokenize: tokenBase,
              scopes: [{offset:basecolumn || 0, type:'py'}],
              lastStyle: null,
              lastToken: null,
              lambda: false,
              dedent: 0
          };
        },

        token: function(stream, state) {
            var style = tokenLexer(stream, state);

            state.lastStyle = style;

            var current = stream.current();
            if (current && style) {
                state.lastToken = current;
            }

            if (stream.eol() && state.lambda) {
                state.lambda = false;
            }
            return style;
        },

        indent: function(state) {
            if (state.tokenize != tokenBase) {
                return state.tokenize.isString ? CodeMirror.Pass : 0;
            }

            return state.scopes[0].offset;
        },

        lineComment: "*comment ",
        fold: "indent"
    };
    return external;
});

CodeMirror.defineMIME("text/x-choicescript", "choicescript");

(function() {
  "use strict";
  var words = function(str){return str.split(' ');};

  CodeMirror.defineMIME("text/x-choice", {
    name: "choicescript",
    extra_keywords: words("")
  });
})();