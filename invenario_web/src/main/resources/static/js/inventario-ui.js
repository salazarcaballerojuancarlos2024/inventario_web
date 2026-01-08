/**
 * INVENTARIO-UI.JS
 * Versión 2026: Sincronización Blindada y Control de Coordenadas
 */

function mostrarSeccion(idSeccion) {
    console.log("📂 Cambiando a sección:", idSeccion);
    
    const secciones = [
        'vista-bienvenida', 
        'vista-almacen', 
        'vista-gestion-plantas', 
        'vista-Datos', 
        'vista-plano'
    ];

    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        if (id === idSeccion) {
            el.classList.remove('seccion-oculta');
            el.classList.add('seccion-visible'); 
            
            if (id === 'vista-bienvenida') {
                el.style.display = "flex";
            } else if (id === 'vista-plano' || id === 'vista-almacen') {
                el.style.display = "flex"; 
            } else {
                el.style.display = "block";
            }
        } else {
            el.classList.add('seccion-oculta');
            el.classList.remove('seccion-visible');
            el.style.display = "none";
        }
    });

    if (idSeccion === 'vista-almacen' || idSeccion === 'vista-plano') {
        document.querySelectorAll('.drag-item').forEach(icono => {
            icono.style.position = 'absolute';
            icono.style.top = '0';
            icono.style.left = '0';
            
            const x = icono.getAttribute('data-x') || 0;
            const y = icono.getAttribute('data-y') || 0;
            icono.style.transform = `translate(${x}px, ${y}px)`;
        });

        setTimeout(() => {
            if (typeof inicializarArrastreSegunVista === 'function') {
                inicializarArrastreSegunVista();
            }
        }, 250);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seccion = urlParams.get('seccion');
    mostrarSeccion(seccion || 'vista-bienvenida');
});

/**
 * GESTIÓN DEL MODAL DE EDICIÓN
 * Se captura la posición del icono para que no se pierda al guardar
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

    // Rellenar campos visibles
    for (let id in campos) {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SPAN') el.innerText = campos[id];
            else el.value = campos[id];
        }
    }

    // Lógica para el tipo de equipo
    const selectorTipo = document.getElementById('inputTipo');
    if (selectorTipo) {
        const t = tipo ? tipo.toLowerCase() : '';
        selectorTipo.value = t.includes('port') ? 'Portátil' : 'PC';
    }

    // PERSISTENCIA DE COORDENADAS: Buscamos el icono para obtener su X e Y actuales
    const icono = document.getElementById(tag);
    if (icono) {
        const xActual = icono.getAttribute('data-x') || 0;
        const yActual = icono.getAttribute('data-y') || 0;
        
        // Seteamos los inputs ocultos para que viajen en el FormData
        const inX = document.getElementById('inputPosX');
        const inY = document.getElementById('inputPosY');
        if (inX) inX.value = xActual;
        if (inY) inY.value = yActual;

        console.log(`📍 Posición capturada para el modal: X:${xActual}, Y:${yActual}`);
    }

    if (window.modalInstancia) window.modalInstancia.show();
}

function enviarFormularioEdit() {
    const form = document.getElementById('formEditAsset');
    if (!form) return;

    // 1. Extraemos los datos del formulario
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // 2. FORZADO DE TIPOS: Convertimos explícitamente a números enteros
    // Esto es vital para que el Map<String, Object> de Java reconozca los valores
    data.posX = parseInt(document.getElementById('inputPosX').value) || 0;
    data.posY = parseInt(document.getElementById('inputPosY').value) || 0;
    
    // Aseguramos que el plantaId también viaje como número
    if (data.plantaId) {
        data.plantaId = parseInt(data.plantaId);
    }

    console.log("🚀 Enviando actualización blindada:", data);

    if (typeof actualizarAssetAPI === 'function') {
        actualizarAssetAPI(data).then(res => {
            if (res.ok) {
                if (window.modalInstancia) window.modalInstancia.hide();
                // Recargamos para asentar los cambios en el plano
                location.reload(); 
            } else {
                alert("Error al guardar: " + (res.error || "Consulte la consola"));
            }
        });
    }
}

/**
 * INTERACCIÓN VISUAL
 */
function manejarClickIcono(el, ev) {
    if (ev) ev.stopPropagation();

    if (el.classList.contains('interact-dragging') || el.getAttribute('data-was-dragging') === 'true') {
        return; 
    }

    const tag = el.getAttribute('data-tag');
    const fila = document.getElementById('fila-' + tag);
    
    if (fila) {
        document.querySelectorAll('.fila-resaltada').forEach(f => f.classList.remove('fila-resaltada'));
        fila.classList.add('fila-resaltada');
        fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const btnEditar = fila.querySelector('button[onclick^="abrirModalUpdate"]');
        if (btnEditar) btnEditar.click();
    }
}

function resaltarFila(tag, activar) {
    const fila = document.getElementById('fila-' + tag);
    const icono = document.getElementById(tag); 
    
    if (fila) {
        activar ? fila.classList.add('fila-resaltada') : fila.classList.remove('fila-resaltada');
    }

    if (icono) {
        icono.style.filter = activar ? "drop-shadow(0 0 10px #2e7d32) brightness(1.2)" : "none";
        icono.style.zIndex = activar ? "1000" : "50";
        
        const tooltip = icono.querySelector('.tooltip-datos');
        if (tooltip) tooltip.style.opacity = activar ? "1" : "0";
    }
}

function bridgeResaltar(el, estado) {
    if (!el) return;
    const tag = el.getAttribute('data-tag');
    resaltarFila(tag, estado);
}

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

/**
 * Función puente para leer los datos del icono y abrir el modal
 * Soluciona las restricciones de Thymeleaf 3.1+
 */
function prepararModalDesdeIcono(elemento) {
    // Extraer datos de los atributos data-
    const tag = elemento.getAttribute('data-tag');
    const user = elemento.getAttribute('data-user');
    const ram = elemento.getAttribute('data-ram');
    const cpu = elemento.getAttribute('data-cpu');
    const disco = elemento.getAttribute('data-disco');
    const so = elemento.getAttribute('data-so');
    const otros = elemento.getAttribute('data-otros');
    const plantaId = elemento.getAttribute('data-planta-id');
    const tipo = elemento.getAttribute('data-tipo');

    // Llamar a la función que ya tenías definida
    abrirModalUpdate(tag, user, ram, cpu, disco, so, otros, plantaId, tipo);
}

// Variable global que definiremos al principio de tu JS
let esNuevoAsset = false;

async function enviarFormularioModal() {
    const tag = document.getElementById('inputAssetTag').value;
    if (!tag) return alert("El Asset Tag es obligatorio");

    // Si esNuevoAsset es true -> Crear. Si es false -> Actualizar.
    const url = esNuevoAsset ? '/assets/crear' : '/assets/actualizar-datos';
    
    const payload = {
        assetTag: tag,
        nombreUsuario: document.getElementById('inputUsuario').value,
        ram: document.getElementById('inputRam').value,
        cpu: document.getElementById('inputCpu').value,
        disco: document.getElementById('inputDisco').value,
        versionSo: document.getElementById('inputSo').value,
        otros: document.getElementById('inputOtros').value,
        plantaId: document.getElementById('inputPlanta').value,
        tipoEquipo: document.getElementById('inputTipo').value,
        posX: document.getElementById('inputPosX').value,
        posY: document.getElementById('inputPosY').value
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        location.reload(); 
    } else {
        const error = await response.json();
        alert("Error: " + error.error);
    }
}