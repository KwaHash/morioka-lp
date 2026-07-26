/* ==========================================================================
   社会保険労務士 川村事務所 – 1ページ LP
   https://morioka-shougai.jp/
   ========================================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------------------------
     設定：お問い合わせフォームの送信先
     ------------------------------------------------------------------
     フォームメール（Formrun / formspree / レンタルサーバーのCGI 等）の
     送信先URLをここに設定してください。
     空のままの場合、フォームは送信されず、お電話での連絡を案内します。
     -------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ====================================================================
     1. ハンバーガーメニュー
     ==================================================================== */
  var hamburger = $('#hamburger');
  var gnav = $('#gnav');

  function closeNav() {
    if (!gnav || !hamburger) return;
    gnav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
  }

  function toggleNav() {
    var isOpen = gnav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  }

  if (hamburger && gnav) {
    hamburger.addEventListener('click', toggleNav);

    // メニュー内リンクをタップしたら閉じる
    $$('a', gnav).forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    // Esc キーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    // 画面外タップで閉じる
    document.addEventListener('click', function (e) {
      if (!gnav.classList.contains('is-open')) return;
      if (gnav.contains(e.target) || hamburger.contains(e.target)) return;
      closeNav();
    });

    // PC幅に戻ったら状態をリセット
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) closeNav();
    });
  }

  /* ====================================================================
     2. ヘッダーの影 ／ トップへ戻るボタン
     ==================================================================== */
  var header = $('#header');
  var toTop  = $('#to-top');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (toTop)  toTop.classList.toggle('is-shown', y > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ====================================================================
     3. 現在位置に応じたナビのハイライト
     ==================================================================== */
  var navLinks = $$('.gnav__list a');
  var sections = navLinks
    .map(function (a) { return a.hash ? $(a.hash) : null; })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.hash === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ====================================================================
     4. スクロールで要素をふわっと表示
     ==================================================================== */
  var revealTargets = $$(
    '.about__photo, .about__body, .card, .flow__item, .contact__tel, .contact__office, .formbox'
  );

  if ('IntersectionObserver' in window) {
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 90 + 'ms';
    });

    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach(function (el) { revealer.observe(el); });
  }

  /* ====================================================================
     5. 代表者写真：画像が無い場合はプレースホルダー表示
     ==================================================================== */
  var photoWrap = $('[data-photo]');
  if (photoWrap) {
    var photoImg = $('img', photoWrap);
    if (photoImg) {
      var markNoImage = function () { photoWrap.classList.add('is-noimg'); };
      photoImg.addEventListener('error', markNoImage);
      if (photoImg.complete && photoImg.naturalWidth === 0) markNoImage();
    }
  }

  /* ====================================================================
     6. コピーライトの年
     ==================================================================== */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ====================================================================
     7. お問い合わせフォーム
     ==================================================================== */
  var form   = $('#inquiry-form');
  var status = $('#form-status');

  if (form) {
    var RULES = {
      'f-name':    { msg: 'お名前をご入力ください。' },
      'f-email':   { msg: 'メールアドレスをご入力ください。',
                     test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
                     invalidMsg: 'メールアドレスの形式をご確認ください。' },
      'f-tel':     { optional: true,
                     test: function (v) { return /^[0-9+\-() ]{9,20}$/.test(v); },
                     invalidMsg: '電話番号の形式をご確認ください。' },
      'f-message': { msg: 'お問い合わせ内容をご入力ください。' },
      'f-privacy': { msg: '個人情報の取り扱いにご同意ください。' }
    };

    function showError(id, message) {
      var field = document.getElementById(id);
      var box = $('[data-error-for="' + id + '"]');
      if (field) field.classList.add('is-invalid');
      if (field) field.setAttribute('aria-invalid', 'true');
      if (box) {
        box.textContent = message;
        box.classList.add('is-shown');
      }
    }

    function clearError(id) {
      var field = document.getElementById(id);
      var box = $('[data-error-for="' + id + '"]');
      if (field) field.classList.remove('is-invalid');
      if (field) field.removeAttribute('aria-invalid');
      if (box) {
        box.textContent = '';
        box.classList.remove('is-shown');
      }
    }

    function validateField(id) {
      var rule = RULES[id];
      var field = document.getElementById(id);
      if (!rule || !field) return true;

      if (field.type === 'checkbox') {
        if (!field.checked) { showError(id, rule.msg); return false; }
        clearError(id);
        return true;
      }

      var value = field.value.trim();

      if (!value) {
        if (rule.optional) { clearError(id); return true; }
        showError(id, rule.msg);
        return false;
      }
      if (rule.test && !rule.test(value)) {
        showError(id, rule.invalidMsg || rule.msg);
        return false;
      }
      clearError(id);
      return true;
    }

    // 入力し直したらエラー表示を解除
    Object.keys(RULES).forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      var ev = field.type === 'checkbox' ? 'change' : 'blur';
      field.addEventListener(ev, function () { validateField(id); });
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid')) validateField(id);
      });
    });

    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.className = 'form__status is-shown ' + (type === 'success' ? 'is-success' : 'is-error');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // ボット対策：非表示項目に入力があれば処理しない
      var honeypot = $('#f-website');
      if (honeypot && honeypot.value) return;

      var firstInvalid = null;
      Object.keys(RULES).forEach(function (id) {
        if (!validateField(id) && !firstInvalid) firstInvalid = document.getElementById(id);
      });

      if (firstInvalid) {
        setStatus('未入力または内容に誤りのある項目があります。ご確認ください。', 'error');
        firstInvalid.focus();
        return;
      }

      if (!FORM_ENDPOINT) {
        setStatus(
          'ただいまフォームの送信設定を準備中です。お手数ですが 019-XXXX-XXXX までお電話ください。',
          'error'
        );
        return;
      }

      var submitBtn = $('button[type="submit"]', form);
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '送信中...'; }
      setStatus('送信しています…', 'success');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('送信に失敗しました');
          form.reset();
          setStatus('お問い合わせありがとうございます。2営業日以内にご返信いたします。', 'success');
        })
        .catch(function () {
          setStatus(
            '送信に失敗しました。お手数ですが時間をおいて再度お試しいただくか、019-XXXX-XXXX までお電話ください。',
            'error'
          );
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '送信する'; }
        });
    });
  }
})();
