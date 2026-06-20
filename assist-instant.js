(function () {
  "use strict";

  var config = window.ASSIST_INSTANT_CONFIG || {};
  var root = document.getElementById("assist-instant");
  if (!root) return;

  var slug = root.getAttribute("data-slug") || "demo-plombier";
  var apiUrl = (config.apiUrl || root.getAttribute("data-api") || "").trim();

  var inputEl = document.getElementById("assist-input");
  var resultEl = document.getElementById("assist-result");
  var resultTextEl = document.getElementById("assist-result-text");
  var labelEl = document.getElementById("assist-result-label");
  var statusEl = document.getElementById("assist-status");
  var genBtn = document.getElementById("assist-generate");
  var micBtn = document.getElementById("assist-mic");
  var copyBtn = document.getElementById("assist-copy");

  var recognition = null;
  var listening = false;

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "assist-status" + (type ? " assist-status--" + type : "");
  }

  function copyText(text, btn) {
    function done() {
      btn.classList.add("copied");
      var prev = btn.textContent;
      btn.textContent = "Copié — collez dans WhatsApp";
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

  function initSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      if (micBtn) {
        micBtn.disabled = true;
        micBtn.title = "Micro non disponible sur ce navigateur (utilisez Chrome)";
      }
      return;
    }
    recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = function (event) {
      var text = "";
      for (var i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      if (inputEl) inputEl.value = (inputEl.value + " " + text).trim();
    };

    recognition.onend = function () {
      listening = false;
      if (micBtn) {
        micBtn.classList.remove("assist-mic--active");
        micBtn.textContent = "Parler";
      }
    };

    recognition.onerror = function () {
      listening = false;
      if (micBtn) {
        micBtn.classList.remove("assist-mic--active");
        micBtn.textContent = "Parler";
      }
      setStatus("Micro indisponible — écrivez la situation.", "warn");
    };
  }

  function toggleMic() {
    if (!recognition || !micBtn) return;
    if (listening) {
      recognition.stop();
      return;
    }
    listening = true;
    micBtn.classList.add("assist-mic--active");
    micBtn.textContent = "Écoute…";
    setStatus("Parlez maintenant (ex. client demande dispo demain).", "");
    recognition.start();
  }

  function generate() {
    if (!apiUrl) {
      setStatus(
        "API non configurée — déployez le Worker (voir worker/README.md) puis remplissez assist-instant-config.js.",
        "warn"
      );
      return;
    }

    var situation = inputEl ? inputEl.value.trim() : "";
    if (situation.length < 8) {
      setStatus("Décrivez la situation en une phrase (8 caractères min.).", "warn");
      return;
    }

    if (genBtn) {
      genBtn.disabled = true;
      genBtn.textContent = "Génération…";
    }
    setStatus("", "");
    if (resultEl) resultEl.hidden = true;

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slug, situation: situation }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Erreur serveur");
          return data;
        });
      })
      .then(function (data) {
        if (resultTextEl) resultTextEl.textContent = data.reply || "";
        if (labelEl) labelEl.textContent = data.label || "Nouvelle situation";
        if (resultEl) resultEl.hidden = false;
        setStatus("Brouillon prêt — relisez avant d'envoyer.", "ok");
      })
      .catch(function (err) {
        setStatus(err.message || "Échec — réessayez.", "error");
      })
      .finally(function () {
        if (genBtn) {
          genBtn.disabled = false;
          genBtn.textContent = "Générer le message";
        }
      });
  }

  if (micBtn) micBtn.addEventListener("click", toggleMic);
  if (genBtn) genBtn.addEventListener("click", generate);
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!resultTextEl) return;
      copyText(resultTextEl.textContent.trim(), copyBtn);
    });
  }

  initSpeech();

  if (!apiUrl) {
    setStatus("Beta — configurez l'URL API Worker pour activer la génération.", "warn");
  }
})();
