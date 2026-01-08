/**
 * planta-drag.js
 * Lógica de arrastre y soltado exclusiva para la Vista de Plantas
 */

// --- CONFIGURACIÓN DE ARRASTRE ---
interact('#area-limite-planta .drag-item').draggable({
    onstart: function (event) {
        event.target.classList.add('interact-dragging');
    },
    onmove: function (event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    },
    onend: function (event) {
        event.target.classList.remove('interact-dragging');
        
        // Si no estamos cambiando de planta (no se soltó en la sidebar)
        // No hacemos nada, los cambios se guardarán masivamente con el botón "Guardar Plano"
        if (event.target.dataset.isChangingPlant) {
            delete event.target.dataset.isChangingPlant;
        }
    },
    modifiers: [
        interact.modifiers.restrictRect({
            // Restricción contra el contenedor principal para no salirse por arriba o izquierda
            restriction: '#vista-plano',
            endOnly: false
        })
    ]
});

// --- CONFIGURACIÓN DE DROPZONE (SIDEBAR DERECHA) ---
interact('.zona-drop-planta').dropzone({
    overlap: 0.1,
    ondragenter: function (event) {
        event.target.classList.add('planta-hover'); // Efecto visual en la sidebar
        event.relatedTarget.dataset.isChangingPlant = "true";
    },
    ondragleave: function (event) {
        event.target.classList.remove('planta-hover');
        delete event.relatedTarget.dataset.isChangingPlant;
    },
    ondrop: function (event) {
        const assetTag = event.relatedTarget.getAttribute('data-tag');
        const nuevaPlantaId = event.target.getAttribute('data-planta-id');
        
        event.target.classList.remove('planta-hover');
        
        // LLAMADA A TU API EXISTENTE
        if (typeof moverAssetAPlanta === 'function') {
            moverAssetAPlanta(assetTag, nuevaPlantaId);
        } else {
            console.error("La función moverAssetAPlanta no está cargada");
        }
    }
});