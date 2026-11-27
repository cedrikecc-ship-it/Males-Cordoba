
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

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    desktop.addEventListener('change', function () {
      setMenu(false);
    });
  }

  /* ---------- Imágenes que todavía no existen ---------- */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function hide() {
      img.classList.add('is-missing');
    }

    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') {
      hide();
    } else {
      img.addEventListener('error', hide);
    }
  });

  /* ---------- Buscador de información cultural (HU-01) ---------- */

  var formularioBusqueda = document.getElementById('form-busqueda');
  var campoBusqueda = document.getElementById('campo-busqueda');
  var resultadosBusqueda = document.getElementById('resultados-busqueda');

  if (formularioBusqueda && campoBusqueda && resultadosBusqueda) {

    // Normaliza el texto para permitir búsquedas sin importar tildes o mayúsculas.
    function normalizarTexto(texto) {
      return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    }

    // Limpia los resultados anteriores.
    function limpiarResultados() {
      resultadosBusqueda.replaceChildren();
    }

    // Crea un resultado utilizando elementos seguros del DOM.
    function mostrarResultado(titulo, descripcion, tipo) {
      var enlace = document.createElement('a');
      enlace.className = 'resultado-busqueda';
      enlace.href = 'seccion.html?tipo=' + encodeURIComponent(tipo);

      var encabezado = document.createElement('h3');
      encabezado.textContent = titulo;

      var texto = document.createElement('p');
      texto.textContent = descripcion;

      enlace.appendChild(encabezado);
      enlace.appendChild(texto);
      resultadosBusqueda.appendChild(enlace);
    }

    formularioBusqueda.addEventListener('submit', function (event) {
      event.preventDefault();

      limpiarResultados();

      var consulta = normalizarTexto(campoBusqueda.value);

      if (!consulta) {
        var mensajeVacio = document.createElement('p');
        mensajeVacio.textContent = 'Escribe una palabra o frase para realizar la búsqueda.';
        resultadosBusqueda.appendChild(mensajeVacio);
        return;
      }

      var contenido = window.CONTENIDO_PROVISIONAL;

      if (!contenido || typeof contenido !== 'object') {
        var mensajeError = document.createElement('p');
        mensajeError.textContent = 'No fue posible cargar la información para realizar la búsqueda.';
        resultadosBusqueda.appendChild(mensajeError);
        return;
      }

      var cantidadResultados = 0;

      Object.keys(contenido).forEach(function (clave) {
        var seccion = contenido[clave];

        if (!seccion) return;

        var tituloSeccion = seccion.titulo || clave;
        var descripcionSeccion = seccion.descripcion || '';

        var textoSeccion = normalizarTexto(
          clave + ' ' + tituloSeccion + ' ' + descripcionSeccion
        );

        var coincidencias = [];

        // Comprueba si la búsqueda coincide con el nombre o descripción de la sección.
        if (textoSeccion.includes(consulta)) {
          coincidencias.push({
            titulo: tituloSeccion,
            descripcion: descripcionSeccion
          });
        }

        // Busca también dentro de los elementos publicados de cada sección.
        if (Array.isArray(seccion.elementos)) {
          seccion.elementos.forEach(function (elemento) {
            if (!elemento || elemento.publicado === false) return;

            var textoElemento = normalizarTexto(
              (elemento.titulo || '') + ' ' + (elemento.texto || '')
            );

            if (textoElemento.includes(consulta)) {
              coincidencias.push({
                titulo: elemento.titulo || tituloSeccion,
                descripcion: elemento.texto || 'Consulta esta sección para conocer más información.'
              });
            }
          });
        }

        // Muestra los resultados encontrados para esta sección.
        coincidencias.forEach(function (coincidencia) {
          mostrarResultado(
            coincidencia.titulo,
            coincidencia.descripcion,
            clave
          );

          cantidadResultados++;
        });
      });

      // Informa cuando no se encuentran coincidencias.
      if (cantidadResultados === 0) {
        var sinResultados = document.createElement('p');
        sinResultados.className = 'sin-resultados';
        sinResultados.textContent = 'No se encontraron resultados para "' + campoBusqueda.value.trim() + '". Intenta con otra palabra.';
        resultadosBusqueda.appendChild(sinResultados);
      } else {
        var resumen = document.createElement('p');
        resumen.className = 'resumen-resultados';
        resumen.textContent = 'Se encontraron ' + cantidadResultados + ' resultado(s).';
        resultadosBusqueda.prepend(resumen);
      }
    });

    // Al borrar el campo de búsqueda, también se limpian los resultados.
    campoBusqueda.addEventListener('input', function () {
      if (!campoBusqueda.value.trim()) {
        limpiarResultados();
      }
    });
  }

  /* ---------- Portada con imagen configurable ---------- */

  var ultimaSolicitudPortada = 0;

  function aplicarConfiguracionPortada(config) {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    config = config || {};

    var solicitud = ++ultimaSolicitudPortada;
    var imagen = String(config.imagen || '').trim();
    var posicionValida = /^[a-z0-9%.\s-]+$/i;

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

    var velo = parseFloat(config.velo);

    if (isNaN(velo)) velo = 0.25;

    velo = Math.min(1, Math.max(0, velo));

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
      url = new URL(imagen, document.baseURI).href;
    } catch (e) {
      mostrarRespaldo();
      return;
    }

    var prueba = new Image();

    prueba.onload = function () {
      if (solicitud !== ultimaSolicitudPortada) return;

      var segura = url.replace(/["\\\n\r]/g, function (c) {
        return encodeURIComponent(c);
      });

      hero.style.setProperty('--hero-image', 'url("' + segura + '")');
      hero.style.setProperty('--hero-overlay', String(velo));
    };

    prueba.onerror = function () {
      if (solicitud !== ultimaSolicitudPortada) return;
      mostrarRespaldo();
    };

    prueba.src = url;
  }

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
