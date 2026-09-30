/* SAGEWAY — main.js
   테마 토글 · 모바일 메뉴 · 이메일 복사
   모든 콘텐츠는 JS 없이도 완성 상태로 보입니다. 여기 있는 것은 편의 기능뿐입니다. */
(function () {
  'use strict';

  var html = document.documentElement;
  var darkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------- 테마 토글 (localStorage: sw-theme) ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function isDark() {
    var t = html.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return darkScheme.matches;
  }
  /* 버튼 라벨은 '다음 동작'을 말합니다: 어두우면 '밝게', 밝으면 '어둡게'. (눌림 상태 속성은 쓰지 않습니다.) */
  /* 수동 테마 전환 시 브라우저 크롬 색(theme-color)도 지면 색에 맞춥니다.
     media 속성이 있는 두 태그는 JS 없는 환경의 기본값으로 그대로 둡니다. */
  function syncThemeColor() {
    var paper = getComputedStyle(html).getPropertyValue('--paper').trim();
    if (!paper) return;
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', paper);
  }
  function renderTheme() {
    themeBtn.textContent = isDark() ? '밝게' : '어둡게';
    syncThemeColor();
  }
  if (themeBtn) {
    themeBtn.hidden = false;
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('sw-theme', next); } catch (e) { /* 저장 불가 환경 */ }
      renderTheme();
    });
    if (darkScheme.addEventListener) darkScheme.addEventListener('change', renderTheme);
    renderTheme();
  }

  /* ---------- 모바일 메뉴 ---------- */
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    /* 이 스크립트가 실제로 실행됐을 때만 내비를 패널로 숨깁니다(로드 실패 시에는 펼쳐진 상태 유지). */
    html.classList.add('js-nav');
    menuBtn.hidden = false;
    var isOpen = function () { return nav.classList.contains('is-open'); };
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    /* 데스크톱 폭으로 넘어가면(태블릿 회전 등) 열린 패널 상태를 정리합니다. */
    var wide = window.matchMedia('(min-width: 900px)');
    var onWide = function (e) { if (e.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);
    menuBtn.addEventListener('click', function () {
      setOpen(!isOpen());
    });
    /* 링크를 누르면 닫습니다(테마 버튼은 패널 안에 있으므로 열린 채 둡니다). */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    /* 패널 바깥을 누르면 닫습니다. */
    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        menuBtn.focus();
      }
    });
    /* 포커스가 패널과 버튼 밖으로 나가면 닫습니다(키보드 사용자용 '바깥 누름'과 같은 역할).
       relatedTarget이 없는 경우(패널 안 클릭, 창 전환 등)는 무시합니다. */
    var closeIfFocusLeft = function (e) {
      var to = e.relatedTarget;
      if (isOpen() && to && !nav.contains(to) && to !== menuBtn) setOpen(false);
    };
    nav.addEventListener('focusout', closeIfFocusLeft);
    menuBtn.addEventListener('focusout', closeIfFocusLeft);
  }

  /* ---------- 이메일 복사 ---------- */
  var copyBtn = document.querySelector('.copy-btn');
  var copyLive = document.getElementById('copy-live');
  if (copyBtn) {
    var target = document.querySelector(copyBtn.getAttribute('data-copy'));
    var selectText = function (el) {
      try {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) { /* 선택 불가 */ }
    };
    if (target) {
      copyBtn.hidden = false;
      copyBtn.addEventListener('click', function () {
        var text = (target.textContent || '').trim();
        var done = function () {
          copyBtn.textContent = '복사됨';
          /* 같은 문구를 다시 넣어도 다시 읽히도록 비운 뒤 채웁니다. */
          if (copyLive) { copyLive.textContent = ''; window.setTimeout(function () { copyLive.textContent = text + ' 복사됨'; }, 50); }
          window.setTimeout(function () { copyBtn.textContent = '복사'; }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            /* 권한 거부 등으로 실패하면 선택 후 execCommand 폴백을 시도합니다(안전하지 않은 컨텍스트와 동일한 경로). */
            selectText(target);
            try { if (document.execCommand && document.execCommand('copy')) done(); } catch (err) { /* 폴백: 선택 상태 유지 */ }
          });
        } else {
          selectText(target);
          try { if (document.execCommand && document.execCommand('copy')) done(); } catch (err) { /* 폴백: 선택 상태 유지 */ }
        }
      });
    }
  }
})();
