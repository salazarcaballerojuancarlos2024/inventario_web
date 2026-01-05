function initInteract() {
    interact('.drag-item').draggable({
        inertia: true,
        modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: false })],
        listeners: {
            start(event) { event.target.style.zIndex = "1000"; },
            move(event) {
                const target = event.target;
                const tag = target.getAttribute('data-tag');
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                
                // Sincronizar UI
                const ttX = target.querySelector('.tt-pos-x');
                const ttY = target.querySelector('.tt-pos-y');
                if(ttX) ttX.innerText = Math.round(x);
                if(ttY) ttY.innerText = Math.round(y);

                const tX = document.getElementById('table-x-' + tag);
                const tY = document.getElementById('table-y-' + tag);
                if(tX) tX.innerText = Math.round(x);
                if(tY) tY.innerText = Math.round(y);
            },
            end(event) {
                event.target.style.zIndex = "50";
                const tag = event.target.getAttribute('data-tag');
                actualizarPosicionSolo(tag, Math.round(event.target.getAttribute('data-x')), Math.round(event.target.getAttribute('data-y')));
            }
        }
    });

    interact('.dropzone').dropzone({
        overlap: 0.1,
        ondragenter: e => e.target.classList.add('drop-active'),
        ondragleave: e => e.target.classList.remove('drop-active'),
        ondrop: e => {
            e.target.classList.remove('drop-active');
            const tag = e.relatedTarget.getAttribute('data-tag');
            const pId = e.target.getAttribute('data-planta-id');
            const nombre = e.target.innerText.trim();
            if (confirm(`¿Trasladar ${tag} a ${nombre}?`)) moverAssetAPlanta(tag, pId);
        }
    });
}