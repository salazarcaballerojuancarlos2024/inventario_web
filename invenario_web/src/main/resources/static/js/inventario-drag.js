/**
 * ==================================================================================
 * INVENTARIO-DRAG.JS
 * Gestión unificada de arrastre con lógica de contexto (Almacén vs Planta)
 * ==================================================================================
 */

/**
 * FUNCIÓN SELECTORA: Decide qué lógica aplicar según la vista activa
 */
function inicializarArrastreSegunVista() {
    const vistaPlanta = document.getElementById('vista-plano');
    const vistaAlmacen = document.getElementById('vista-almacen');

    // Limpiamos cualquier instancia previa de InteractJS
    interact('.drag-item').unset();
    interact('.planta-dropzone').unset();

    if (vistaPlanta && !vistaPlanta.classList.contains('seccion-oculta')) {
        console.log("🎯 Inicializando arrastre para VISTA PLANTA");
        configurarArrastrePlanta();
    } else if (vistaAlmacen && !vistaAlmacen.classList.contains('seccion-oculta')) {
        console.log("📦 Inicializando arrastre para VISTA ALMACÉN");
        configurarArrastreAlmacen();
    }
}

/**
 * 1. CONFIGURACIÓN PARA VISTA PLANTA
 * Restricción: Bordes de la imagen (U-bloqueo), libre a la derecha.
 */
function configurarArrastrePlanta() {
    interact('.drag-item').draggable({
        inertia: false,
        autoScroll: false,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: function (x, y, element) {
                    // Busca el contenedor dinámico del plano actual
                    const container = document.querySelector('[id^="contenedor-plano-"]');
                    if (!container) return { top: 0, left: 0, bottom: 2000, right: 2000 };

                    const rect = container.getBoundingClientRect();
                    return {
                        top: rect.top,       // Bloquea arriba (cabecera)
                        left: rect.left,     // Bloquea izquierda (menú)
                        bottom: rect.bottom, // Bloquea abajo (fin del plano)
                        right: rect.right + 2000 // LIBRE a la derecha (sidebar control)
                    };
                },
                endOnly: false
            })
        ],
        listeners: {
            start: manejarInicioArrastre,
            move: manejarMovimientoArrastre,
            end: manejarFinArrastre
        }
    });

    configurarDropzones();
}

/**
 * 2. CONFIGURACIÓN PARA VISTA ALMACÉN
 * Restricción: Bordes del área superior, libre a la derecha.
 */
function configurarArrastreAlmacen() {
    interact('.drag-item').draggable({
        inertia: false,
        autoScroll: false,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: function (x, y, element) {
                    const container = document.getElementById('contenedor-almacen');
                    if (!container) return { top: 0, left: 0, bottom: 2000, right: 2000 };

                    const rect = container.getBoundingClientRect();
                    return {
                        top: rect.top,       // Bloquea arriba
                        left: rect.left,     // Bloquea izquierda (menú)
                        bottom: rect.bottom, // Bloquea abajo (tabla de datos)
                        right: rect.right + 2000 // LIBRE a la derecha (sidebar control)
                    };
                },
                endOnly: false
            })
        ],
        listeners: {
            start: manejarInicioArrastre,
            move: manejarMovimientoArrastre,
            end: manejarFinArrastre
        }
    });

    configurarDropzones();
}

/**
 * 3. CONTROLADORES COMPARTIDOS (DRAG HANDLERS)
 * Para no repetir código, la lógica de coordenadas es la misma.
 */

function manejarInicioArrastre(event) {
    const target = event.target;
    target.classList.add('interact-dragging');
    target.style.zIndex = "10000"; // Siempre por encima durante el vuelo

    let x = parseFloat(target.getAttribute('data-x').toString().replace(',', '.')) || 0;
    let y = parseFloat(target.getAttribute('data-y').toString().replace(',', '.')) || 0;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function manejarMovimientoArrastre(event) {
    const target = event.target;
    const tag = target.getAttribute('data-tag');

    let currentX = parseFloat(target.getAttribute('data-x')) || 0;
    let currentY = parseFloat(target.getAttribute('data-y')) || 0;

    let newX = currentX + event.dx;
    let newY = currentY + event.dy;

    target.style.transform = `translate(${newX}px, ${newY}px)`;
    target.setAttribute('data-x', newX);
    target.setAttribute('data-y', newY);

    // Actualizamos UI (Tablas o Tooltips)
    if (typeof actualizarUIInfo === "function") {
        actualizarUIInfo(tag, newX, newY);
    }
}

function manejarFinArrastre(event) {
    const target = event.target;
    target.classList.remove('interact-dragging');
    target.style.zIndex = "50"; // Vuelve a su capa normal
    
    target.setAttribute('data-was-dragging', 'true');
    setTimeout(() => target.setAttribute('data-was-dragging', 'false'), 200);
}

/**
 * 4. CONFIGURACIÓN DE DROPZONES (SIDEBAR DERECHA)
 */
function configurarDropzones() {
    interact('.planta-dropzone').dropzone({
        overlap: 0.1,
        ondrop: e => {
            const tag = e.relatedTarget.getAttribute('data-tag');
            const pId = e.target.getAttribute('data-planta-id');
            if (confirm(`¿Mover equipo ${tag}?`)) {
                moverAssetAPlanta(tag, pId);
            }
        }
    });
}

/**
 * Sincronización de coordenadas con elementos de texto
 */
function actualizarUIInfo(tag, x, y) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const ids = [`table-x-${tag}`, `table-y-${tag}`, `tt-x-${tag}`, `tt-y-${tag}`];
    ids.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (index % 2 === 0) ? rx : ry;
    });
}