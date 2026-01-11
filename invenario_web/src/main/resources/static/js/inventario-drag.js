/**
 * ==================================================================================
 * INVENTARIO-DRAG.JS - Versión Unificada 3/4 Boundaries (2026)
 * Permite arrastre al sidebar derecho bloqueando los otros 3 lados.
 * ==================================================================================
 */

function inicializarArrastreSegunVista() {
    const vistaPlanta = document.getElementById('vista-plano');
    const vistaAlmacen = document.getElementById('vista-almacen');

    interact('.drag-item').unset();
    interact('.planta-dropzone').unset();

    if (vistaPlanta && !vistaPlanta.classList.contains('seccion-oculta')) {
        configurarArrastrePlanta();
    } else if (vistaAlmacen && !vistaAlmacen.classList.contains('seccion-oculta')) {
        configurarArrastreAlmacen();
    }
}

function configurarArrastrePlanta() {
    interact('.drag-item').draggable({
        inertia: false,
        autoScroll: false,
        listeners: {
            start: manejarInicioArrastre,
            move: manejarMovimientoConPuertaDerecha,
            end: manejarFinArrastre
        }
    });
    configurarDropzones();
}

function configurarArrastreAlmacen() {
    interact('.drag-item').draggable({
        inertia: false,
        autoScroll: false,
        listeners: {
            start: manejarInicioArrastre,
            move: manejarMovimientoConPuertaDerecha,
            end: manejarFinArrastre
        }
    });
    configurarDropzones();
}

/**
 * LÓGICA DE MOVIMIENTO CON RESTRICCIÓN INTELIGENTE
 * Bloquea: Superior, Inferior e Izquierda para no salirse del mapa/almacén.
 * Permite: Derecha para alcanzar las dropzones del sidebar.
 */
function manejarMovimientoConPuertaDerecha(event) {
    const target = event.target;
    const container = target.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // 1. Calculamos el desplazamiento acumulado propuesto
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // 2. Calculamos la posición absoluta REAL en píxeles que tendría el icono
    // (Posición inicial left/top + desplazamiento acumulado)
    const currentLeftPx = (parseFloat(target.style.left) / 100) * rect.width + x;
    const currentTopPx = (parseFloat(target.style.top) / 100) * rect.height + y;

    // --- APLICAR RESTRICCIONES (Bloqueo si se intenta salir de los 3 bordes) ---

    // Bloqueo Izquierdo: Si la posición es < 0, anulamos el cambio en X
    if (currentLeftPx < 0) {
        x -= event.dx;
    }

    // Bloqueo Superior e Inferior: Si se sale de los límites verticalmente, anulamos cambio en Y
    if (currentTopPx < 0 || currentTopPx > rect.height) {
        y -= event.dy;
    }

    // NOTA: No existe restricción para currentLeftPx > rect.width (Lado derecho abierto)

    // 3. Aplicamos el resultado visualmente
    target.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    // 4. Actualizamos Tooltips y Tablas en tiempo real
    const initX = parseFloat(target.style.left) || 0;
    const initY = parseFloat(target.style.top) || 0;
    const currentXPct = initX + (x / rect.width * 100);
    const currentYPct = initY + (y / rect.height * 100);
    actualizarUIInfo(target.getAttribute('data-tag'), currentXPct, currentYPct);
}

/**
 * HANDLERS DE INICIO Y FIN
 */

function manejarInicioArrastre(event) {
    const target = event.target;
    target.classList.add('interact-dragging');
    target.style.zIndex = "10000"; // Siempre por encima de todo
    
    let x = parseFloat(target.getAttribute('data-x')) || 0;
    let y = parseFloat(target.getAttribute('data-y')) || 0;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function manejarFinArrastre(event) {
    const target = event.target;
    const container = target.parentElement;
    
    if (container) {
        const rect = container.getBoundingClientRect();
        const dragX = parseFloat(target.getAttribute('data-x')) || 0;
        const dragY = parseFloat(target.getAttribute('data-y')) || 0;

        const initialLeftPx = (parseFloat(target.style.left) / 100) * rect.width;
        const initialTopPx = (parseFloat(target.style.top) / 100) * rect.height;

        const newLeftPx = initialLeftPx + dragX;
        const newTopPx = initialTopPx + dragY;

        const finalXPct = (newLeftPx / rect.width) * 100;
        const finalYPct = (newTopPx / rect.height) * 100;

        target.style.setProperty('transition', 'none', 'important');
        target.style.left = finalXPct.toFixed(4) + '%';
        target.style.top = finalYPct.toFixed(4) + '%';
        
        target.style.transform = 'translate(-50%, -50%)';

        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);
        target.setAttribute('data-x-pct', finalXPct.toFixed(4));
        target.setAttribute('data-y-pct', finalYPct.toFixed(4));
        
        actualizarUIInfo(target.getAttribute('data-tag'), finalXPct, finalYPct);
        void target.offsetWidth; 
    }

    target.classList.remove('interact-dragging');
    target.style.zIndex = "50"; 
}

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

function actualizarUIInfo(tag, x, y) {
    const fx = x.toFixed(2);
    const fy = y.toFixed(2);
    const ids = [`table-x-${tag}`, `table-y-${tag}`, `tt-x-${tag}`, `tt-y-${tag}`];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (id.includes('x') ? fx : fy) + '%';
    });
}