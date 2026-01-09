/**
 * INVENTARIO-UI.JS 
 * Versión Final 2026 corregida: Gestión de duplicados, creación, borrado y ORDENACIÓN
 */

// --- VARIABLES GLOBALES ---
let currentPage = 1;
let esNuevoAsset = false; 
let sortDirection = 1;   // 1 para ASC, -1 para DESC
let currentSortCol = -1; // Índice de la columna seleccionada

/**
 * 1. NAVEGACIÓN ENTRE SECCIONES
 */
function mostrarSeccion(idSeccion) {
    const secciones = ['vista-bienvenida', 'vista-almacen', 'vista-gestion-plantas', 'vista-Datos', 'vista-plano'];
    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === idSeccion) {
            el.classList.remove('seccion-oculta');
            el.classList.add('seccion-visible'); 
            el.style.display = (id === 'vista-plano' || id === 'vista-almacen' || id === 'vista-bienvenida') ? "flex" : "block";
        } else {
            el.classList.add('seccion-oculta');
            el.classList.remove('seccion-visible');
            el.style.display = "none";
        }
    });

    if (idSeccion === 'vista-Datos') {
        actualizarTablaDinamica();
        setTimeout(habilitarResizerColumnas, 100); 
    }

    if (idSeccion === 'vista-plano' || idSeccion === 'vista-almacen') {
        setTimeout(() => {
            document.querySelectorAll('.drag-item').forEach(icono => {
                const x = icono.getAttribute('data-x') || 0;
                const y = icono.getAttribute('data-y') || 0;
                icono.style.transform = `translate(${x}px, ${y}px)`;
            });
            if (typeof inicializarArrastreSegunVista === 'function') inicializarArrastreSegunVista();
        }, 200);
    }
}

/**
 * 2. LÓGICA DE TABLA (PAGINACIÓN, FILTROS Y ORDENACIÓN)
 */
function ejecutarFiltroYPaginacion() { currentPage = 1; actualizarTablaDinamica(); }
function cambiarPaginacion() { currentPage = 1; actualizarTablaDinamica(); }

