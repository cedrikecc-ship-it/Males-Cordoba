/* Cultural Males - Módulo "Identidad y portada" del panel administrativo
 *
 * QUÉ ES REAL HOY: formulario, validación, selección de imágenes y vista previa.
 * QUÉ NO ES REAL: NO se guarda nada. Las imágenes elegidas solo existen como vista
 * previa temporal en este navegador (direcciones blob:), no se suben a ningún servidor
 * y la página pública no cambia. La persistencia real llegará con el backend
 * (ver enviarAlBackend más abajo).
 */
(function () {
    'use strict';

    var form = document.getElementById('adm-id-form');
    if (!form) return;

    // Valores actuales de la página pública (copiados de frontend/index.html).
    // Cuando exista el backend, se leerán de la API en lugar de estar aquí.
    var ACTUALES = {
        logo: 'img/logo.png',
        portada: 'img/portada.png',
        titulo: 'Resguardo Indígena de Males',
        texto: 'Bienvenido. Este espacio nace para reunir, organizar y compartir la información cultural del Resguardo.',
        boton: 'Conocer nuestra cultura'
    };
    var VELO_PORTADA = 0.25; // igual que data-hero-overlay en index.html
    var TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
    var LIMITES_MB = { logo: 2, portada: 5 };
    var ANCHO_MIN_PORTADA = 1600;
    var SIN_IMAGEN = {
        logo: 'Todavía no hay un logo cargado en el sitio.',
        portada: 'Todavía no hay una fotografía de portada.'
    };

    function $(id) { return document.getElementById(id); }

    function mostrarTexto(nodo, texto) {
        nodo.textContent = texto || '';
        nodo.hidden = !texto;
    }

    function formatoTamano(bytes) {
        return bytes >= 1048576
            ? (bytes / 1048576).toFixed(1) + ' MB'
            : Math.max(1, Math.round(bytes / 1024)) + ' KB';
    }

    // Ruta absoluta: evita que una ruta relativa se interprete desde otra carpeta
    function resolver(ruta) {
        try { return new URL(ruta, document.baseURI).href; } catch (e) { return ''; }
    }

    /* ---------- Textos ---------- */
    var campos = {
        titulo: { input: $('adm-id-titulo'), error: $('adm-id-titulo-error'), nombre: 'El título principal', min: 3, max: 80 },
        texto: { input: $('adm-id-texto'), error: $('adm-id-texto-error'), nombre: 'El texto de bienvenida', min: 10, max: 300 },
        boton: { input: $('adm-id-boton'), error: $('adm-id-boton-error'), nombre: 'El texto del botón', min: 2, max: 40 }
    };
    var CLAVES = ['titulo', 'texto', 'boton'];

    function validarCampo(campo) {
        var valor = campo.input.value.trim();
        var mensaje = '';
        if (!valor) mensaje = campo.nombre + ' es obligatorio.';
        else if (valor.length < campo.min) mensaje = campo.nombre + ' debe tener al menos ' + campo.min + ' caracteres.';
        else if (valor.length > campo.max) mensaje = campo.nombre + ' no puede superar ' + campo.max + ' caracteres.';
        mostrarTexto(campo.error, mensaje);
        campo.input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
        return !mensaje;
    }

    function validar() {
        var primero = null;
        CLAVES.forEach(function (clave) {
            if (!validarCampo(campos[clave]) && !primero) primero = campos[clave].input;
        });
        if (primero) primero.focus();
        return !primero;
    }

    function actualizarContador() {
        $('adm-id-texto-count').textContent = campos.texto.input.value.length + ' / ' + campos.texto.max + ' caracteres';
    }

    /* ---------- Imágenes ---------- */
    var imagenes = {};
    document.querySelectorAll('.adm-uploader').forEach(function (raiz) {
        var tipo = raiz.getAttribute('data-imagen');
        imagenes[tipo] = {
            tipo: tipo,
            img: raiz.querySelector('.adm-uploader__img'),
            vacio: raiz.querySelector('.adm-uploader__empty'),
            meta: raiz.querySelector('.adm-uploader__meta'),
            input: raiz.querySelector('input[type="file"]'),
            quitar: raiz.querySelector('[data-quitar]'),
            aviso: raiz.querySelector('.adm-field__note--warn'),
            error: raiz.querySelector('.adm-field__error'),
            nueva: null // { archivo, url, ancho, alto } cuando hay una imagen nueva elegida
        };
    });

    function mostrarFoto(im, visible) {
        im.img.hidden = !visible;
        im.vacio.hidden = visible;
    }

    function liberar(im) {
        if (im.nueva) URL.revokeObjectURL(im.nueva.url);
        im.nueva = null;
    }

    // Muestra la imagen que hoy usa el sitio público (si existe)
    function mostrarActual(im) {
        mostrarFoto(im, false);
        im.meta.textContent = 'Imagen actual del sitio (sin cambios).';
        im.img.onload = function () { mostrarFoto(im, true); };
        im.img.onerror = function () { mostrarFoto(im, false); im.meta.textContent = SIN_IMAGEN[im.tipo]; };
        im.img.src = ACTUALES[im.tipo];
    }

    function mostrarNueva(im) {
        var n = im.nueva;
        im.img.onload = function () { mostrarFoto(im, true); };
        im.img.onerror = function () { mostrarFoto(im, false); };
        im.img.src = n.url;
        im.meta.textContent = 'Nueva imagen (sin guardar): ' + n.archivo.name + ' · ' +
            formatoTamano(n.archivo.size) + ' · ' + n.ancho + ' × ' + n.alto + ' px';
    }

    function avisarCalidad(im) {
        var n = im.nueva;
        var aviso = '';
        if (im.tipo === 'portada' && n.ancho < ANCHO_MIN_PORTADA) {
            aviso = 'Esta imagen mide ' + n.ancho + ' × ' + n.alto + ' px. En pantallas grandes puede verse borrosa; lo ideal son al menos ' + ANCHO_MIN_PORTADA + ' px de ancho.';
        }
        if (im.tipo === 'logo' && Math.abs(n.ancho - n.alto) / Math.max(n.ancho, n.alto) > 0.1) {
            aviso = 'El logo se mostrará dentro de un círculo y se recortará; una imagen cuadrada se ve mejor.';
        }
        mostrarTexto(im.aviso, aviso);
    }

    function rechazar(im, mensaje) {
        im.input.value = '';
        mostrarTexto(im.error, mensaje);
    }

    function alElegirArchivo(im) {
        var archivo = im.input.files && im.input.files[0];
        if (!archivo) return; // canceló el diálogo: no cambia nada
        mostrarTexto(im.error, '');
        mostrarTexto(im.aviso, '');

        if (TIPOS_PERMITIDOS.indexOf(archivo.type) === -1) {
            rechazar(im, 'Formato no permitido. Usa una imagen PNG, JPG o WebP.');
            return;
        }
        if (archivo.size > LIMITES_MB[im.tipo] * 1048576) {
            rechazar(im, 'La imagen pesa ' + formatoTamano(archivo.size) + ' y el máximo es ' + LIMITES_MB[im.tipo] + ' MB.');
            return;
        }

        // Se comprueba que el archivo realmente sea una imagen que el navegador pueda leer
        var url = URL.createObjectURL(archivo);
        var prueba = new Image();
        prueba.onload = function () {
            liberar(im);
            im.nueva = { archivo: archivo, url: url, ancho: prueba.naturalWidth, alto: prueba.naturalHeight };
            im.quitar.hidden = false;
            mostrarNueva(im);
            avisarCalidad(im);
            alCambiar();
        };
        prueba.onerror = function () {
            URL.revokeObjectURL(url);
            rechazar(im, 'No se pudo leer la imagen. Prueba con otro archivo.');
        };
        prueba.src = url;
    }

    function quitarNueva(im) {
        liberar(im);
        im.input.value = '';
        im.quitar.hidden = true;
        mostrarTexto(im.error, '');
        mostrarTexto(im.aviso, '');
        mostrarActual(im);
        alCambiar();
    }

    Object.keys(imagenes).forEach(function (tipo) {
        var im = imagenes[tipo];
        im.input.addEventListener('change', function () { alElegirArchivo(im); });
        im.quitar.addEventListener('click', function () { quitarNueva(im); });
    });

    /* ---------- Mensajes de resultado ---------- */
    var mensaje = $('adm-id-message');

    function mostrarMensaje(tipo, texto) {
        mensaje.className = 'adm-alert' + (tipo ? ' adm-alert--' + tipo : '');
        mensaje.textContent = texto || '';
        mensaje.hidden = !texto;
    }

    /* ---------- Vista previa ---------- */
    var prev = {
        caja: $('adm-id-prev'),
        hero: $('adm-id-prev-hero'),
        titulo: $('adm-id-prev-title'),
        texto: $('adm-id-prev-text'),
        boton: $('adm-id-prev-btn'),
        logo: $('adm-id-prev-logo').querySelector('img')
    };

    function direccionDe(tipo) {
        return imagenes[tipo].nueva ? imagenes[tipo].nueva.url : resolver(ACTUALES[tipo]);
    }

    function mostrarTextoPrevio(nodo, valor, vacio) {
        nodo.textContent = valor.trim() || vacio;
    }

    function dibujarPrevia(desplazar) {
        prev.caja.hidden = false;
        mostrarTextoPrevio(prev.titulo, campos.titulo.input.value, '(Título principal)');
        mostrarTextoPrevio(prev.texto, campos.texto.input.value, '(Texto de bienvenida)');
        mostrarTextoPrevio(prev.boton, campos.boton.input.value, '(Botón)');

        // Logo: si la imagen no carga, queda el espacio provisional
        prev.logo.hidden = true;
        prev.logo.onload = function () { prev.logo.hidden = false; };
        prev.logo.onerror = function () { prev.logo.hidden = true; };
        prev.logo.src = direccionDe('logo');

        // Portada: foto con capa suave si carga; si no, fondo verde de respaldo (como en el sitio)
        var url = direccionDe('portada');
        var prueba = new Image();
        prueba.onload = function () {
            prev.hero.style.setProperty('--adm-prev-image', 'url("' + url + '")');
            prev.hero.style.setProperty('--adm-prev-overlay', String(VELO_PORTADA));
        };
        prueba.onerror = function () {
            prev.hero.style.removeProperty('--adm-prev-image');
            prev.hero.style.setProperty('--adm-prev-overlay', '0');
        };
        prueba.src = url;

        if (desplazar) prev.caja.scrollIntoView({ block: 'start' });
    }

    /* ---------- Cambios, cancelar y guardar ---------- */
    function hayCambios() {
        return CLAVES.some(function (clave) { return campos[clave].input.value.trim() !== ACTUALES[clave]; }) ||
            !!imagenes.logo.nueva || !!imagenes.portada.nueva;
    }

    // Se llama cada vez que el usuario modifica algo
    function alCambiar() {
        mostrarMensaje('', '');
        actualizarContador();
        if (!prev.caja.hidden) dibujarPrevia(false); // la vista previa abierta se mantiene al día
    }

    function restablecer() {
        CLAVES.forEach(function (clave) {
            campos[clave].input.value = ACTUALES[clave];
            campos[clave].input.setAttribute('aria-invalid', 'false');
            mostrarTexto(campos[clave].error, '');
        });
        Object.keys(imagenes).forEach(function (tipo) {
            var im = imagenes[tipo];
            liberar(im);
            im.input.value = '';
            im.quitar.hidden = true;
            mostrarTexto(im.error, '');
            mostrarTexto(im.aviso, '');
            mostrarActual(im);
        });
        prev.caja.hidden = true;
        actualizarContador();
    }

    CLAVES.forEach(function (clave) {
        campos[clave].input.addEventListener('input', function () {
            mostrarTexto(campos[clave].error, '');
            campos[clave].input.setAttribute('aria-invalid', 'false');
            alCambiar();
        });
    });

    $('adm-id-preview-btn').addEventListener('click', function () {
        dibujarPrevia(true);
        mostrarMensaje('info', 'Vista previa actualizada. Es solo una vista previa: no se guardó ni se publicó nada.');
    });

    $('adm-id-cancel').addEventListener('click', function () {
        if (hayCambios() && !window.confirm('¿Descartar los cambios sin guardar?')) return;
        restablecer();
        mostrarMensaje('info', 'Cambios descartados. El formulario muestra otra vez los valores actuales del sitio.');
    });

    // Datos tal como se enviarán al backend (los archivos serán parte de un FormData)
    function reunirDatos() {
        return {
            titulo: campos.titulo.input.value.trim(),
            texto: campos.texto.input.value.trim(),
            boton: campos.boton.input.value.trim(),
            logo: imagenes.logo.nueva ? imagenes.logo.nueva.archivo : null,
            portada: imagenes.portada.nueva ? imagenes.portada.nueva.archivo : null
        };
    }

    /* PERSISTENCIA PENDIENTE (siguiente etapa).
     * Aquí irá la petición al backend, por ejemplo PUT /api/identidad con un FormData
     * (textos + archivos). Hoy no existe ninguna API ni almacenamiento, así que esta
     * función NO guarda nada y siempre responde "sin backend". Cuando exista, bastará con
     * que devuelva { ok: true } y la pantalla mostrará el mensaje de éxito. */
    function enviarAlBackend(datos) { // eslint-disable-line no-unused-vars
        return Promise.resolve({ ok: false, motivo: 'sin-backend' });
    }

    var botonGuardar = $('adm-id-save');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validar()) {
            mostrarMensaje('error', 'Revisa los campos marcados en rojo antes de guardar.');
            return;
        }

        botonGuardar.disabled = true;
        mostrarMensaje('info', 'Enviando…');

        enviarAlBackend(reunirDatos())
            .then(function (respuesta) {
                if (respuesta.ok) {
                    mostrarMensaje('ok', 'Cambios guardados correctamente.');
                } else if (respuesta.motivo === 'sin-backend') {
                    mostrarMensaje('warn', 'Los datos son válidos, pero NO se guardaron: el servidor todavía no está conectado. Lo que ves aquí solo existe en esta pantalla y se perderá al recargar. La página pública no ha cambiado.');
                } else {
                    mostrarMensaje('error', 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
                }
            })
            .catch(function () {
                mostrarMensaje('error', 'No se pudieron guardar los cambios. Inténtalo de nuevo.');
            })
            .then(function () { botonGuardar.disabled = false; });
    });

    // Al cerrar sesión se descarta lo que no se haya guardado
    $('adm-logout').addEventListener('click', function () {
        restablecer();
        mostrarMensaje('', '');
    });

    // Avisa antes de salir de la página si hay cambios sin guardar
    window.addEventListener('beforeunload', function (event) {
        if (hayCambios()) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    restablecer();
})();