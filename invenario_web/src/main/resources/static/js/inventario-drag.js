function inicializarArrastre() {
    interact('.drag-item').unset();
    interact('.planta-dropzone').unset();

    interact('.drag-item').draggable({
        inertia: false,
        autoScroll: false,
        listeners: {
            start(event) {
                const target = event.target;
                target.classList.add('interact-dragging');
                target.style.zIndex = "9999";

                // Leemos y limpiamos el valor: cambiamos comas por puntos por si acaso
                let rawX = (target.getAttribute('data-x') || "0").toString().replace(',', '.');
                let rawY = (target.getAttribute('data-y') || "0").toString().replace(',', '.');

                let x = parseFloat(rawX) || 0;
                let y = parseFloat(rawY) || 0;

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            move(event) {
                const target = event.target;
                const tag = target.getAttribute('data-tag');

                // Recuperamos la posición actual
                let currentX = parseFloat(target.getAttribute('data-x')) || 0;
                let currentY = parseFloat(target.getAttribute('data-y')) || 0;

                // Sumamos el movimiento exacto del ratón
                let newX = currentX + event.dx;
                let newY = currentY + event.dy;

                // APLICAMOS AL CSS: Usamos Template Literals para evitar errores de concatenación
                target.style.transform = `translate(${newX}px, ${newY}px)`;

                // Actualizamos atributos para el siguiente frame
                target.setAttribute('data-x', newX);
                target.setAttribute('data-y', newY);

                // Actualizar interfaz
                actualizarUIInfo(tag, newX, newY);
            },
            end(event) {
                const target = event.target;
                target.classList.remove('interact-dragging');
                target.style.zIndex = "50";
                
                target.setAttribute('data-was-dragging', 'true');
                setTimeout(() => target.setAttribute('data-was-dragging', 'false'), 200);
            }
        }
    });

    interact('.planta-dropzone').dropzone({
        overlap: 0.1,
        ondrop: e => {
            const tag = e.relatedTarget.getAttribute('data-tag');
            const pId = e.target.getAttribute('data-planta-id');
            if (confirm(`¿Mover equipo ${tag}?`)) moverAssetAPlanta(tag, pId);
        }
    });
}

function actualizarUIInfo(tag, x, y) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    
    // Sincronización con tabla y tooltip
    const ids = [`table-x-${tag}`, `table-y-${tag}`, `tt-x-${tag}`, `tt-y-${tag}`];
    ids.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (index % 2 === 0) ? rx : ry;
    });
}