// NUEVA FUNCIÓN: Ordenación compatible
function ordenarTablaPaginada(n) {
    const table = document.getElementById("tablaAssets");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr.fila-asset"));

    if (currentSortCol === n) {
        sortDirection *= -1;
    } else {
        sortDirection = 1;
        currentSortCol = n;
    }

    table.querySelectorAll("th .sort-icon").forEach((span, idx) => {
        span.innerText = "↕";
        if (idx === n) span.innerText = sortDirection === 1 ? "↑" : "↓";
    });

    rows.sort((a, b) => {
        // Obtenemos el texto limpio de la celda n
        const valA = a.children[n].innerText.trim().toLowerCase();
        const valB = b.children[n].innerText.trim().toLowerCase();
        
        // Verificamos si es un número (para RAM, Disco, etc.)
        const numA = parseFloat(valA.replace(/[^\d.-]/g, ''));
        const numB = parseFloat(valB.replace(/[^\d.-]/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
            return (numA - numB) * sortDirection;
        }
        return valA.localeCompare(valB) * sortDirection;
    });

    // Re-insertar filas ordenadas
    rows.forEach(row => tbody.appendChild(row));

    // Volver a la página 1 y refrescar la vista paginada
    currentPage = 1;
    actualizarTablaDinamica();
}

function actualizarTablaDinamica() {
    const table = document.getElementById("tablaAssets");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr.fila-asset"));
    const searchInput = document.getElementById("inputBusquedaAssets");
    const searchFilter = (searchInput?.value || "").trim().toLowerCase();
    const maxRows = parseInt(document.getElementById("maxRows")?.value || 10);

    let matches = [];

    // 1. FILTRADO, RESALTADO Y ASIGNACIÓN DE PRIORIDAD
    rows.forEach(row => {
        let firstMatchCol = -1;
        row.style.display = "none"; // Ocultar por defecto
        
        // Solo buscamos en las celdas de datos (típicamente las primeras 9 antes de 'Acciones')
        const cells = Array.from(row.cells).slice(0, 9);

        // Limpiar resaltados previos (quitar etiquetas <mark>)
        cells.forEach(cell => {
            if (cell.querySelector('mark.resaltado-busqueda')) {
                cell.innerHTML = cell.innerText; 
            }
        });

        if (searchFilter === "") {
            // Si no hay búsqueda, todos son iguales (prioridad máxima)
            matches.push({ row, priority: 99, text: "" });
            return;
        }

        // Buscar coincidencia columna por columna
        cells.forEach((cell, idx) => {
            const originalText = cell.innerText;
            const pos = originalText.toLowerCase().indexOf(searchFilter);
            
            if (pos > -1) {
                // Si es la primera vez que encontramos el filtro en esta fila, guardamos la columna
                if (firstMatchCol === -1) firstMatchCol = idx;

                // Aplicar el resaltado visual
                const regex = new RegExp(`(${searchFilter})`, 'gi');
                cell.innerHTML = originalText.replace(regex, `<mark class="resaltado-busqueda">$1</mark>`);
            }
        });

        // Si hubo coincidencia, guardamos para ordenar
        if (firstMatchCol > -1) {
            matches.push({ 
                row, 
                priority: firstMatchCol, 
                text: cells[firstMatchCol].innerText.toLowerCase() 
            });
        }
    });

    // 2. ORDENACIÓN POR RELEVANCIA
    // Prioridad 0 (Tag) aparece antes que Prioridad 1 (Usuario), etc.
    if (searchFilter !== "") {
        matches.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.text.localeCompare(b.text); // Si empatan en columna, orden alfabético
        });
    }

    // 3. RE-INSERCIÓN FÍSICA EN EL DOM (Necesario para que el orden se aplique)
    matches.forEach(obj => tbody.appendChild(obj.row));

    // 4. PAGINACIÓN SOBRE EL NUEVO ORDEN
    const totalVisible = matches.length;
    const totalPages = Math.ceil(totalVisible / maxRows);
    
    // Asegurar que la página actual no quede huérfana tras un filtro
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    const start = (currentPage - 1) * maxRows;
    const end = start + maxRows;

    matches.slice(start, end).forEach(obj => obj.row.style.display = "");
    
    // 5. ACTUALIZAR CONTADORES
    const countPageEl = document.getElementById("countPage");
    const countTotalEl = document.getElementById("countTotal");
    if (countPageEl) countPageEl.innerText = matches.slice(start, end).length;
    if (countTotalEl) countTotalEl.innerText = totalVisible;

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const wrapper = document.getElementById("pagination-wrapper");
    if (!wrapper) return;
    wrapper.innerHTML = "";
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="javascript:void(0)">${i}</a>`;
        li.onclick = () => { 
            currentPage = i; 
            actualizarTablaDinamica(); 
            // Scroll arriba opcional al cambiar página
            const cardBody = document.querySelector('#vista-Datos .card-body');
            if (cardBody) cardBody.scrollTop = 0;
        };
        wrapper.appendChild(li);
    }
}

/**
 * 3. GESTIÓN DE MODALES Y OPERACIONES
 */

function abrirModalCrear() {
    esNuevoAsset = true; 
    const form = document.getElementById('formEditAsset');
    if (form) form.reset();
    document.getElementById('tagDisplay').innerText = "Nuevo Activo";
    const inputTag = document.getElementById('inputAssetTag');
    inputTag.value = '';
    inputTag.readOnly = false;
    
    // Reset campos ocultos y por defecto
    document.getElementById('inputPosX').value = 0;
    document.getElementById('inputPosY').value = 0;
    document.getElementById('inputPlanta').value = "1"; 
    document.getElementById('inputTipo').value = "PC";
    if (window.modalInstancia) window.modalInstancia.show();
}

async function confirmarEliminarAsset(tag) {
    if (!tag || !confirm(`¿Eliminar equipo ${tag}?`)) return;
    try {
        const response = await fetch(`/assets/eliminar/${tag}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) { location.reload(); } 
        else { const err = await response.json(); alert("Error: " + (err.error || "No eliminado")); }
    } catch (error) { alert("Error de conexión."); }
}

function abrirModalUpdate(tag, usuario, ram, cpu, disco, so, otros, plantaId, tipo) {
    esNuevoAsset = false; 
    document.getElementById('tagDisplay').innerText = tag;
    const inputTag = document.getElementById('inputAssetTag');
    inputTag.value = tag;
    inputTag.readOnly = true;

    document.getElementById('inputUsuario').value = usuario || '';
    document.getElementById('inputRam').value = ram || '';
    document.getElementById('inputCpu').value = cpu || '';
    document.getElementById('inputDisco').value = disco || '';
    document.getElementById('inputSo').value = so || '';
    document.getElementById('inputOtros').value = otros || '';
    if (plantaId) document.getElementById('inputPlanta').value = plantaId;
    if (tipo) document.getElementById('inputTipo').value = tipo;

    const icono = document.getElementById(tag) || document.getElementById('icono-' + tag);
    document.getElementById('inputPosX').value = icono ? (icono.getAttribute('data-x') || 0) : 0;
    document.getElementById('inputPosY').value = icono ? (icono.getAttribute('data-y') || 0) : 0;
    if (window.modalInstancia) window.modalInstancia.show();
}

