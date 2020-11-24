var underscore = require("ep_etherpad-lite/static/js/underscore");
var padeditor = require("ep_etherpad-lite/static/js/pad_editor").padeditor;
var padEditor;

// Bind contexts
exports.aceInitialized = function (hook, context) {
  var editorInfo = context.editorInfo;
  editorInfo.ace_editMathjax = underscore(exports.editMathjax).bind(context);
  editorInfo.ace_setMathjax = underscore(exports.setMathjax).bind(context);
  editorInfo.ace_setRawMathjax = underscore(exports.setRawMathjax).bind(
    context
  );

  padEditor = context.editorInfo.editor;
};

// CSS styling of editor
exports.aceInitInnerdocbodyHead = function (hook_name, args, cb) {
  args.iframeHTML.push(
    '<link rel="stylesheet" type="text/css" href="../static/plugins/ep_mathjax/static/css/ace.css"/>'
  );
  return cb();
};

exports.aceAttribsToClasses = function (hook_name, args, cb) {
  if (args.key == "rawmathjax" && args.value != "")
    return cb(["rawmathjax:" + args.value]);
  if (args.key == "mathjax" && args.value != "")
    return cb(["mathjax:" + args.value]);
};

exports.aceCreateDomLine = function (hook_name, args, cb) {
  if (args.cls.indexOf("rawmathjax:") >= 0) {
    console.log("aceCreateDomLine", args);

    var clss = [];
    var argClss = args.cls.split(" ");
    var value;

    for (var i = 0; i < argClss.length; i++) {
      var cls = argClss[i];
      if (cls.indexOf("mathjax:") != -1) {
        value = cls.substr(cls.indexOf(":") + 1);
      } else {
        clss.push(cls);
      }
    }

    console.log("aceCreateDomLine:RAW", clss);

    // var img =
    //   window.location.protocol +
    //   "//latex.codecogs.com/gif.latex?" +
    //   unescape(value);
    return cb([
      {
        cls: clss.join(" "),
        extraOpenTags:
          "<span class='mathjaxcontainer " +
          value +
          "'><span class='mathjax'>" +
          // "<img src='" +
          // img +
          // "'>" +
          value
            .replace(/\&space;/g, " ")
            .replace(/\&plus;/g, "+")
            .replace(/\&hash;/g, "#")
            .replace(/\@plus;/g, "+")
            .replace(/\@hash;/g, "#") +
          "</span><span class='character'>",
        extraCloseTags: "</span></span>",
      },
    ]);
  } else if (args.cls.indexOf("mathjax:") >= 0) {
    console.log("aceCreateDomLine", args);

    var clss = [];
    var argClss = args.cls.split(" ");
    var value;

    for (var i = 0; i < argClss.length; i++) {
      var cls = argClss[i];
      if (cls.indexOf("mathjax:") != -1) {
        value = cls.substr(cls.indexOf(":") + 1);
      } else {
        clss.push(cls);
      }
    }

    console.log("aceCreateDomLine:LATEX", clss);

    var img =
      window.location.protocol +
      "//latex.codecogs.com/gif.latex?" +
      unescape(value);
    return cb([
      {
        cls: clss.join(" "),
        extraOpenTags:
          "<span class='mathjaxcontainer " +
          value +
          "'><span class='mathjax'>" +
          "<img src='" +
          img +
          "'>" +
          // value +
          "</span><span class='character'>",
        extraCloseTags: "</span></span>",
      },
    ]);
  }
  return cb();
};

// Listen for click events
exports.postAceInit = function (hook_name, context) {
  // Listen for click events of latex images
  context.ace.callWithAce(
    function (ace) {
      var doc = ace.ace_getDocument();
      var $inner = $(doc).find("#innerdocbody");
      $inner.on(
        "click",
        ".mathjax",
        underscore(exports.editMathjaxClick).bind(ace)
      );
    },
    "mathjax",
    true
  );

  $("#doRawMathjax").click(function () {
    context.ace.callWithAce(
      function (ace) {
        // call the function to apply the attribute inside ACE
        ace.ace_setRawMathjax();
      },
      "rawmathjax",
      true
    ); // TODO what's the second attribute do here?
    padeditor.ace.focus();
  });

  // When we write mathjax to the page give it context so it knows line number
  $("#doMathjax").click(function () {
    context.ace.callWithAce(
      function (ace) {
        // call the function to apply the attribute inside ACE
        ace.ace_setMathjax();
      },
      "mathjax",
      true
    ); // TODO what's the second attribute do here?
    padeditor.ace.focus();
  });
};

// Edit Mathjax -- Get the latex on a line and set the edit box with this value
exports.editMathjax = function () {
  var lineNumber = clientVars.plugins.plugins.ep_mathjax.lineNumber;
  var latex = this.documentAttributeManager.getAttributeOnLine(
    lineNumber,
    "mathjax"
  );

  console.log("editMathjax", latex);
  // console.log(rawlatex);

  latex = unescape(
    latex
      .replace(/\&space;/g, " ")
      .replace(/\&plus;/g, "+")
      .replace(/\&hash;/g, "#")
      .replace(/\@plus;/g, "+")
      .replace(/\@hash;/g, "#")
  );
  $("#mathjaxModal").addClass("popup-show").css("display", "block");
  $("#mathjaxSrc").val(latex);
  $("#mathjaxSrc").change();
};

// Edit click event handle context
exports.editMathjaxClick = function (event) {
  var target = event.target;
  var parent = $(target).closest("div");

  var lineNumber = parent.prevAll().length;
  clientVars.plugins.plugins.ep_mathjax.lineNumber = lineNumber;
  padEditor.callWithAce(
    function (ace) {
      // call the function to apply the attribute inside ACE
      ace.ace_editMathjax();
    },
    "tasklist",
    true
  ); // TODO what's the second attribute do here?
};

// Set Mathjax
exports.setMathjax = function () {
  var ace = this;
  var rep = this.rep;
  var lineNumber = clientVars.plugins.plugins.ep_mathjax.lineNumber;

  // console.log(rep);

  if (!lineNumber) {
    lineNumber = rep.selStart[0];
  }
  $("#mathjaxModal").removeClass("popup-show").css("display", "none");

  var val = $("#mathjaxSrc").val();
  var latex = val
    .replace(/\s/g, "&space;")
    .replace(/\+/g, "&plus;")
    .replace(/#/g, "&hash;");

  var documentAttributeManager = this.documentAttributeManager;
  documentAttributeManager.setAttributeOnLine(lineNumber, "mathjax", latex); // make the line a task list
};

// Set Mathjax
exports.setRawMathjax = function () {
  var ace = this;
  var rep = this.rep;
  var lineNumber = clientVars.plugins.plugins.ep_mathjax.lineNumber;

  // console.log(rep);

  if (!lineNumber) {
    lineNumber = rep.selStart[0];
  }
  $("#mathjaxModal").removeClass("popup-show").css("display", "none");

  var val = $("#mathjaxSrc").val();
  var latex = val
    .replace(/\s/g, "&space;")
    .replace(/\+/g, "&plus;")
    .replace(/#/g, "&hash;");

  var documentAttributeManager = this.documentAttributeManager;
  documentAttributeManager.setAttributeOnLine(lineNumber, "rawmathjax", latex); // make the line a task list
};
