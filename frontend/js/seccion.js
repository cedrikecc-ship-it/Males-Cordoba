/* Resguardo Indígena de Males - Página de sección (seccion.html) */
(function () {
    'use strict';

    var NOMBRE_SITIO = 'Resguardo Indígena de Males';

    var titulo = document.getElementById('seccion-titulo');
    var descripcion = document.getElementById('seccion-descripcion');
    var aviso = document.getElementById('seccion-aviso');
    var lista = document.getElementById('seccion-elementos');
    var mensaje = document.getElementById('seccion-mensaje');

    if (!titulo || !descripcion || !aviso || !lista || !mensaje) return;

    /* Único punto de acceso a los datos. Hoy lee el contenido provisional;
       en la etapa del backend solo habrá que cambiar el cuerpo de esta función
       por una petición a la API. Devuelve una promesa con la sección o null. */
    function obtenerSeccion(tipo) {
        var datos = window.CONTENIDO_PROVISIONAL || {};
        var existe = Object.prototype.hasOwnProperty.call(datos, tipo);
        return Promise.resolve(existe ? datos[tipo] : null);
    }

    // Crea un elemento con clase y texto (textContent: nunca interpreta HTML)
    function crear(etiqueta, clase, texto) {
        var nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto) nodo.textContent = texto;
        return nodo;
    }

    function crearTarjeta(elemento, tipo) {
        var tarjeta = crear('li', 'card card--item');

        // Espacio de imagen: el texto provisional queda detrás de la imagen real
        var media = crear('div', 'card__media');
        media.appendChild(crear('span', 'card__media-label', 'Imagen provisional'));
        if (elemento.imagen) {
            var img = document.createElement('img');
            img.alt = elemento.titulo || '';
            img.loading = 'lazy';
            // Si la imagen no existe, se oculta y se ve el espacio provisional
            img.addEventListener('error', function () { img.classList.add('is-missing'); });
            img.src = elemento.imagen;
            media.appendChild(img);
        }
        tarjeta.appendChild(media);

        var cuerpo = crear('div', 'card__body');
        var fecha = elemento.fecha || (tipo === 'eventos' ? 'Fecha por definir' : '');
        if (fecha) cuerpo.appendChild(crear('p', 'card__meta', fecha));
        cuerpo.appendChild(crear('h2', 'card__title', elemento.titulo || 'Sin título'));
        if (elemento.texto) cuerpo.appendChild(crear('p', 'card__text', elemento.texto));
        tarjeta.appendChild(cuerpo);

        return tarjeta;
    }

    function marcarEnlaceActivo(tipo) {
        var destino = 'seccion.html?tipo=' + tipo;
        document.querySelectorAll('.main-nav__link').forEach(function (enlace) {
            if (enlace.getAttribute('href') === destino) {
                enlace.setAttribute('aria-current', 'page');
            }
        });
    }

    function mostrarSeccion(tipo, seccion) {
        document.title = seccion.titulo + ' | ' + NOMBRE_SITIO;
        titulo.textContent = seccion.titulo;
        descripcion.textContent = seccion.descripcion || '';
        aviso.hidden = !seccion.provisional;
        marcarEnlaceActivo(tipo);

        // Solo elementos publicados, ordenados por el campo "orden"
        var elementos = (seccion.elementos || [])
            .filter(function (e) { return e.publicado !== false; })
            .sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });

        if (elementos.length === 0) {
            mensaje.textContent = 'Esta sección aún no tiene contenido publicado.';
            mensaje.hidden = false;
            return;
        }

        elementos.forEach(function (elemento) {
            lista.appendChild(crearTarjeta(elemento, tipo));
        });
    }

    function mostrarNoEncontrada() {
        document.title = 'Sección no encontrada | ' + NOMBRE_SITIO;
        titulo.textContent = 'Sección no encontrada';
        descripcion.textContent = 'La sección que buscas no existe o todavía no está disponible.';
        mensaje.textContent = 'Vuelve al inicio y elige una de las secciones disponibles.';
        mensaje.hidden = false;
    }

    function mostrarError() {
        document.title = 'No se pudo cargar | ' + NOMBRE_SITIO;
        titulo.textContent = 'No se pudo cargar la sección';
        descripcion.textContent = 'Ocurrió un problema al cargar el contenido. Intenta de nuevo más tarde.';
    }

    var tipo = new URLSearchParams(window.location.search).get('tipo');

    obtenerSeccion(tipo)
        .then(function (seccion) {
            if (seccion) {
                mostrarSeccion(tipo, seccion);
            } else {
                mostrarNoEncontrada();
            }
        })
        .catch(mostrarError);
})();