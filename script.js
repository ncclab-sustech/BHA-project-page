(function () {
  if (window.BHA_I18N) {
    BHA_I18N.init();
  }

  var navLinks = document.querySelectorAll(".site-nav__links a[href^='#']");
  var sections = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: a });
  });

  if (!sections.length || !("IntersectionObserver" in window)) return;

  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (l) {
          l.removeAttribute("aria-current");
          if (l.getAttribute("href") === "#" + id) l.setAttribute("aria-current", "page");
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach(function (s) {
    obs.observe(s.el);
  });
})();
