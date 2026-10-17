/* Cultural Males - Interacciones del panel administrativo (prototipo visual)
 *
 * AVISO IMPORTANTE: el ingreso de este archivo es una SIMULACIÓN TEMPORAL
 * para poder mostrar la interfaz. NO es una medida de seguridad:
 *  - no comprueba usuario ni contraseña contra nada,
 *  - no guarda contraseñas, sesiones ni datos en el navegador,
 *  - cualquiera puede abrir admin.html y ver el panel.
 * La autenticación real se implementará más adelante en el backend.
 */
(function () {
    'use strict';

    // Texto de cada módulo que aún no existe (se muestra en "Módulo en construcción")
    var DESCRIPCIONES = {
        identidad: 'Aquí podrás cambiar el logo, el nombre del sitio y la imagen de portada.',
        paginas: 'Aquí podrás editar los textos y el contenido de las secciones públicas.',
        galeria: 'Aquí podrás subir y ordenar fotografías y videos autorizados.',
        eventos: 'Aquí podrás crear, editar y publicar eventos.',
        redes: 'Aquí podrás gestionar los enlaces a las redes sociales del sitio.',
        pie: 'Aquí podrás editar el texto y los enlaces del pie de página.',
        configuracion: 'Aquí se ajustarán la cuenta de administrador y las opciones generales.'
    };

    function $(id) { return document.getElementById(id); }

    var login = $('adm-login');
    var app = $('adm-app');
    var form = $('adm-login-form');
    var userInput = $('adm-user');
    var passInput = $('adm-pass');
    var userError = $('adm-user-error');
    var passError = $('adm-pass-error');
    var toggleBtn = $('adm-pass-toggle');
    var sidebar = $('adm-sidebar');
    var overlay = $('adm-overlay');
    var menuBtn = $('adm-menu-btn');
    var title = $('adm-title');
    var construccionTexto = $('adm-construction-text');

    if (!login || !app || !form) return;

    /* ---------- Acceso (simulado) ---------- */
    function ponerError(input, nodo, mensaje) {
        nodo.textContent = mensaje;
        nodo.hidden = !mensaje;
        input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    }

    function validar() {
        var usuario = userInput.value.trim();
        var errorUsuario = '';

        if (!usuario) {
            errorUsuario = 'Escribe tu usuario o correo.';
        } else if (usuario.indexOf('@') !== -1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario)) {
            errorUsuario = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
        }
        var errorClave = passInput.value ? '' : 'Escribe tu contraseña.';

        ponerError(userInput, userError, errorUsuario);
        ponerError(passInput, passError, errorClave);

        if (errorUsuario) userInput.focus();
        else if (errorClave) passInput.focus();
        return !errorUsuario && !errorClave;
    }

    userInput.addEventListener('input', function () { ponerError(userInput, userError, ''); });
    passInput.addEventListener('input', function () { ponerError(passInput, passError, ''); });

    function mostrarClave(visible) {
        passInput.type = visible ? 'text' : 'password';
        toggleBtn.setAttribute('aria-pressed', String(visible));
        toggleBtn.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
        toggleBtn.querySelector('use').setAttribute('href', visible ? '#i-eye-off' : '#i-eye');
    }

    toggleBtn.addEventListener('click', function () {
        mostrarClave(passInput.type === 'password');
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validar()) return;
        // SIMULACIÓN TEMPORAL: si los campos no están vacíos, se muestra el panel.
        // Aquí irá la petición al backend cuando exista la autenticación real.
        passInput.value = '';
        mostrarClave(false);
        mostrarPanel();
    });

    function mostrarPanel() {
        login.hidden = true;
        app.hidden = false;
        mostrarVista('inicio');
    }

    function mostrarLogin() {
        abrirMenu(false);
        app.hidden = true;
        login.hidden = false;
        form.reset();
        mostrarClave(false);
        ponerError(userInput, userError, '');
        ponerError(passInput, passError, '');
        window.scrollTo(0, 0);
        userInput.focus();
    }

    $('adm-logout').addEventListener('click', mostrarLogin);

    /* ---------- Menú lateral (móvil) ---------- */
    function abrirMenu(abierto) {
        sidebar.classList.toggle('is-open', abierto);
        overlay.hidden = !abierto;
        menuBtn.setAttribute('aria-expanded', String(abierto));
        document.body.classList.toggle('adm-no-scroll', abierto);
    }

    menuBtn.addEventListener('click', function () {
        abrirMenu(!sidebar.classList.contains('is-open'));
    });
    overlay.addEventListener('click', function () { abrirMenu(false); });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') abrirMenu(false);
    });
    // Al pasar a pantalla de escritorio el menú queda fijo, así que se restablece
    window.matchMedia('(min-width: 900px)').addEventListener('change', function () { abrirMenu(false); });

    /* ---------- Vistas del panel ---------- */
    var botonesMenu = document.querySelectorAll('.adm-nav__item[data-view]');
    var panelInicio = document.querySelector('[data-panel="inicio"]');
    var panelConstruccion = document.querySelector('[data-panel="construccion"]');

    function mostrarVista(vista) {
        if (vista !== 'inicio' && !DESCRIPCIONES[vista]) vista = 'inicio';
        var esInicio = vista === 'inicio';

        panelInicio.hidden = !esInicio;
        panelConstruccion.hidden = esInicio;
        if (!esInicio) construccionTexto.textContent = DESCRIPCIONES[vista];

        botonesMenu.forEach(function (boton) {
            var activo = boton.getAttribute('data-view') === vista;
            boton.classList.toggle('is-active', activo);
            if (activo) {
                boton.setAttribute('aria-current', 'page');
                title.textContent = boton.querySelector('.adm-nav__label').textContent;
            } else {
                boton.removeAttribute('aria-current');
            }
        });

        abrirMenu(false);
        window.scrollTo(0, 0);
        title.focus();
    }

    // Cualquier elemento con data-view (menú, tarjetas, botón de volver) cambia de vista
    document.addEventListener('click', function (event) {
        var destino = event.target.closest('[data-view]');
        if (destino && app.contains(destino)) mostrarVista(destino.getAttribute('data-view'));
    });
})();