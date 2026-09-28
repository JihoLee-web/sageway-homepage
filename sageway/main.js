/* SAGEWAY — main.js
   테마 · 헤더 스크롤 상태 · 현재 섹션 · 목차 dialog · 탭 · 브릿지 로드 애니메이션
   · 사양서 호버 하이라이트 · 폼 검증/접수증 · 복사
   모든 콘텐츠는 JS 없이도 완성 상태로 렌더링됩니다. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var darkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- 테마 ---------- */
  function currentTheme() {
    var t = html.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return darkScheme.matches ? 'dark' : 'light';
  }
  function renderThemeSwitches() {
    var cur = currentTheme();
    var buttons = document.querySelectorAll('[data-theme-set]');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.setAttribute('aria-pressed', b.getAttribute('data-theme-set') === cur ? 'true' : 'false');
    }
  }
  function setTheme(value) {
    html.classList.add('theme-transition');
    html.setAttribute('data-theme', value);
    try { localStorage.setItem('sw-theme', value); } catch (e) { /* 저장 불가 환경 */ }
    renderThemeSwitches();
    window.setTimeout(function () { html.classList.remove('theme-transition'); }, 300);
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-set]');
    if (!btn) return;
    setTheme(btn.getAttribute('data-theme-set'));
  });
  if (darkScheme.addEventListener) darkScheme.addEventListener('change', renderThemeSwitches);
  else if (darkScheme.addListener) darkScheme.addListener(renderThemeSwitches);
  renderThemeSwitches();

  /* ---------- 헤더 스크롤 상태 ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 현재 섹션 (헤더 라벨 + 내비 aria-current) ---------- */
  var sectionLabel = document.querySelector('[data-current-section]');
  var navLinks = document.querySelectorAll('.site-nav a');
  var sections = document.querySelectorAll('main [data-section-title]');
  function setCurrent(section) {
    var id = section.id;
    var title = section.getAttribute('data-section-title') || '';
    if (sectionLabel) sectionLabel.textContent = (id === 'hero') ? '' : title;
    for (var i = 0; i < navLinks.length; i++) {
      var a = navLinks[i];
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  }
  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) setCurrent(entries[i].target);
      }
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    for (var s = 0; s < sections.length; s++) io.observe(sections[s]);
  }

  /* ---------- 목차 dialog ---------- */
  var toc = document.getElementById('toc');
  var tocOpen = document.querySelector('.toc-open');
  if (toc && tocOpen) {
    tocOpen.addEventListener('click', function () {
      if (typeof toc.showModal === 'function') toc.showModal();
      else toc.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    });
    function closeToc() {
      if (toc.open) toc.close();
      document.body.style.overflow = '';
    }
    toc.addEventListener('close', function () { document.body.style.overflow = ''; });
    toc.addEventListener('click', function (e) {
      if (e.target.closest('[data-toc-close]')) { closeToc(); return; }
      if (e.target.closest('[data-toc-link]')) { closeToc(); return; }
      if (e.target === toc) closeToc(); /* 배경 클릭 */
    });
  }

  /* ---------- 탭 (국내/해외) ---------- */
  var tabsRoot = document.querySelector('[data-tabs]');
  if (tabsRoot) {
    var tabs = tabsRoot.querySelectorAll('[role="tab"]');
    function activateTab(tab) {
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (panel) {
          panel.classList.toggle('is-hidden', !on);
          if (on) { panel.removeAttribute('inert'); panel.removeAttribute('aria-hidden'); }
          else { panel.setAttribute('inert', ''); panel.setAttribute('aria-hidden', 'true'); }
        }
      }
    }
    for (var ti = 0; ti < tabs.length; ti++) {
      tabs[ti].addEventListener('click', function () { activateTab(this); });
      tabs[ti].addEventListener('keydown', function (e) {
        var idx = Array.prototype.indexOf.call(tabs, this);
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); activateTab(next); next.focus(); }
      });
    }
    /* 정적 HTML은 JS 없이도 두 패널을 모두 보여 주므로, 초기 탭 상태는 여기서 적용합니다. */
    activateTab(tabs[0]);
  }

  /* ---------- 브릿지 로드 애니메이션 (완성 상태가 기본) ---------- */
  var bridgeTable = document.getElementById('bridge-table');
  var tableFrame = bridgeTable ? bridgeTable.closest('.table-frame') : null;
  function applyMotionPreference() {
    if (reduceMotion.matches) {
      html.classList.remove('js-anim');
    }
  }
  if (!reduceMotion.matches && bridgeTable) {
    html.classList.add('js-anim');
    var markVerified = function () {
      bridgeTable.classList.add('is-verified');
      if (tableFrame) tableFrame.classList.add('is-verified');
    };
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(markVerified);
    });
    /* 백그라운드 탭에서는 rAF가 멈추므로 시간 기반 폴백으로도 완성 상태를 보장합니다. */
    window.setTimeout(markVerified, 1200);
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', applyMotionPreference);
  else if (reduceMotion.addListener) reduceMotion.addListener(applyMotionPreference);

  /* ---------- 사양서 ↔ 도면 하이라이트 (장식) ---------- */
  var specSheet = document.getElementById('spec-sheet');
  var tumbler = document.getElementById('tumbler-svg');
  if (specSheet && tumbler) {
    var rows = specSheet.querySelectorAll('tr[data-part]');
    function setHot(part, on) {
      part.split(' ').forEach(function (p) {
        var g = tumbler.querySelector('#part-' + p);
        if (g) g.classList.toggle('is-hot', on);
      });
    }
    for (var r = 0; r < rows.length; r++) {
      (function (row) {
        var part = row.getAttribute('data-part');
        row.addEventListener('mouseenter', function () { setHot(part, true); });
        row.addEventListener('mouseleave', function () { setHot(part, false); });
      })(rows[r]);
    }
  }

  /* ---------- 가로 스크롤 표시 (넘칠 때만 힌트 · 페이드) ---------- */
  var scrollers = document.querySelectorAll('.scroll-x');
  function updateScrollers() {
    for (var i = 0; i < scrollers.length; i++) {
      var el = scrollers[i];
      el.classList.toggle('is-scrollable', el.scrollWidth > el.clientWidth + 1);
      el.classList.toggle('is-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    }
  }
  for (var si = 0; si < scrollers.length; si++) {
    scrollers[si].addEventListener('scroll', updateScrollers, { passive: true });
  }
  window.addEventListener('resize', updateScrollers);
  window.addEventListener('load', updateScrollers);
  updateScrollers();

  /* ---------- 복사 버튼 ---------- */
  var copyLive = document.getElementById('copy-live');
  function selectText(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* 선택 불가 */ }
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var target = document.querySelector(btn.getAttribute('data-copy'));
    if (!target) return;
    var text = (target.textContent || '').trim();
    var done = function () {
      var original = btn.textContent;
      btn.textContent = '복사됨';
      if (copyLive) copyLive.textContent = text + ' 복사됨';
      window.setTimeout(function () { btn.textContent = original; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () { selectText(target); });
    } else {
      selectText(target);
      try { if (document.execCommand && document.execCommand('copy')) done(); } catch (err) { /* 폴백: 선택 상태 유지 */ }
    }
  });

  /* ---------- 문의 폼 ---------- */
  var form = document.getElementById('inquiry');
  var receipt = document.getElementById('receipt');
  if (form && receipt) {
    var summary = document.getElementById('form-summary');

    function showError(fieldEl, errId, on) {
      var err = document.getElementById(errId);
      if (err) err.hidden = !on;
      if (fieldEl) {
        if (fieldEl.tagName === 'INPUT' || fieldEl.tagName === 'TEXTAREA') {
          if (on) fieldEl.setAttribute('aria-invalid', 'true');
          else fieldEl.removeAttribute('aria-invalid');
        } else {
          fieldEl.classList.toggle('is-error', on);
        }
      }
    }

    function setGroupInvalid(on) {
      var boxes = form.querySelectorAll('input[name="service"]');
      for (var i = 0; i < boxes.length; i++) {
        if (on) boxes[i].setAttribute('aria-invalid', 'true');
        else boxes[i].removeAttribute('aria-invalid');
      }
    }

    function validate() {
      var errors = [];
      var services = form.querySelectorAll('input[name="service"]:checked');
      var fieldService = document.getElementById('field-service');
      var svcBad = services.length === 0;
      showError(fieldService, 'err-service', svcBad);
      setGroupInvalid(svcBad);
      if (svcBad) errors.push(form.querySelector('input[name="service"]'));

      var company = form.company; var companyBad = !company.value.trim();
      showError(company, 'err-company', companyBad); if (companyBad) errors.push(company);

      var person = form.person; var personBad = !person.value.trim();
      showError(person, 'err-person', personBad); if (personBad) errors.push(person);

      var email = form.email; var emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      showError(email, 'err-email', emailBad); if (emailBad) errors.push(email);

      var tel = form.tel; var telDigits = tel.value.replace(/[^0-9]/g, '');
      var telBad = !/^[0-9\-\s+()]+$/.test(tel.value.trim()) || telDigits.length < 9;
      showError(tel, 'err-tel', telBad); if (telBad) errors.push(tel);

      var message = form.message; var messageBad = !message.value.trim();
      showError(message, 'err-message', messageBad); if (messageBad) errors.push(message);

      var consent = form.consent; var consentBad = !consent.checked;
      showError(consent, 'err-consent', consentBad); consent.closest('.field').classList.toggle('is-error', consentBad);
      if (consentBad) errors.push(consent);

      return errors;
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function nowStamp() {
      var d = new Date();
      return {
        num: 'SW-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-001',
        at: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
      };
    }

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    function kvRow(k, v, mono) {
      var row = el('div');
      row.appendChild(el('dt', null, k));
      row.appendChild(el('dd', mono ? 'mono' : null, v));
      return row;
    }

    function renderReceipt(data) {
      var stamp = nowStamp();
      receipt.innerHTML = '';
      receipt.appendChild(el('div', 'receipt__head', 'SAGEWAY 접수증'));
      var title = el('h3', 'receipt__title', '접수 완료');
      title.setAttribute('tabindex', '-1');
      receipt.appendChild(title);

      var dl = el('dl', 'kv-leader');
      dl.appendChild(kvRow('접수번호', stamp.num, true));
      dl.appendChild(kvRow('접수 일시', stamp.at, true));
      dl.appendChild(kvRow('관심 서비스', data.services.join(', ')));
      dl.appendChild(kvRow('회사명', data.company));
      dl.appendChild(kvRow('담당자', data.person));
      dl.appendChild(kvRow('회신 예정', '영업일 기준 1일 안에 입력하신 이메일(' + data.email + ')로 회신드립니다.'));
      receipt.appendChild(dl);

      var check = el('p', 'receipt__check');
      var mini = el('span', 'bridge-mini'); mini.setAttribute('aria-hidden', 'true');
      check.appendChild(mini);
      check.appendChild(document.createTextNode('접수 ✓'));
      receipt.appendChild(check);

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'stamp stamp--receipt');
      svg.setAttribute('viewBox', '0 0 120 120');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML =
        '<circle cx="60" cy="60" r="56" class="stamp__ring-outer"/>' +
        '<circle cx="60" cy="60" r="47" class="stamp__ring-inner"/>' +
        '<defs><path id="ring-receipt" d="M60,60 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"/></defs>' +
        '<text class="stamp__ringtext"><textPath href="#ring-receipt">SAGEWAY · RECEIVED · SAGEWAY · RECEIVED</textPath></text>' +
        '<text class="stamp__core" x="60" y="67" text-anchor="middle">접수</text>';
      receipt.appendChild(svg);

      var note = el('p', 'receipt__note', '이 페이지는 데모이며 실제 전송은 도입 시 연결됩니다. ');
      var reset = el('button', 'text-link', '다시 작성');
      reset.type = 'button';
      reset.id = 'receipt-reset';
      note.appendChild(reset);
      receipt.appendChild(note);

      form.hidden = true;
      form.setAttribute('aria-hidden', 'true');
      receipt.hidden = false;
      receipt.classList.remove('is-in');
      void receipt.offsetWidth;
      receipt.classList.add('is-in');
      title.focus();

      reset.addEventListener('click', function () {
        receipt.hidden = true;
        receipt.classList.remove('is-in');
        form.hidden = false;
        form.removeAttribute('aria-hidden');
        form.reset();
        if (summary) summary.textContent = '';
        var invalid = form.querySelectorAll('[aria-invalid], .is-error, .field__error');
        for (var i = 0; i < invalid.length; i++) {
          invalid[i].removeAttribute('aria-invalid');
          invalid[i].classList.remove('is-error');
          if (invalid[i].classList.contains('field__error')) invalid[i].hidden = true;
        }
        form.company.focus();
      });
    }

    /* JS가 있으면 자체 검증을 쓰고, 없으면 브라우저 기본 required 검증이 동작합니다. */
    form.noValidate = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = validate();
      if (errors.length) {
        if (summary) summary.textContent = '입력 내용을 확인해 주세요. (' + errors.length + '곳)';
        errors[0].focus();
        return;
      }
      if (summary) summary.textContent = '';
      var services = [];
      var checked = form.querySelectorAll('input[name="service"]:checked');
      for (var i = 0; i < checked.length; i++) services.push(checked[i].value);
      renderReceipt({
        services: services,
        company: form.company.value.trim(),
        person: form.person.value.trim(),
        email: form.email.value.trim()
      });
    });

    /* 입력 중 오류 해제 */
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (t.getAttribute && t.getAttribute('aria-invalid') === 'true') {
        var errId = t.getAttribute('aria-describedby');
        showError(t, errId, false);
      }
    });
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'service' && form.querySelectorAll('input[name="service"]:checked').length) {
        showError(document.getElementById('field-service'), 'err-service', false);
        setGroupInvalid(false);
      }
      if (t.name === 'consent' && t.checked) {
        showError(t, 'err-consent', false); t.closest('.field').classList.remove('is-error');
      }
    });
  }
})();
