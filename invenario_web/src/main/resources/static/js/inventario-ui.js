/**
 * INVENTARIO-UI.JS
 * Versión 2026: Sincronización Blindada y Control de Coordenadas
 */

/**
 * GESTIÓN DE VISTAS (Navegación SPA interna)
 */
function mostrarSeccion(idSeccion) {
    console.log("📂 Cambiando a sección:", idSeccion);
    const secciones = ['vista-bienvenida', 'vista-almacen', 'vista-gestion-plantas', 'vista-datos-completos', 'vista-plano'];

    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === idSeccion) {
                el.classList.remove('seccion-oculta');
                el.style.display = (id === 'vista-bienvenida') ? "flex" : "block";
            } else {
                el.classList.add('seccion-oculta');
                el.style.display = "none";
            }
        }
    });

    // RE-INICIALIZACIÓN CRÍTICA
    if (idSeccion === 'vista-almacen' || idSeccion === 'vista-plano') {
        // Garantizamos que los iconos respeten el sistema de coordenadas (0,0) antes de arrastrar
        document.querySelectorAll('.drag-item').forEach(icono => {
            icono.style.position = 'absolute';
            icono.style.top = '0';
            icono.style.left = '0';
        });

        // Timeout para asegurar que el DOM se asentó antes de bindiar Interact.js
        setTimeout(() => {
            if (typeof inicializarArrastre === 'function') inicializarArrastre();
        }, 150);
    }
}

// Lógica de inicio
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seccion = urlParams.get('seccion');
    mostrarSeccion(seccion || 'vista-bienvenida');
});

/**
 * GESTIÓN DEL MODAL DE EDICIÓN
 */
function abrirModalUpdate(tag, user, ram, cpu, disco, so, otros, plantaId, tipo) {
    console.log("🛠️ Editando:", tag);

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

    const selectorTipo = document.getElementById('inputTipo');
    if (selectorTipo) {
        const t = tipo ? tipo.toLowerCase() : '';
        selectorTipo.value = t.includes('port') ? 'Portátil' : 'PC';
    }

    // PRESERVACIÓN DE COORDENADAS: La fuente de verdad es el atributo del icono
    const icono = document.getElementById('icono-' + tag);
    const form = document.getElementById('formEditAsset');
    if (icono && form) {
        form.setAttribute('data-temp-x', icono.getAttribute('data-x') || 0);
        form.setAttribute('data-temp-y', icono.getAttribute('data-y') || 0);
    }

    if (window.modalInstancia) window.modalInstancia.show();
}

function enviarFormularioEdit() {
    const form = document.getElementById('formEditAsset');
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Recuperamos las coordenadas exactas que el icono tenía al abrir el modal
    data.posX = Math.round(parseFloat(form.getAttribute('data-temp-x'))) || 0;
    data.posY = Math.round(parseFloat(form.getAttribute('data-temp-y'))) || 0;

    if (typeof actualizarAssetAPI === 'function') {
        actualizarAssetAPI(data).then(res => {
            if (res.ok) {
                if (window.modalInstancia) window.modalInstancia.hide();
                location.reload(); 
            }
        });
    }
}

/**
 * INTERACCIÓN VISUAL
 */
function manejarClickIcono(el, ev) {
    if (ev) ev.stopPropagation();

    // Si el elemento se está moviendo o acaba de soltarse, bloqueamos el click/doble click
    if (el.classList.contains('interact-dragging') || el.getAttribute('data-was-dragging') === 'true') {
        return; 
    }

    const tag = el.getAttribute('data-tag');
    const fila = document.getElementById('fila-' + tag);
    
    if (fila) {
        document.querySelectorAll('.fila-resaltada').forEach(f => f.classList.remove('fila-resaltada'));
        fila.classList.add('fila-resaltada');
        // Scroll suave hacia la fila en la tabla
        fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const btnEditar = fila.querySelector('button[onclick^="abrirModalUpdate"]');
        if (btnEditar) btnEditar.click();
    }
}

function resaltarFila(tag, activar) {
    const fila = document.getElementById('fila-' + tag);
    const icono = document.getElementById('icono-' + tag);
    if (fila) {
        activar ? fila.classList.add('fila-resaltada') : fila.classList.remove('fila-resaltada');
    }
    // Feedback visual en el icono al pasar por la tabla
    if (icono) {
        icono.style.filter = activar ? "drop-shadow(0 0 8px #2e7d32) brightness(1.1)" : "none";
        if(activar) icono.style.zIndex = "1000";
        else icono.style.zIndex = "50";
    }
}

/**
 * UTILIDADES DE TABLA
 */
function seleccionarPlanta(id) {
    window.location.href = "/?plantaId=" + id;
}

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
                if (x.innerText.toLowerCase() > y.innerText.toLowerCase()) {
                    shouldSwitch = true; break;
                }
            } else {
                if (x.innerText.toLowerCase() < y.innerText.toLowerCase()) {
                    shouldSwitch = true; break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else if (switchcount == 0 && dir == "asc") {
            dir = "desc"; switching = true;
        }
    }
    actualizarIconosOrden(n, dir);
}

function actualizarIconosOrden(columna, dir) {
    const ths = document.querySelectorAll(".table-almacen-compacta th");
    ths.forEach((th, idx) => {
        let span = th.querySelector(".sort-icon") || (th.innerHTML += ' <span class="sort-icon">↕</span>', th.querySelector(".sort-icon"));
        span.innerHTML = (idx === columna) ? (dir === "asc" ? "↑" : "↓") : "↕";
        span.style.color = (idx === columna) ? "#28a745" : "#ccc";
    });
}