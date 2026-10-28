(function () {
  var bar = document.querySelector(".filters");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".project"));
  var shown = document.querySelector(".shown");
  if (!bar || !rows.length || !shown) return;

  var template = shown.getAttribute("data-template") || "{n}";
  var buttons = Array.prototype.slice.call(bar.querySelectorAll("button"));

  function apply(category) {
    var n = 0;
    rows.forEach(function (row) {
      var match = category === "all" || row.getAttribute("data-category") === category;
      row.hidden = !match;
      if (match) n += 1;
    });
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === category));
    });
    shown.textContent = category === "all" ? "" : template.replace("{n}", String(n));
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      apply(button.getAttribute("data-filter"));
    });
  });

  bar.hidden = false;
  apply("all");
})();
