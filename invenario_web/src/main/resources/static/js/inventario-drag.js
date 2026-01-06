function initInteract() {
    interact('.drag-item').draggable({
        inertia: true,
        modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: false })],
        listeners: {
            start(event) { 
                event.target.style.zIndex = "1000"; 
            },
            move(event) {
                const target = event.target;
                const tag = target.getAttribute('data-tag');
                
                // Cálculo de nuevas coordenadas
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                
                // Aplicar movimiento visual
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                
                // --- Sincronizar UI: TOOLTIP (dentro del icono) ---
                // Buscamos las clases específicas que pondremos en el HTML
                const ttX = target.querySelector('.tt-pos-x');
                const ttY = target.querySelector('.tt-pos-y');
                if(ttX) ttX.innerText = Math.round(x);
                if(ttY) ttY.innerText = Math.round(y);

                // --- Sincronizar UI: TABLA (fuera del mapa) ---
                const tX = document.getElementById('table-x-' + tag);
                const tY = document.getElementById('table-y-' + tag);
                if(tX) tX.innerText = Math.round(x);
                if(tY) tY.innerText = Math.round(y);
            },
            end(event) {
                event.target.style.zIndex = "50";
            }
        }
    });

    // Zonas de soltado en el Sidebar Derecho
    interact('.planta-dropzone').dropzone({
        overlap: 0.1,
        ondragenter: e => e.target.classList.add('drop-target'),
        ondragleave: e => e.target.classList.remove('drop-target'),
        ondrop: e => {
            e.target.classList.remove('drop-target');
            const tag = e.relatedTarget.getAttribute('data-tag');
            const pId = e.target.getAttribute('data-planta-id');
            const labelElement = e.target.querySelector('.dropzone-label');
            const nombrePlanta = labelElement ? labelElement.innerText.trim() : "la planta seleccionada";
            
            if (confirm(`¿Trasladar el equipo ${tag} a la ${nombrePlanta}?`)) {
                moverAssetAPlanta(tag, pId);
            }
        }
    });
}