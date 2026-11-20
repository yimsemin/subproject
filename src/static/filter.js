(function () {
  var bar = document.querySelector(".filters");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".project"));
  if (!bar || !rows.length) return;

  var buttons = Array.prototype.slice.call(bar.querySelectorAll("button"));

  function apply(filter) {
    rows.forEach(function (row) {
      var match = filter === "all" || (filter === "archived"
        ? row.getAttribute("data-archived") === "true"
        : row.getAttribute("data-category") === filter);
      row.hidden = !match;
    });
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === filter));
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      apply(button.getAttribute("data-filter"));
    });
  });

  bar.hidden = false;
  apply("all");
})();
