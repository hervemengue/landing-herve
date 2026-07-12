/**
 * GA4 — événements conversion (cta_test_gratuit, cta_whatsapp_brief, cta_stripe)
 * + propagation UTM sur liens internes [data-utm-carry]
 */
(function () {
  function track(name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, Object.assign({ page_path: location.pathname }, params || {}));
    }
  }

  function utmFromUrl() {
    var p = new URLSearchParams(location.search);
    var out = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
      var v = p.get(k);
      if (v) out[k] = v;
    });
    return out;
  }

  function withUtm(href, utm) {
    try {
      var u = new URL(href, location.href);
      Object.keys(utm).forEach(function (k) {
        u.searchParams.set(k, utm[k]);
      });
      return u.pathname + u.search + u.hash;
    } catch (e) {
      return href;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var utm = utmFromUrl();

    document.querySelectorAll('a[data-utm-carry]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.indexOf('http') === 0 || href.indexOf('wa.me') !== -1) return;
      if (Object.keys(utm).length) {
        a.setAttribute('href', withUtm(href, utm));
      }
    });

    document.querySelectorAll('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () {
        track(el.getAttribute('data-track'), {
          link_url: el.href || '',
          link_text: (el.textContent || '').trim().slice(0, 80)
        });
      });
    });
  });

  window.hmTrack = track;
})();
