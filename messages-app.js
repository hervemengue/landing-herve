(function () {
  function copyText(text, btn) {
    function done() {
      btn.classList.add("copied");
      var prev = btn.textContent;
      btn.textContent = "Copié — collez dans WhatsApp ou SMS";
      setTimeout(function () {
        btn.classList.remove("copied");
        btn.textContent = prev;
      }, 2200);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
      return;
    }
    fallback();

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        btn.textContent = "Sélectionnez le texte ci-dessus";
      }
      document.body.removeChild(ta);
    }
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-target");
      var el = id ? document.getElementById(id) : null;
      if (!el) return;
      copyText(el.textContent.trim(), btn);
    });
  });
})();
