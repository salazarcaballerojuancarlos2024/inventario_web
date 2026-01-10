/**
 * ==================================================================================
 * INVENTARIO-DRAG.JS - Versión Corregida 2026
 * Solución: Arrastre fluido y eliminación de saltos al guardar
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
            move: manejarMovimientoArrastre,
            end: manejarFinArrastre
        }
    });
    configurarDropzones();
}

function configurarArrastreAlmacen() {
    interact('.drag-item').draggable({
        inertia: false,
        autoScroll: false,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: '#contenedor-almacen',
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
 * HANDLERS MEJORADOS
 */

function manejarInicioArrastre(event) {
    const target = event.target;
    target.classList.add('interact-dragging');
    target.style.zIndex = "10000";
    
    // IMPORTANTE: Al empezar, leemos la posición actual en píxeles acumulados
    // Si es la primera vez que se mueve tras cargar, será 0.
    let x = parseFloat(target.getAttribute('data-x')) || 0;
    let y = parseFloat(target.getAttribute('data-y')) || 0;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function manejarMovimientoArrastre(event) {
    const target = event.target;
    
    // Calculamos el nuevo desplazamiento acumulado en píxeles
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // APLICACIÓN VISUAL: Mantenemos el anclaje central (-50%) 
    // y sumamos los píxeles que se está moviendo el ratón
    target.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    // Actualización de UI opcional durante el movimiento
    const container = target.parentElement;
    if (container) {
        const rect = container.getBoundingClientRect();
        // Obtener porcentajes iniciales (donde estaba antes de moverlo)
        const initX = parseFloat(target.style.left) || 0;
        const initY = parseFloat(target.style.top) || 0;
        // Calcular porcentaje actual sumando el desplazamiento
        const currentXPct = initX + (x / rect.width * 100);
        const currentYPct = initY + (y / rect.height * 100);
        actualizarUIInfo(target.getAttribute('data-tag'), currentXPct, currentYPct);
    }
}

function manejarFinArrastre(event) {
    const target = event.target;
    const container = target.parentElement;
    
    if (container) {
        const rect = container.getBoundingClientRect();
        
        // Píxeles totales que se ha movido el icono desde su origen
        const dragX = parseFloat(target.getAttribute('data-x')) || 0;
        const dragY = parseFloat(target.getAttribute('data-y')) || 0;

        // Convertimos esos píxeles a % respecto al contenedor
        const deltaXPct = (dragX / rect.width) * 100;
        const deltaYPct = (dragY / rect.height) * 100;

        // Obtenemos el % original (el que viene de la base de datos o style)
        const oldXPct = parseFloat(target.style.left) || 0;
        const oldYPct = parseFloat(target.style.top) || 0;

        // NUEVA POSICIÓN FINAL EN %
        const finalXPct = oldXPct + deltaXPct;
        const finalYPct = oldYPct + deltaYPct;

        // 1. Aplicamos al estilo inmediatamente para que el botón "Guardar" lo lea
        target.style.left = finalXPct.toFixed(4) + '%';
        target.style.top = finalYPct.toFixed(4) + '%';
        
        // 2. Guardamos en atributos de seguridad
        target.setAttribute('data-x-pct', finalXPct.toFixed(4));
        target.setAttribute('data-y-pct', finalYPct.toFixed(4));

        // 3. RESETEO DE TRANSFORM: Volvemos al estado limpio para evitar el salto
        target.style.transform = 'translate(-50%, -50%)';
        target.setAttribute('data-x', 0);
        target.setAttribute('data-y', 0);

        actualizarUIInfo(target.getAttribute('data-tag'), finalXPct, finalYPct);
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