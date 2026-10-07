/* ============================================================
   Data dinamica no cabecalho (desktop e mobile)
   ============================================================ */
(function () {
  try {
    var now = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var formattedDate = now.toLocaleDateString('en-US', options);

    var desktopDateEl = document.getElementById('desktop-date-text');
    var mobileDateEl = document.getElementById('mobile-date-text');

    if (desktopDateEl) desktopDateEl.textContent = formattedDate;
    if (mobileDateEl) mobileDateEl.textContent = formattedDate;
  } catch (e) {
    // Mantem o texto padrao caso ocorra algum bloqueio
  }
})();

/* ============================================================
   URL PARAM PASSTHROUGH
   Pega qualquer parametro da URL (rtkcid, aff_id, src, etc) e
   propaga pra todos os links da pagina, incluindo os checkouts.
   ============================================================ */
(function () {
  var u = new URLSearchParams(location.search);
  if (!u.toString()) return;

  document.querySelectorAll('a').forEach(function (l) {
    var href = l.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return;

    var parts = l.href.split('#');
    var base = parts[0];
    var hash = parts[1] || '';
    var qs = base.split('?');
    var path = qs[0];
    var e = new URLSearchParams(qs[1] || '');

    u.forEach(function (v, k) { if (!e.has(k)) e.append(k, v); });

    l.href = path + '?' + e + (hash ? '#' + hash : '');
  });
})();

/* ============================================================
   Libera a oferta no pitch da VSL (49:38 = 2978s) e rola ate ela.
   Quem ja passou do pitch uma vez ve a oferta direto.
   ============================================================ */
(function () {
  var SECONDS_TO_DISPLAY = 2978;
  var PLAYER_ID = '6aab2f7417e4527935c0bd5d';
  var STORAGE_KEY = 'alreadyElsDisplayed' + SECONDS_TO_DISPLAY;
  var MAX_ATTEMPTS = 60;

  var displayed = false;
  var attempts = 0;
  var boundInstance = false;
  var boundElement = false;

  function showHiddenElements() {
    if (displayed) return;
    displayed = true;
    try {
      document.querySelectorAll('.pitch-hidden').forEach(function (el) {
        el.classList.remove('pitch-hidden');
      });
      localStorage.setItem(STORAGE_KEY, true);
      var potes = document.getElementById('potes');
      if (potes) potes.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      console.log(e);
    }
  }

  function getPlayerElement() {
    var wrapper = document.querySelector('.vsl-player');
    if (wrapper) {
      var inner = wrapper.querySelector('vturb-smartplayer');
      if (inner) return inner;
    }
    return document.querySelector('vturb-smartplayer#vid-' + PLAYER_ID)
        || document.querySelector('vturb-smartplayer');
  }

  function getInstance() {
    if (typeof smartplayer === 'undefined' || !smartplayer.instances || !smartplayer.instances.length) return null;
    if (smartplayer.instances.length > 1) {
      return smartplayer.instances.find(function (i) {
        var id = i && ((i.options && i.options.id) || (i.analytics && i.analytics.player && i.analytics.player.options && i.analytics.player.options.id));
        return id === PLAYER_ID;
      }) || null;
    }
    return smartplayer.instances[0];
  }

  // Caminho principal: API do smartplayer (mesmo padrao das outras VSLs do repo)
  function bindInstance() {
    var instance = getInstance();
    if (!instance || typeof instance.on !== 'function' || boundInstance) return false;
    boundInstance = true;
    instance.on('timeupdate', function () {
      // durante o smart autoplay (teaser mudo) a oferta nao libera
      if (displayed || instance.smartAutoPlay) return;
      if (!instance.video || instance.video.currentTime < SECONDS_TO_DISPLAY) return;
      showHiddenElements();
    });
    return true;
  }

  // Fallback: eventos do web component, caso a API nao exponha a instancia
  function bindElement() {
    var el = getPlayerElement();
    if (!el || boundElement) return false;
    boundElement = true;

    function onTime(event, player) {
      if (displayed) return;
      var detail = event && event.detail;
      if (player && player.smartAutoPlay) return;
      var time = detail && (typeof detail.time === 'number' ? detail.time
               : typeof detail.currentTime === 'number' ? detail.currentTime
               : typeof detail === 'number' ? detail : null);
      if (typeof time !== 'number' || time < SECONDS_TO_DISPLAY) return;
      showHiddenElements();
    }

    el.addEventListener('video:timeupdate', function (e) { onTime(e, el); });
    el.addEventListener('player:ready', function (e) {
      var player = e && e.detail && e.detail.player;
      if (player) player.addEventListener('video:timeupdate', function (ev) { onTime(ev, player); });
    });
    return true;
  }

  window.startWatchVideoProgress = function startWatchVideoProgress() {
    bindElement();
    if (bindInstance()) return;
    if (displayed || attempts >= MAX_ATTEMPTS) return;
    attempts += 1;
    setTimeout(startWatchVideoProgress, 1000);
  };

  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    setTimeout(showHiddenElements, 100);
  } else {
    window.startWatchVideoProgress();
  }
})();