function prepararModalDesdeIcono(elemento) {
    let d = elemento.dataset;
    let tag = d.tag || elemento.getAttribute('data-tag');
    
    // Si faltan datos en el botón, intentamos buscarlos de nuevo
    if (!d.user || d.user === "") {
        const btnTabla = document.querySelector(`button[data-tag="${tag}"][data-user]`);
        if (btnTabla) d = btnTabla.dataset;
    }

    // Usamos d.plantaId (que viene de data-planta-id)
    abrirModalUpdate(
        tag, 
        d.user || d.nombreUsuario, 
        d.ram, 
        d.cpu, 
        d.disco, 
        d.so || d.versionSo, 
        d.otros, 
        d.plantaId || d.planta || '1', 
        d.tipo || d.tipoEquipo
    );
}

async function enviarFormularioModal() {
    const tag = document.getElementById('inputAssetTag').value.trim();
    if (!tag) return alert("Tag obligatorio");
    const payload = {
        assetTag: tag,
        nombreUsuario: document.getElementById('inputUsuario').value,
        ram: document.getElementById('inputRam').value,
        cpu: document.getElementById('inputCpu').value,
        disco: document.getElementById('inputDisco').value,
        versionSo: document.getElementById('inputSo').value,
        otros: document.getElementById('inputOtros').value,
        plantaId: parseInt(document.getElementById('inputPlanta').value) || 1,
        tipoEquipo: document.getElementById('inputTipo').value,
        posX: parseInt(document.getElementById('inputPosX').value) || 0,
        posY: parseInt(document.getElementById('inputPosY').value) || 0
    };
    const url = esNuevoAsset ? '/assets/crear' : '/assets/actualizar-datos';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) { location.reload(); } 
        else { alert("Error: " + (result.error || "Fallo al guardar")); }
    } catch (e) { alert("Error de comunicación."); }
}

/**
 * 4. REDIMENSIONADO Y AUXILIARES
 */
function habilitarResizerColumnas() {
    const table = document.getElementById('tablaAssets');
    if (!table) return;
    table.querySelectorAll('thead th').forEach((col) => {
        if (col.querySelector('.resizer')) return;
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        col.appendChild(resizer);
        resizer.addEventListener('mousedown', function (e) {
            const startX = e.pageX; const startWidth = col.offsetWidth;
            const onMouseMove = (me) => {
                const w = startWidth + (me.pageX - startX);
                if (w > 50) col.style.width = w + 'px';
            };
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}

function manejarClickIcono(el, ev) { if (ev) ev.stopPropagation(); prepararModalDesdeIcono(el); }
function editarDesdeTabla(btn) { prepararModalDesdeIcono(btn); }
function seleccionarPlanta(id) { window.location.href = "/?plantaId=" + id; }

window.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('modalEditAsset');
    if (modalEl) window.modalInstancia = new bootstrap.Modal(modalEl);
    const urlParams = new URLSearchParams(window.location.search);
    const seccionQuery = urlParams.get('seccion');
    const plantaQuery = urlParams.get('plantaId');
    if (plantaQuery) mostrarSeccion('vista-plano');
    else if (seccionQuery) mostrarSeccion(seccionQuery);
    else mostrarSeccion('vista-bienvenida');
});

// Asegúrate de que esta función se llame exactamente como en el onclick de tu modalest.html
async function enviarFormularioEdit() {
    const tagInput = document.getElementById('inputAssetTag');
    const tag = tagInput.value.trim();
    
    if (!tag) {
        alert("El Asset Tag es obligatorio");
        return;
    }

    // Construimos el objeto con las llaves que espera el Map de AssetController.java
    const payload = {
        assetTag: tag,
        nombreUsuario: document.getElementById('inputUsuario').value || "",
        ram: document.getElementById('inputRam').value || "",
        cpu: document.getElementById('inputCpu').value || "",
        disco: document.getElementById('inputDisco').value || "",
        versionSo: document.getElementById('inputSo').value || "",
        otros: document.getElementById('inputOtros').value || "",
        plantaId: document.getElementById('inputPlanta').value || "1",
        tipoEquipo: document.getElementById('inputTipo').value || "PC",
        // Si es nuevo, forzamos posiciones a 0. Si es edición, se mantienen las que tenga.
        posX: esNuevoAsset ? 0 : (parseInt(document.getElementById('inputPosX').value) || 0),
        posY: esNuevoAsset ? 0 : (parseInt(document.getElementById('inputPosY').value) || 0)
    };

    // Determinamos la ruta según la intención
    const url = esNuevoAsset ? '/assets/crear' : '/assets/actualizar-datos';
    
    console.log(esNuevoAsset ? "🚀 CREANDO NUEVO ASSET" : "📝 ACTUALIZANDO ASSET EXISTENTE");

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(esNuevoAsset ? "Activo creado correctamente" : "Activo actualizado correctamente");
            location.reload();
        } else {
            // Aquí capturamos el mensaje de "Tag Duplicado" que envía el servidor
            alert("Error del servidor: " + (result.error || "Verifique los datos."));
        }
    } catch (error) {
        console.error("Error crítico:", error);
        alert("Error de conexión con el servidor.");
    }
}