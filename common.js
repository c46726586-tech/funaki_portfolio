/* ========== 共通:全ページで使うJavaScript ========== */

// ---------- ハンバーガーメニューの開閉 ----------
(function () {
    var btn = document.querySelector('.menu-btn');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return; // ボタンやメニューが無いページでは何もしない

    function setOpen(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
        menu.classList.toggle('is-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    // ボタンを押したら開閉
    btn.addEventListener('click', function () {
        setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    // メニュー内のリンクを押したら閉じる
    menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
    });

    // Escキーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });

    // 画面をPC幅に広げたら閉じる
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
        if (e.matches) setOpen(false);
    });
})();

// ---------- 今見ているセクションをナビに表示 ----------
// ページ内に #about / #design / #photo があるページだけで動きます。
// 別のページ(about.html など)では、該当するセクションが無いので何もしません。
(function () {
    var links = document.querySelectorAll('.menu a[href^="#"]');
    var sections = ['about', 'design', 'photo']
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);
    if (!links.length || !sections.length) return;

    var ticking = false;

    function update() {
        var line = window.innerHeight * 0.4;
        var current = null;

        sections.forEach(function (s) {
            if (s.getBoundingClientRect().top <= line) current = s.id;
        });

        // ページの一番下まで来たら、最後のセクションにする
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = sections[sections.length - 1].id;
        }

        links.forEach(function (a) {
            var on = a.getAttribute('href') === '#' + current;
            a.classList.toggle('is-current', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
})();

// ---------- ページ遷移(ふわっと消えてから移動) ----------
// 消える動きは common.css の body.is-leaving .page で決まります。
// 時間を変えるときは、CSSの 0.45s と、下の 450 を同じ長さにそろえてください。
(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        var a = e.target.closest('a[href]');
        if (!a) return;
        if (a.target === '_blank' || a.hasAttribute('download')) return;

        var url = new URL(a.href, location.href);
        // 別のサイトへのリンクは、そのまま移動
        if (url.protocol !== location.protocol || url.host !== location.host) return;
        // 同じページ内のリンク(#だけ)は、そのまま
        if (url.pathname === location.pathname && url.hash) return;

        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(function () { location.href = a.href; }, reduce ? 0 : 450);
    });

    // 「戻る」で戻ってきたときに、消えたままにならないようにする
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) document.body.classList.remove('is-leaving');
    });
})();

