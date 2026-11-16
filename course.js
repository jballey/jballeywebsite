(function () {
  /* Every module opens at the top, wherever the learner was on the last page. */
  if (document.querySelector('[data-current-module]')) {
    if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
    var toTop = function () {
      if (location.hash) { return; }
      window.scrollTo(0, 0);
      var top = document.querySelector('.site');
      if (top && top.scrollIntoView) { top.scrollIntoView({ block: 'start' }); }
    };
    toTop();
    window.addEventListener('pageshow', toTop);
  }
  var KEY = 'accessible-learning-basics-progress';
  var TOTAL = 6;
  var LABEL = { done: 'Complete', started: 'In progress' };
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  /* Course home */
  var tiles = document.querySelectorAll('[data-module]');
  function renderHome() {
    var p = read(), done = 0, next = null;
    tiles.forEach(function (t) {
      var n = t.getAttribute('data-module'), s = p[n];
      if (s === 'done') done += 1; else if (next === null) next = n;
      t.querySelector('[data-status]').textContent = LABEL[s] || 'Not started';
    });
    var bar = document.getElementById('progress-bar');
    bar.value = done;
    bar.textContent = done + ' of ' + TOTAL;
    document.getElementById('progress-text').textContent = done + ' of ' + TOTAL + ' modules complete';
    var resume = document.getElementById('resume');
    var heading = document.getElementById('welcome-h');
    var text = document.getElementById('welcome-text');
    if (next === null) {
      heading.textContent = 'Course Complete';
      text.textContent = 'You have finished all six modules. You can reopen any module below.';
      resume.textContent = 'Review module 1';
      resume.href = 'course-module-1.html';
    } else if (done > 0 || p[next] === 'started') {
      heading.textContent = 'Welcome Back';
      text.textContent = 'You are on module ' + next + ' of ' + TOTAL + '. Each module takes 15 to 20 minutes.';
      resume.textContent = 'Continue module ' + next;
      resume.href = 'course-module-' + next + '.html';
    } else {
      heading.textContent = 'Welcome';
      text.textContent = 'Six short modules on building training that everyone can use. Each one takes 15 to 20 minutes and ends with a short check.';
      resume.textContent = 'Start module 1';
      resume.href = 'course-module-1.html';
    }
  }
  if (tiles.length) {
    renderHome();
    document.getElementById('reset').addEventListener('click', function () {
      write({});
      renderHome();
      document.getElementById('progress-note').textContent = 'Progress reset. It is saved in this browser only.';
    });
  }

  /* Module page */
  var lesson = document.querySelector('[data-current-module]');
  if (lesson) {
    var mod = lesson.getAttribute('data-current-module');
    var p = read();
    if (p[mod] !== 'done') { p[mod] = 'started'; write(p); }
    document.querySelectorAll('[data-modlink]').forEach(function (a) {
      var s = p[a.getAttribute('data-modlink')];
      a.querySelector('[data-status]').textContent = LABEL[s] || 'Not started';
      if (s) a.setAttribute('data-state', s);
    });
    document.getElementById('complete').addEventListener('click', function () {
      var q = read(); q[mod] = 'done'; write(q);
    });
    var form = document.querySelector('.check');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var picked = form.querySelector('input[name="check"]:checked');
      var out = form.querySelector('.feedback');
      if (!picked) {
        out.removeAttribute('data-state');
        out.textContent = 'Choose an answer first.';
      } else if (picked.value === form.getAttribute('data-answer')) {
        out.setAttribute('data-state', 'correct');
        out.textContent = form.getAttribute('data-right');
      } else {
        out.setAttribute('data-state', 'incorrect');
        out.textContent = form.getAttribute('data-wrong');
      }
    });
  }
})();
