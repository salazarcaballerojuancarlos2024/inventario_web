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

    // --- NUEVO: Reset de Checkboxes al filtrar ---
    const masterCheck = document.getElementById("checkAllAssets");
    if (masterCheck) masterCheck.checked = false; 
    // Opcional: desmarcar todos los individuales al empezar una nueva búsqueda
    // rows.forEach(r => { const cb = r.querySelector('.check-asset'); if(cb) cb.checked = false; });
    actualizarEstadoBotonBorrar(); 

    let matches = [];

    // 1. FILTRADO, RESALTADO Y ASIGNACIÓN DE PRIORIDAD
    rows.forEach(row => {
        let firstMatchCol = -1;
        row.style.display = "none"; 
        
        // Empezamos en la celda 1 (index 1) para saltarnos la celda del checkbox (index 0)
        // Y llegamos hasta la 9 para no procesar la columna de 'Acciones'
        const cellsForSearch = Array.from(row.cells).slice(1, 10);

        // Limpiar resaltados previos
        cellsForSearch.forEach(cell => {
            if (cell.querySelector('mark.resaltado-busqueda')) {
                cell.innerHTML = cell.innerText; 
            }
        });

        if (searchFilter === "") {
            matches.push({ row, priority: 99, text: "" });
            return;
        }

        // Buscar coincidencia columna por columna
        cellsForSearch.forEach((cell, idx) => {
            const originalText = cell.innerText;
            const pos = originalText.toLowerCase().indexOf(searchFilter);
            
            if (pos > -1) {
                if (firstMatchCol === -1) firstMatchCol = idx;
                const regex = new RegExp(`(${searchFilter})`, 'gi');
                cell.innerHTML = originalText.replace(regex, `<mark class="resaltado-busqueda">$1</mark>`);
            }
        });

        if (firstMatchCol > -1) {
            matches.push({ 
                row, 
                priority: firstMatchCol, 
                text: cellsForSearch[firstMatchCol].innerText.toLowerCase() 
            });
        }
    });

    // 2. ORDENACIÓN POR RELEVANCIA
    if (searchFilter !== "") {
        matches.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.text.localeCompare(b.text);
        });
    }

    // 3. RE-INSERCIÓN FÍSICA EN EL DOM
    matches.forEach(obj => tbody.appendChild(obj.row));

    // 4. PAGINACIÓN SOBRE EL NUEVO ORDEN
    const totalVisible = matches.length;
    const totalPages = Math.ceil(totalVisible / maxRows);
    
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

    // LOCALIZAMOS EL ICONO EN EL PLANO
    const icono = document.getElementById(tag) || document.getElementById('icono-' + tag);
    
    // CORRECCIÓN VITAL: Leemos los atributos porcentuales (-pct) en lugar de data-x/y
    if (icono) {
        // Si el icono existe en el plano, capturamos su % actual
        document.getElementById('inputPosX').value = icono.getAttribute('data-x-pct') || 0;
        document.getElementById('inputPosY').value = icono.getAttribute('data-y-pct') || 0;
    } else {
        // Si venimos de la tabla de gestión (donde el icono no está renderizado), 
        // buscamos si el botón tiene los datos de posición o ponemos 0 por defecto
        const btnTabla = document.querySelector(`button[data-tag="${tag}"]`);
        document.getElementById('inputPosX').value = btnTabla ? (btnTabla.getAttribute('data-pos-x') || 0) : 0;
        document.getElementById('inputPosY').value = btnTabla ? (btnTabla.getAttribute('data-pos-y') || 0) : 0;
    }

    if (window.modalInstancia) window.modalInstancia.show();
}

