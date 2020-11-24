$(document).ready(function () {
  $(".buttonicon-emb-mathjax").click(function () {
    // Not clicking on an existing latex so no lineNumber
    clientVars.plugins.plugins.ep_mathjax.lineNumber = false;

    // bit of a hacky way but works fine
    var module = $("#mathjaxModal");
    if (module.hasClass("popup-show")) {
      $("#mathjaxModal").removeClass("popup-show").css("display", "none");
    } else {
      $("#mathjaxModal").addClass("popup-show").css("display", "block");
      $("#mathjaxSrc").val(""); // clear input
      redraw();
    }
  });

  $("#mathjaxSrc").on("change keyup paste", function () {
    redraw();
  });

  $("#mathsymbols").on("change", function () {
    var val = $(this).val();
    var title = $(this).find("option:selected").attr("title");
    $("#mathjaxSrc").val($("#mathjaxSrc").val() + title);
    $("#mathjaxSrc").change();
  });

  $("#greeksymbols").on("change", function () {
    var val = $(this).val();
    var title = $(this).find("option:selected").attr("title");
    $("#mathjaxSrc").val($("#mathjaxSrc").val() + title);
    $("#mathjaxSrc").change();
  });

  $("#cancelMathjax").click(function () {
    $("#mathjaxModal").removeClass("popup-show").css("display", "none");
  });
});

function redraw() {
  var val = $("#mathjaxSrc").val();
  var latex = val
    .replace(/\s/g, "&space;")
    .replace(/\+/g, "&plus;")
    .replace(/#/g, "&hash;");
  url = window.location.protocol + "//latex.codecogs.com/gif.latex?" + latex;
  $("#mathjaxPreviewImg").attr("src", url);
}
