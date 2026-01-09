/**
 * ==================================================================================
 * INVENTARIO-API.JS 
 * Módulo de comunicación con el Servidor y Gestión de Datos (Versión 2026 Full)
 * ==================================================================================
 */

/**
 * 1. TRASLADO RÁPIDO: Mueve un activo a una planta específica (Dropzone)
 */
async function moverAssetAPlanta(tag, plantaId) {
    const payload = {
        assetTag: tag,
        plantaId: plantaId,
        posX: 0, // Reset a origen al cambiar de planta
        posY: 0
    };

    try {
        const response = await fetch(CONFIG.endpoints.actualizarDatos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const icono = document.getElementById(tag) || document.getElementById('icono-' + tag);
            if (icono) {
                if (typeof interact !== 'undefined') interact(icono).unset();
                icono.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
                icono.style.transform += " scale(0) rotate(20deg)";
                icono.style.opacity = "0";
                icono.style.filter = "blur(4px)";
            }
            setTimeout(() => window.location.reload(), 600);
        }
    } catch (error) { 
        console.error("Error en traslado:", error); 
        alert("Error al comunicar con el servidor.");
    }
}

/**
 * 2. GESTIÓN DE FORMULARIO: Envía los datos editados en el modal (Crear/Editar)
 */
async function enviarFormularioEdit() {
    const formElement = document.getElementById('formEditAsset');
    if (!formElement) return;

    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    // Recuperamos coordenadas si vienen de un icono arrastrado
    const tempX = formElement.getAttribute('data-temp-x');
    const tempY = formElement.getAttribute('data-temp-y');

    if (tempX !== null && tempY !== null) {
        payload.posX = Math.round(parseFloat(tempX));
        payload.posY = Math.round(parseFloat(tempY));
    } else {
        const iconoActual = document.getElementById(payload.assetTag);
        if (iconoActual) {
            payload.posX = Math.round(parseFloat(iconoActual.getAttribute('data-x')) || 0);
            payload.posY = Math.round(parseFloat(iconoActual.getAttribute('data-y')) || 0);
        } else {
            payload.posX = payload.posX || 0;
            payload.posY = payload.posY || 0;
        }
    }

    try {
        const response = await fetch(CONFIG.endpoints.actualizarDatos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            if (window.modalInstancia) window.modalInstancia.hide();
            
            // Redirección inteligente tras guardar
            const pId = payload.plantaId;
            if (pId === "1") {
                window.location.href = "/?seccion=vista-almacen";
            } else {
                window.location.href = `/?plantaId=${pId}`;
            }
        } else {
            alert("No se pudo guardar el equipo. Verifique duplicados de Tag.");
        }
    } catch (error) {
        console.error("Error crítico:", error);
    }
}

/**
 * 3. ELIMINACIÓN: Borra un activo permanentemente
 * Soporta limpieza de Iconos (Plano) y Filas (Tabla de Datos)
 */
async function confirmarEliminarAsset(tag) {
    if (!confirm(`¿Desea eliminar permanentemente el activo ${tag}?`)) return;

    try {
        const res = await fetch(CONFIG.endpoints.eliminar + tag, { method: 'DELETE' });
        
        if (res.ok) {
            // Eliminar del mapa/almacén si existe
            const icono = document.getElementById(tag) || document.getElementById('icono-' + tag);
            if (icono) {
                icono.style.transition = "transform 0.3s ease, opacity 0.3s";
                icono.style.transform = "scale(0)";
                icono.style.opacity = "0";
                setTimeout(() => icono.remove(), 300);
            }

            // Eliminar de la tabla de datos si existe
            const fila = document.getElementById('fila-' + tag);
            if (fila) {
                fila.style.transition = "all 0.4s ease";
                fila.style.backgroundColor = "rgba(220, 53, 69, 0.2)";
                fila.style.opacity = "0";
                setTimeout(() => {
                    fila.remove();
                    // Actualizamos contadores de la tabla dinámicamente
                    if (typeof actualizarTablaDinamica === 'function') actualizarTablaDinamica();
                }, 400);
            }
        } else {
            alert("Error: El servidor no permitió la eliminación.");
        }
    } catch (error) { 
        console.error("Error al eliminar:", error); 
    }
}

/**
 * 4. PERSISTENCIA MASIVA: Guarda posiciones de todos los equipos en una planta
 */
async function guardarPosicionesPlanta(plantaId) {
    // Detectamos si estamos en almacén (id 1) o en un plano normal
    const selector = (plantaId == 1) ? '#contenedor-almacen .drag-item' : '.area-mapa-principal .drag-item';
    const items = document.querySelectorAll(selector);
    const btn = event.currentTarget;
    
    if (items.length === 0) return alert("No hay equipos para guardar.");

    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> GUARDANDO...`;

    const movimientos = Array.from(items).map(i => ({
        assetTag: i.getAttribute('data-tag'),
        posX: Math.round(parseFloat(i.getAttribute('data-x')) || 0),
        posY: Math.round(parseFloat(i.getAttribute('data-y')) || 0),
        plantaId: plantaId 
    }));

    try {
        const res = await fetch(CONFIG.endpoints.actualizarPosiciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimientos)
        });

        if (res.ok) {
            btn.innerHTML = "✅ ¡GUARDADO!";
            setTimeout(() => window.location.reload(), 800);
        }
    } catch (error) {
        console.error("Error:", error);
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

// Alias para mantener compatibilidad con botones antiguos
async function guardarTodoAlmacen() { await guardarPosicionesPlanta(1); }

/**
 * 5. EXPORTACIÓN CSV: Detecta la tabla visible y genera el archivo
 */
function exportarTablaCSV(nombreArchivoPrefix = "inventario") {
    let tabla = null;
    const vistaDatos = document.getElementById('vista-Datos');
    
    // Si la vista de datos está visible, exportamos esa tabla
    if (vistaDatos && vistaDatos.classList.contains('seccion-visible')) {
        tabla = document.querySelector("#tablaAssets");
    } else {
        tabla = document.querySelector("#tablaAlmacen") || document.querySelector("table");
    }
    
    if (!tabla) return alert("No se encontró tabla para exportar.");

    let csv = [];
    const filas = tabla.querySelectorAll("tr");

    for (let i = 0; i < filas.length; i++) {
        let fila = [];
        let cols = filas[i].querySelectorAll("th, td");
        // j < cols.length - 1 para ignorar la columna "Acciones"
        for (let j = 0; j < cols.length - 1; j++) {
            let dato = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '""').trim();
            fila.push('"' + dato + '"');
        }
        if (fila.length > 0) csv.push(fila.join(","));
    }

    const contenidoCsv = "\uFEFF" + csv.join("\n"); 
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    
    enlace.href = url;
    enlace.download = `${nombreArchivoPrefix}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

function exportarAlmacen() { exportarTablaCSV("almacen"); }
function exportarDatosPlanta(nombre) { exportarTablaCSV(nombre); }