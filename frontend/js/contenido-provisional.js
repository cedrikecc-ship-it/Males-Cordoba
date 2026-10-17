/* Resguardo Indígena de Males - Contenido PROVISIONAL de las secciones
 *
 * Todo lo que hay aquí es texto de ejemplo, no información cultural real.
 * La clave de cada sección (cultura, comidas...) es el valor de ?tipo= en la dirección.
 *
 * Forma de los datos (la misma que tendrán después en el backend y MySQL):
 *   seccion:   titulo, descripcion, provisional (true muestra el aviso en la página)
 *   elementos: titulo, texto, imagen (ruta en img/, '' = sin imagen), fecha (eventos),
 *              orden, publicado (false lo oculta)
 */
window.CONTENIDO_PROVISIONAL = {
    cultura: {
        titulo: 'Cultura',
        descripcion: 'Contenido provisional: aquí se presentará la información cultural del Resguardo.',
        provisional: true,
        elementos: [
            { titulo: 'Elemento de ejemplo 1', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 1, publicado: true },
            { titulo: 'Elemento de ejemplo 2', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 2, publicado: true }
        ]
    },
    comidas: {
        titulo: 'Comidas',
        descripcion: 'Contenido provisional: aquí se presentarán las comidas del Resguardo.',
        provisional: true,
        elementos: [
            { titulo: 'Preparación de ejemplo 1', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 1, publicado: true },
            { titulo: 'Preparación de ejemplo 2', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 2, publicado: true }
        ]
    },
    lugares: {
        titulo: 'Lugares',
        descripcion: 'Contenido provisional: aquí se presentarán los lugares del Resguardo.',
        provisional: true,
        elementos: [
            { titulo: 'Lugar de ejemplo 1', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 1, publicado: true },
            { titulo: 'Lugar de ejemplo 2', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 2, publicado: true }
        ]
    },
    tradiciones: {
        titulo: 'Tradiciones',
        descripcion: 'Contenido provisional: aquí se presentarán las tradiciones del Resguardo.',
        provisional: true,
        elementos: [
            { titulo: 'Tradición de ejemplo 1', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 1, publicado: true },
            { titulo: 'Tradición de ejemplo 2', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 2, publicado: true }
        ]
    },
    historia: {
        titulo: 'Historia',
        descripcion: 'Contenido provisional: aquí se presentará la historia del Resguardo.',
        provisional: true,
        elementos: [
            { titulo: 'Apartado de ejemplo 1', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 1, publicado: true },
            { titulo: 'Apartado de ejemplo 2', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', orden: 2, publicado: true }
        ]
    },
    galeria: {
        titulo: 'Galería',
        descripcion: 'Contenido provisional: aquí se mostrarán fotografías y videos autorizados.',
        provisional: true,
        elementos: [
            { titulo: 'Fotografía de ejemplo 1', texto: 'Espacio provisional para una fotografía autorizada.', imagen: '', orden: 1, publicado: true },
            { titulo: 'Fotografía de ejemplo 2', texto: 'Espacio provisional para una fotografía autorizada.', imagen: '', orden: 2, publicado: true }
        ]
    },
    eventos: {
        titulo: 'Eventos',
        descripcion: 'Contenido provisional: aquí se publicarán los eventos del Resguardo.',
        provisional: true,
        elementos: [
            { titulo: 'Evento de ejemplo 1', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', fecha: '', orden: 1, publicado: true },
            { titulo: 'Evento de ejemplo 2', texto: 'Texto provisional. Aquí irá la descripción cuando se cuente con información validada.', imagen: '', fecha: '', orden: 2, publicado: true }
        ]
    }
};