/**
 * SISTEMA DE ARRASTRE Y SOLTADO (Interact.js)
 * Versión: Control de interferencias y bloqueo de Modales
 */
function inicializarArrastre() {
    console.log("⚓ Configurando arrastre blindado...");

    // 1. Limpieza de instancias
    interact('.drag-item').unset();
    interact('.planta-dropzone').unset();

    // Variable interna para diferenciar "Click" de "Arrastre"
    let dragTimestamp = 0;

    // 2. Configuración del Draggable
    interact('.drag-item').draggable({
        inertia: false,   
        autoScroll: true, 
        listeners: {
			start(event) {
			                const target = event.target;
			                target.classList.add('interact-dragging');
			                target.style.zIndex = "9999";

			                // LEER POSICIÓN ACTUAL: 
			                // Si el icono está en (100, 200), le decimos a Interact que empiece desde ahí
			                // y no desde (0,0), que es lo que causa el salto a la esquina.
			                const x = parseFloat(target.getAttribute('data-x')) || 0;
			                const y = parseFloat(target.getAttribute('data-y')) || 0;

			                // Forzamos el transform inicial para que el ratón "enganche" el objeto
			                target.style.transform = `translate(${x}px, ${y}px)`;
			            },
			            move(event) {
			                const target = event.target;
			                const tag = target.getAttribute('data-tag');
			                
			                // IMPORTANTE: Sumamos el movimiento al valor que YA tenía el atributo
			                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
			                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
			                
			                // Aplicamos el movimiento
			                target.style.transform = `translate(${x}px, ${y}px)`;
			                
			                // Guardamos para que el siguiente frame sepa dónde se quedó
			                target.setAttribute('data-x', x);
			                target.setAttribute('data-y', y);
			                
			                // Sincronizar tabla
			                const tX = document.getElementById('table-x-' + tag);
			                const tY = document.getElementById('table-y-' + tag);
			                if(tX) tX.innerText = Math.round(x);
			                if(tY) tY.innerText = Math.round(y);
			            },
            end(event) {
                const target = event.target;
                
                // Guardamos el momento final
                const duration = Date.now() - dragTimestamp;
                
                // Si el movimiento duró más de 200ms, marcamos como "ha sido arrastre"
                if (duration > 200) {
                    target.setAttribute('data-was-dragging', 'true');
                }

                target.style.zIndex = "50";
                
                // Retardo de limpieza para que el evento 'click' del HTML lea 'interact-dragging'
                setTimeout(() => {
                    target.classList.remove('interact-dragging');
                    target.removeAttribute('data-was-dragging');
                }, 150);
            }
        }
    });

    // 3. Configuración de Dropzones (Sidebar Derecho)
    interact('.planta-dropzone').dropzone({
        overlap: 0.1, 
        ondragenter: e => e.target.classList.add('drop-target'),
        ondragleave: e => e.target.classList.remove('drop-target'),
        ondrop: e => {
            e.target.classList.remove('drop-target');
            
            const tag = e.relatedTarget.getAttribute('data-tag');
            const pId = e.target.getAttribute('data-planta-id');
            const nombrePlanta = e.target.querySelector('.dropzone-label')?.innerText.trim() || "la planta";
            
            if (confirm(`¿Deseas trasladar el equipo ${tag} a la ${nombrePlanta}?`)) {
                if (typeof moverAssetAPlanta === 'function') {
                    moverAssetAPlanta(tag, pId);
                }
            }
        }
    });
}