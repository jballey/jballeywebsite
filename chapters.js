/* Chapters on phones: a tab on the right edge opens the chapter list in a side panel.
   On wider screens the list sits in the left column and the tab stays hidden. */
(function () {
  var toc = document.querySelector('.g12 > aside .toc');
  if (!toc || typeof HTMLDialogElement === 'undefined') { return; }
  var aside = toc.parentElement;

  var tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'toc-tab';
  tab.textContent = 'Chapters';
  tab.setAttribute('aria-haspopup', 'dialog');
  tab.hidden = true;

  var drawer = document.createElement('dialog');
  drawer.className = 'toc-drawer';
  drawer.setAttribute('aria-labelledby', 'toc-drawer-h');
  drawer.innerHTML = '<div class="toc-drawer-head"><h2 id="toc-drawer-h">Chapters</h2>' +
    '<button type="button" class="btn btn-secondary btn-sm">Close</button></div>';
  var list = document.createElement('nav');
  list.className = 'toc';
  list.setAttribute('aria-label', 'Chapters');
  list.appendChild(toc.querySelector('ol').cloneNode(true));
  drawer.appendChild(list);

  document.body.appendChild(tab);
  document.body.appendChild(drawer);

  tab.addEventListener('click', function () { drawer.showModal(); });
  drawer.querySelector('.toc-drawer-head button').addEventListener('click', function () { drawer.close(); });
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer) { drawer.close(); }          /* tap on the dimmed page */
    if (e.target.closest('a')) { drawer.close(); }         /* chapter chosen: close, then jump */
  });

  function sync() {
    var phone = getComputedStyle(aside).display === 'none';
    tab.hidden = !phone;
    if (!phone && drawer.open) { drawer.close(); }
  }
  sync();
  window.addEventListener('resize', sync);

  /* Mark the chapter being read in both lists */
  var links = document.querySelectorAll('.toc a[href^="#"]');
  var chapters = Array.prototype.map.call(toc.querySelectorAll('a[href^="#"]'), function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  }).filter(Boolean);
  function mark() {
    var current = chapters[0];
    chapters.forEach(function (c) { if (c.getBoundingClientRect().top <= window.innerHeight * 0.35) { current = c; } });
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + current.id) { a.setAttribute('aria-current', 'location'); }
      else { a.removeAttribute('aria-current'); }
    });
  }
  if (chapters.length) {
    mark();
    window.addEventListener('scroll', mark, { passive: true });
  }
})();