function prepararModalDesdeIcono(elemento) {
    let d = elemento.dataset;
    let tag = d.tag || elemento.getAttribute('data-tag');
    
    // Extraemos los porcentajes del icono (el círculo/pc en el plano)
    const xPct = elemento.getAttribute('data-x-pct') || "0";
    const yPct = elemento.getAttribute('data-y-pct') || "0";

    if (!d.user || d.user === "") {
        const btnTabla = document.querySelector(`button[data-tag="${tag}"][data-user]`);
        if (btnTabla) d = btnTabla.dataset;
    }

    // AÑADIMOS xPct e yPct a la llamada
    abrirModalUpdate(
        tag, 
        d.user || d.nombreUsuario, 
        d.ram, 
        d.cpu, 
        d.disco, 
        d.so || d.versionSo, 
        d.otros, 
        d.plantaId || d.planta || '1', 
        d.tipo || d.tipoEquipo,
        xPct, // <--- Nuevo parámetro
        yPct  // <--- Nuevo parámetro
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
	        
	        // CORRECCIÓN: Usamos parseFloat para no perder los decimales del %
	        // Además, si es creación, usamos el valor del input (que pusimos a 2 en abrirModalCrear)
	        posX: parseFloat(document.getElementById('inputPosX').value) || 0,
	        posY: parseFloat(document.getElementById('inputPosY').value) || 0
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

/**
 * LÓGICA DE BORRADO MASIVO
 */

// 1. Seleccionar/Deseleccionar todo (SOLO los que son visibles por el filtro)
function toggleTodosLosChecks(master) {
    const filasVisibles = document.querySelectorAll('.fila-asset:not([style*="display: none"])');
    filasVisibles.forEach(fila => {
        const cb = fila.querySelector('.check-asset');
        if (cb) cb.checked = master.checked;
    });
    actualizarEstadoBotonBorrar();
}

// 2. Actualizar el contador y habilitar/deshabilitar el botón rojo
function actualizarEstadoBotonBorrar() {
    const seleccionados = document.querySelectorAll('.check-asset:checked').length;
    const btn = document.getElementById('btnBorrarSeleccion');
    const span = document.getElementById('countSeleccionados');
    
    if (btn) {
        btn.disabled = (seleccionados === 0);
        if (span) span.innerText = seleccionados;
    }
}

// 3. Ejecutar el borrado masivo
async function borrarSeleccionados() {
    const seleccionados = Array.from(document.querySelectorAll('.check-asset:checked'))
                               .map(cb => cb.value);

    if (seleccionados.length === 0) return;

    if (confirm(`¿Deseas eliminar permanentemente los ${seleccionados.length} activos seleccionados?`)) {
        try {
            const response = await fetch('/assets/eliminar-multiple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: seleccionados })
            });

            if (response.ok) {
                // En lugar de reload, podrías simplemente actualizar la tabla, 
                // pero reload asegura que el contador de la base de datos sea exacto.
                location.reload();
            } else {
                const err = await response.json();
                alert("Error: " + (err.error || "No se pudo eliminar la selección"));
            }
        } catch (error) {
            alert("Error crítico de comunicación con el servidor.");
        }
    }
}

/**
 * Exporta a CSV todos los activos que coinciden con el filtro de búsqueda actual,
 * recorriendo todas las páginas de resultados.
 */
function exportarVistaActualCSV() {
    const table = document.getElementById("tablaAssets");
    if (!table) return;

    const searchFilter = (document.getElementById("inputBusquedaAssets")?.value || "").trim().toLowerCase();
    const rows = Array.from(table.querySelectorAll("tbody tr.fila-asset"));

    // 1. Definir encabezados (Saltamos checkbox y acciones)
    const headers = ["Tag", "Usuario", "Tipo", "Ubicación", "RAM", "CPU", "Disco", "S.O.", "Otros"];

    // 2. Filtrar los datos (Lógica idéntica a la de búsqueda)
    const datosFiltrados = rows.filter(row => {
        if (searchFilter === "") return true; // Si no hay filtro, pasan todos
        
        // Buscamos en las celdas de datos (índices 1 al 9)
        const cellsForSearch = Array.from(row.cells).slice(1, 10);
        return cellsForSearch.some(cell => cell.innerText.toLowerCase().includes(searchFilter));
    });

    if (datosFiltrados.length === 0) {
        alert("No hay resultados que coincidan con la búsqueda para exportar.");
        return;
    }

    // 3. Construir el contenido CSV
    // Usamos \uFEFF para que Excel reconozca correctamente los acentos (UTF-8 con BOM)
    let csvContent = "\uFEFF" + headers.join(";") + "\n";

    datosFiltrados.forEach(row => {
        const celdas = Array.from(row.cells).slice(1, 10);
        const filaTexto = celdas.map(cell => {
            // Limpiar el texto: quitar marcas de resaltado, saltos de línea y escapar comillas
            let text = cell.innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
            return `"${text.replace(/"/g, '""')}"`;
        });
        csvContent += filaTexto.join(";") + "\n";
    });

    // 4. Crear el archivo y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_activos_filtrados_${fecha}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function ordenarTabla(n) {
    const table = document.getElementById("tablaAlmacen");
    if (!table) return;

    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    let dir = table.getAttribute("data-sort-dir") === "asc" ? "desc" : "asc";
    table.setAttribute("data-sort-dir", dir);

    // 1. Ordenar las filas
    rows.sort((a, b) => {
        const x = a.cells[n].innerText.toLowerCase().trim();
        const y = b.cells[n].innerText.toLowerCase().trim();

        // Intento de ordenación numérica (para RAM, Disco, etc.)
        const xNum = parseFloat(x.replace(/[^0-9.]/g, ''));
        const yNum = parseFloat(y.replace(/[^0-9.]/g, ''));

        if (!isNaN(xNum) && !isNaN(yNum) && n >= 4 && n <= 6) {
            return dir === "asc" ? xNum - yNum : yNum - xNum;
        }

        // Ordenación de texto normal
        if (dir === "asc") {
            return x.localeCompare(y);
        } else {
            return y.localeCompare(x);
        }
    });

    // 2. Re-insertar las filas ordenadas en el tbody
    rows.forEach(row => tbody.appendChild(row));

    // 3. (Opcional) Actualizar visualmente los iconos si quieres
    actualizarIconosOrden(table, n, dir);
}

function actualizarIconosOrden(table, colIndex, dir) {
    const icons = table.querySelectorAll('.sort-icon');
    icons.forEach((icon, idx) => {
        if (idx === colIndex) {
            icon.innerText = dir === "asc" ? " ▲" : " ▼";
            icon.style.color = "#0dcaf0";
        } else {
            icon.innerText = " ↕";
            icon.style.color = "";
        }
    });
}

// Ejecutar cuando la vista de almacén esté lista
function aplicarResizersAlmacen() {
    const table = document.getElementById('tablaAlmacen');
    if (!table) return;

    const headerCols = table.querySelectorAll('th');
    headerCols.forEach((col, index) => {
        // No añadimos resizer a la última columna de acciones
        if (index === headerCols.length - 1) return;

        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        col.appendChild(resizer);

        resizer.addEventListener('mousedown', (e) => {
            const startX = e.clientX;
            const startWidth = col.offsetWidth;

            resizer.classList.add('resizing');

            const onMouseMove = (e) => {
                const width = startWidth + (e.clientX - startX);
                col.style.width = `${Math.max(width, 40)}px`; // Mínimo 40px
            };

            const onMouseUp = () => {
                resizer.classList.remove('resizing');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}

// Iniciar
document.addEventListener('DOMContentLoaded', aplicarResizersAlmacen);