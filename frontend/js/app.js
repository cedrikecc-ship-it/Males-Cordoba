/* Resguardo Indígena de Males - Interacciones de la página de inicio */
(function () {
  'use strict';

  /* ---------- Menú hamburguesa (móvil y tablet) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  if (toggle && nav) {
    var desktop = window.matchMedia('(min-width: 1100px)');

    function setMenu(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Cierra el menú al elegir una opción
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    // Cierra con la tecla Escape
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    // Al pasar a pantalla de escritorio, deja el menú en estado cerrado
    desktop.addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Imágenes que todavía no existen ---------- */
  // Oculta las imágenes rotas para que se vea el espacio provisional.
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function hide() { img.classList.add('is-missing'); }

    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') {
      hide();
    } else {
      img.addEventListener('error', hide);
    }
  });

  /* ---------- Portada con imagen configurable ---------- */
  // config: { imagen, posicion, posicionMovil, velo }
  //   imagen         ruta o URL; vacío o ausente = fondo verde oscuro
  //   posicion       posición del fondo (center, top, center 30%...)
  //   posicionMovil  posición solo en móvil (opcional)
  //   velo           capa oscura de 0 a 1 (con imagen y sin valor: 0.25; sin imagen: 0)
  // Hoy se alimenta con los data-* del HTML; en una etapa posterior,
  // el panel administrativo podrá llamar a esta misma función con los datos guardados.
  // Número de la última solicitud: si llegan varias seguidas, solo se aplica la última
  var ultimaSolicitudPortada = 0;

  function aplicarConfiguracionPortada(config) {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    config = config || {};

    var solicitud = ++ultimaSolicitudPortada;
    var imagen = String(config.imagen || '').trim();
    var posicionValida = /^[a-z0-9%.\s-]+$/i;

    // Posición general y de móvil
    var posicion = String(config.posicion || '').trim();
    if (posicion && posicionValida.test(posicion)) {
      hero.style.setProperty('--hero-position', posicion);
    } else {
      hero.style.removeProperty('--hero-position');
    }

    var posicionMovil = String(config.posicionMovil || '').trim();
    if (posicionMovil && posicionValida.test(posicionMovil)) {
      hero.style.setProperty('--hero-position-mobile', posicionMovil);
    } else {
      hero.style.removeProperty('--hero-position-mobile');
    }

    // Capa oscura (solo se aplica junto con una imagen que sí cargó)
    var velo = parseFloat(config.velo);
    if (isNaN(velo)) velo = 0.25;
    velo = Math.min(1, Math.max(0, velo));

    // Fondo verde de respaldo: sin imagen y sin capa oscura
    function mostrarRespaldo() {
      hero.style.removeProperty('--hero-image');
      hero.style.setProperty('--hero-overlay', '0');
    }

    if (!imagen) {
      mostrarRespaldo();
      return;
    }

    var url;
    try {
      // URL absoluta: evita que una ruta relativa se interprete desde la carpeta css/
      url = new URL(imagen, document.baseURI).href;
    } catch (e) {
      mostrarRespaldo();
      return;
    }

    // Se precarga la imagen; solo se aplica si carga y sigue siendo la última solicitud
    var prueba = new Image();
    prueba.onload = function () {
      if (solicitud !== ultimaSolicitudPortada) return;
      var segura = url.replace(/["\\\n\r]/g, function (c) { return encodeURIComponent(c); });
      hero.style.setProperty('--hero-image', 'url("' + segura + '")');
      hero.style.setProperty('--hero-overlay', String(velo));
    };
    prueba.onerror = function () {
      if (solicitud !== ultimaSolicitudPortada) return;
      mostrarRespaldo();
    };
    prueba.src = url;
  }

  // Disponible para uso futuro desde otros scripts
  window.aplicarConfiguracionPortada = aplicarConfiguracionPortada;

  var portada = document.querySelector('.hero');
  if (portada) {
    aplicarConfiguracionPortada({
      imagen: portada.dataset.heroImage,
      posicion: portada.dataset.heroPosition,
      posicionMovil: portada.dataset.heroPositionMobile,
      velo: portada.dataset.heroOverlay
    });
  }
})();