(function () {
  var KEY = 'grading-in-brightspace-progress';
  var TOTAL = 4;
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  function render() {
    var p = read(), done = 0;
    document.querySelectorAll('[data-lesson-link]').forEach(function (a) {
      var s = p[a.getAttribute('data-lesson-link')];
      if (s === 'done') done += 1;
      a.querySelector('[data-lesson-status]').textContent = s === 'done' ? 'Complete' : 'Not started';
      if (s) a.setAttribute('data-state', s); else a.removeAttribute('data-state');
    });
    var bar = document.getElementById('m-progress');
    bar.value = done; bar.textContent = done + ' of ' + TOTAL;
    document.getElementById('m-progress-text').textContent = done + ' of ' + TOTAL + ' lessons complete';
    document.getElementById('done-text').textContent = done === TOTAL
      ? 'Module complete. You finished all four lessons.'
      : 'Finish the four knowledge checks to complete the module. ' + done + ' of ' + TOTAL + ' done so far.';
  }

  /* Knowledge checks */
  document.querySelectorAll('form.check').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var picked = form.querySelector('input[type=radio]:checked');
      var out = form.querySelector('.feedback');
      if (!picked) { out.removeAttribute('data-state'); out.textContent = 'Choose an answer first.'; return; }
      if (picked.value === form.getAttribute('data-answer')) {
        out.setAttribute('data-state', 'correct'); out.textContent = form.getAttribute('data-right');
        var p = read(); p[form.getAttribute('data-lesson')] = 'done'; write(p); render();
      } else {
        out.setAttribute('data-state', 'incorrect'); out.textContent = form.getAttribute('data-wrong');
      }
    });
  });

  /* Lesson 1: weighted vs points calculator */
  var q = document.getElementById('s-quiz'), a = document.getElementById('s-asg'), x = document.getElementById('s-exam');
  function clamp(el, max) {
    var v = parseFloat(el.value);
    var bad = isNaN(v) || v < 0 || v > max;
    el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    return bad ? null : v;
  }
  function calc() {
    var qv = clamp(q, 10), av = clamp(a, 50), xv = clamp(x, 100);
    var w = document.getElementById('r-weighted'), pt = document.getElementById('r-points'), note = document.getElementById('r-note');
    if (qv === null || av === null || xv === null) {
      w.textContent = '--'; pt.textContent = '--';
      note.textContent = 'Enter a score between 0 and the maximum for each item.';
      return;
    }
    var weighted = (qv / 10) * 20 + (av / 50) * 30 + (xv / 100) * 50;
    var points = (qv + av + xv) / 160 * 100;
    w.textContent = weighted.toFixed(1) + '%';
    pt.textContent = points.toFixed(1) + '%';
    var diff = Math.abs(weighted - points);
    if (diff < 0.05) note.textContent = 'With these scores, both systems give the same grade.';
    else if (points < weighted) note.textContent = 'Under Points, the 100-point exam pulls the grade down more, because it holds most of the points.';
    else note.textContent = 'Under Points, the strong exam result lifts the grade more, because the exam holds most of the points.';
  }
  [q, a, x].forEach(function (el) { el.addEventListener('input', calc); });
  calc();

  /* Lesson 2: ordering */
  var list = document.getElementById('order-list');
  function refreshButtons() {
    var items = list.querySelectorAll('li');
    items.forEach(function (li, i) {
      li.querySelector('[data-move=up]').disabled = i === 0;
      li.querySelector('[data-move=down]').disabled = i === items.length - 1;
    });
  }
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-move]'); if (!btn) return;
    var li = btn.closest('li'), dir = btn.getAttribute('data-move');
    list.querySelectorAll('li').forEach(function (n) { n.removeAttribute('data-state'); });
    document.getElementById('order-feedback').textContent = '';
    if (dir === 'up' && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
    if (dir === 'down' && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
    refreshButtons();
    var same = li.querySelector('[data-move="' + dir + '"]');
    (same.disabled ? li.querySelector('[data-move]:not(:disabled)') : same).focus();
  });
  refreshButtons();
  document.getElementById('order-check').addEventListener('click', function () {
    var right = 0, items = list.querySelectorAll('li');
    items.forEach(function (li, i) {
      var ok = li.getAttribute('data-step') === String(i + 1);
      li.setAttribute('data-state', ok ? 'right' : 'wrong');
      if (ok) right += 1;
    });
    document.getElementById('order-feedback').textContent = right === items.length
      ? 'All six steps are in the right order.'
      : right + ' of ' + items.length + ' steps are in the right place. Steps with a red border need to move.';
  });

  /* Lesson 3: matching */
  document.getElementById('match-check').addEventListener('click', function () {
    var rows = document.querySelectorAll('.match-row'), right = 0, blank = 0;
    rows.forEach(function (row) {
      var v = row.querySelector('select').value, out = row.querySelector('.match-result');
      if (!v) { blank += 1; out.removeAttribute('data-state'); out.textContent = 'Not answered'; return; }
      var ok = v === row.getAttribute('data-answer');
      if (ok) right += 1;
      out.setAttribute('data-state', ok ? 'right' : 'wrong');
      out.textContent = ok ? 'Correct' : 'Not quite';
    });
    document.getElementById('match-feedback').textContent = right === rows.length
      ? 'All five are correct.'
      : right + ' of ' + rows.length + ' correct' + (blank ? ', ' + blank + ' not answered.' : '. Change the ones marked Not quite and check again.');
  });
  document.querySelectorAll('.match-row select').forEach(function (s) {
    s.addEventListener('change', function () { var o = s.closest('.match-row').querySelector('.match-result'); o.textContent = ''; o.removeAttribute('data-state'); });
  });

  document.getElementById('m-reset').addEventListener('click', function () {
    write({}); render();
    document.getElementById('m-note').textContent = 'Progress reset. It is saved in this browser only.';
  });
  render();
})();
