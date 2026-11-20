(function () {
  var rows = document.querySelectorAll("[data-github-repo]");
  var cacheAge = 60 * 60 * 1000;

  rows.forEach(function (row) {
    var repo = row.getAttribute("data-github-repo");
    var key = "last-updated:" + repo;

    function show(date) {
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(date) || !Number.isFinite(Date.parse(date))) return false;
      var time = row.querySelector("time");
      time.dateTime = date;
      time.textContent = date.slice(2, 10).replace(/-/g, "");
      row.hidden = false;
      return true;
    }

    try {
      var cached = JSON.parse(sessionStorage.getItem(key));
      if (cached && Date.now() - cached.savedAt < cacheAge && Date.now() >= cached.savedAt) {
        if (show(cached.date)) return;
      }
    } catch (_) { /* Storage may be unavailable. */ }

    fetch("https://api.github.com/repos/" + repo + "/commits?per_page=1", {
      headers: { Accept: "application/vnd.github+json" },
      referrerPolicy: "no-referrer"
    }).then(function (response) {
      if (!response.ok) throw new Error("GitHub request failed");
      return response.json();
    }).then(function (commits) {
      var date = commits[0] && commits[0].commit && commits[0].commit.committer && commits[0].commit.committer.date;
      show(date);
      if (!row.hidden) {
        try { sessionStorage.setItem(key, JSON.stringify({ date: date, savedAt: Date.now() })); } catch (_) { /* Storage may be unavailable. */ }
      }
    }).catch(function () { /* Leave the date hidden when it cannot be retrieved. */ });
  });
})();
