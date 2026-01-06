/**
 * GESTIÓN DE VISTAS (Navegación SPA interna)
 */
function mostrarSeccion(idSeccion) {
    const secciones = ['vista-bienvenida', 'vista-almacen', 'vista-gestion-plantas', 'vista-datos-completos', 'vista-plano'];

    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === idSeccion) {
                el.classList.remove('seccion-oculta');
                // Bienvenida es centrada (flex), el resto es normal (block)
                el.style.display = (id === 'vista-bienvenida') ? "flex" : "block";
            } else {
                el.classList.add('seccion-oculta');
                el.style.display = "none";
            }
        }
    });

    // Solo inicializamos funciones de inventario si NO estamos en bienvenida
    if (idSeccion !== 'vista-bienvenida') {
        if (idSeccion === 'vista-almacen' || idSeccion === 'vista-plano') {
            // Aseguramos que los iconos nazcan en modo absoluto antes de que interact.js los toque
            document.querySelectorAll('.drag-item').forEach(icono => {
                icono.style.position = 'absolute';
            });
            if (typeof inicializarArrastre === 'function') inicializarArrastre();
        }
    }
}

// Lógica de inicio al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seccion = urlParams.get('seccion');
    
    if (seccion) {
        mostrarSeccion(seccion);
    } else {
        mostrarSeccion('vista-bienvenida'); // Forzar bienvenida al entrar
    }
});

/**
 * GESTIÓN DEL MODAL DE EDICIÓN (Carga de datos)
 */
function abrirModalUpdate(tag, user, ram, cpu, disco, so, otros, plantaId, tipo) {
    console.log("Abriendo modal para:", tag);

    // 1. Rellenar los campos básicos
    const campos = {
        'tagDisplay': tag,
        'inputAssetTag': tag,
        'inputUsuario': user || '',
        'inputRam': ram || '',
        'inputCpu': cpu || '',
        'inputDisco': disco || '',
        'inputSo': so || '',
        'inputOtros': otros || '',
        'inputPlanta': plantaId
    };

    for (let id in campos) {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SPAN') el.innerText = campos[id];
            else el.value = campos[id];
        }
    }

	// 2. Ajustar el selector de tipo de equipo (Valores cortos para BD)
	    const selectorTipo = document.getElementById('inputTipo');
	    if (selectorTipo) {
	        const t = tipo ? tipo.toLowerCase() : '';
	        if (t.includes('port')) {
	            selectorTipo.value = 'Portátil';
	        } else {
	            selectorTipo.value = 'PC'; // Valor corto que sí cabe en la BD
	        }
	    }

    // 3. Lógica de preservación de coordenadas
    const iconoElemento = document.getElementById('icono-' + tag);
    const formulario = document.getElementById('formEditAsset');

    if (iconoElemento && formulario) {
        const currentX = iconoElemento.getAttribute('data-x') || 0;
        const currentY = iconoElemento.getAttribute('data-y') || 0;
        formulario.setAttribute('data-temp-x', currentX);
        formulario.setAttribute('data-temp-y', currentY);
    }

    // 4. Mostrar el modal usando la instancia global
    if (window.modalInstancia) {
        window.modalInstancia.show();
    } else {
        console.warn("⚠️ modalInstancia no encontrada, intentando inicializar...");
        const modalElement = document.getElementById('modalEditAsset');
        if (modalElement) {
            window.modalInstancia = new bootstrap.Modal(modalElement);
            window.modalInstancia.show();
        } else {
            console.error("❌ ERROR CRÍTICO: No se encuentra el elemento #modalEditAsset en el DOM.");
        }
    }
}

function enviarFormularioEdit() {
    const form = document.getElementById('formEditAsset');
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Convertimos a entero para evitar problemas de tipos en Java/BD
    data.posX = Math.round(parseFloat(form.getAttribute('data-temp-x'))) || 0;
    data.posY = Math.round(parseFloat(form.getAttribute('data-temp-y'))) || 0;

    if (typeof actualizarAssetAPI === 'function') {
        actualizarAssetAPI(data)
            .then(response => {
                if (response.ok) {
                    if (window.modalInstancia) window.modalInstancia.hide();
                    location.reload(); 
                }
            });
    }
}


/**
 * INTERACCIÓN CON ICONOS
 */
function manejarClickIcono(el, ev) {
    if (ev) ev.stopPropagation();

    // VALIDACIÓN CRÍTICA: 
    // Si tiene la clase de arrastre o el atributo de "recién arrastrado", abortamos.
    if (el.classList.contains('interact-dragging') || el.getAttribute('data-was-dragging') === 'true') {
        console.log("Ignorando click: Se detectó arrastre previo.");
        return; 
    }

    const tag = el.getAttribute('data-tag');
    
    // Resaltar fila y disparar el modal
    const fila = document.getElementById('fila-' + tag);
    if (fila) {
        document.querySelectorAll('.fila-resaltada').forEach(f => f.classList.remove('fila-resaltada'));
        fila.classList.add('fila-resaltada');
        
        const btnEditar = fila.querySelector('button[onclick^="abrirModalUpdate"]');
        if (btnEditar) {
            btnEditar.click();
        }
    }
}

function resaltarIcono(tag, activo) {
    const icono = document.getElementById('icono-' + tag);
    if (!icono) return;

    if (activo) {
        icono.style.zIndex = "3000";
        icono.style.transform = icono.style.transform.replace(/scale\([^)]*\)/, '') + " scale(1.2)";
        icono.style.filter = "drop-shadow(0 0 8px #2e7d32)";
    } else {
        icono.style.zIndex = "50";
        icono.style.transform = icono.style.transform.replace(/scale\([^)]*\)/, '').trim();
        icono.style.filter = "none";
    }
}

function resaltarFila(tag, activar) {
    const fila = document.getElementById('fila-' + tag);
    if (fila) {
        activar ? fila.classList.add('fila-resaltada') : fila.classList.remove('fila-resaltada');
    }
}

function seleccionarPlanta(id) {
    window.location.href = "/?plantaId=" + id;
}

/**
 * LÓGICA DE ORDENACIÓN DE TABLAS
 */
function ordenarTabla(n) {
    const table = document.querySelector(".table-almacen-compacta");
    if (!table) return;
    
    let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc";
    
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true; break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true; break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc"; switching = true;
            }
        }
    }
    actualizarIconosOrden(n, dir);
}

function actualizarIconosOrden(columnaActiva, direccion) {
    const ths = document.querySelectorAll(".table-almacen-compacta th");
    ths.forEach((th, index) => {
        let icon = th.querySelector(".sort-icon");
        if (!icon) {
            th.innerHTML += ' <span class="sort-icon">↕</span>';
            icon = th.querySelector(".sort-icon");
        }
        if (index === columnaActiva) {
            icon.innerHTML = direccion === "asc" ? "↑" : "↓";
            icon.style.color = "#28a745";
        } else {
            icon.innerHTML = "↕";
            icon.style.color = "";
        }
    });
}