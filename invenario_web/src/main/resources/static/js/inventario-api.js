/**
 * ==================================================================================
 * INVENTARIO-API.JS
 * Módulo de comunicación con el Servidor y Gestión de Datos
 * ==================================================================================
 */

/**
 * TRASLADO RÁPIDO: Mueve un activo a una planta específica (Dropzone)
 * @param {string} tag - Asset Tag del equipo
 * @param {string|number} plantaId - ID de la planta destino
 */
async function moverAssetAPlanta(tag, plantaId) {
    const payload = {
        assetTag: tag,
        plantaId: plantaId,
        posX: CONFIG.landingPosX, // Coordenadas por defecto (0,0 o centro)
        posY: CONFIG.landingPosY
    };
    try {
        const response = await fetch(CONFIG.endpoints.actualizarDatos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const icono = document.getElementById('icono-' + tag);
            if (icono) {
                icono.style.transition = "all 0.5s ease-in";
                icono.style.transform = "scale(0) rotate(10deg)";
                icono.style.opacity = "0";
            }
            // Recarga para reflejar el cambio de ubicación
            setTimeout(() => window.location.reload(), CONFIG.animationDuration);
        }
    } catch (error) { 
        console.error("Error en traslado:", error); 
    }
}
/**
 * Envía los datos del formulario al servidor vía Fetch API
 */
function actualizarAssetAPI(data) {
    const url = CONFIG.endpoints.actualizarDatos;
    console.log("🚀 Enviando a API:", url, data);

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }); // Devolvemos la promesa directa
}


/**
 * GESTIÓN DE FORMULARIO: Envía los datos editados en el modal
 */
async function enviarFormularioEdit() {
    const formElement = document.getElementById('formEditAsset');
    if (!formElement) return;

    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    // Recuperamos coordenadas temporales guardadas al abrir el modal
    const tempX = formElement.getAttribute('data-temp-x');
    const tempY = formElement.getAttribute('data-temp-y');

    if (tempX !== null && tempY !== null) {
        payload.posX = Math.round(parseFloat(tempX));
        payload.posY = Math.round(parseFloat(tempY));
    } else {
        // Fallback: leer del icono actual si no hay datos temporales
        const iconoActual = document.getElementById('icono-' + payload.assetTag);
        if (iconoActual) {
            payload.posX = Math.round(parseFloat(iconoActual.getAttribute('data-x')) || 0);
            payload.posY = Math.round(parseFloat(iconoActual.getAttribute('data-y')) || 0);
        } else {
            payload.posX = 0; payload.posY = 0;
        }
    }

    try {
        const response = await fetch(CONFIG.endpoints.actualizarDatos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            if (typeof modalInstancia !== 'undefined' && modalInstancia) modalInstancia.hide();
            
            // Redirección inteligente según la planta seleccionada
            const pId = payload.plantaId;
            if (pId === "1") {
                window.location.href = "/?seccion=vista-almacen";
            } else {
                window.location.href = "/?plantaId=" + pId + "&seccion=vista-plano";
            }
        } else {
            alert("No se pudo actualizar el equipo. Verifique los datos.");
        }
    } catch (error) {
        console.error("Error crítico al enviar formulario:", error);
    }
}

/**
 * ELIMINACIÓN: Borra un activo permanentemente del sistema
 */
async function confirmarEliminarAsset(tag) {
    if (!confirm(`¿Eliminar permanentemente ${tag}?`)) return;
    try {
        const res = await fetch(CONFIG.endpoints.eliminar + tag, { method: 'DELETE' });
        if (res.ok) {
            // Eliminación visual sin recarga completa
            document.getElementById('icono-' + tag)?.remove();
            const fila = document.getElementById('fila-' + tag);
            if (fila) {
                fila.style.backgroundColor = "#ffcdd2";
                setTimeout(() => fila.remove(), 400);
            }
        }
    } catch (error) { 
        console.error("Error al eliminar:", error); 
    }
}

/**
 * PERSISTENCIA MASIVA: Guarda las posiciones de todos los activos en el ALMACÉN
 */
async function guardarTodoAlmacen() {
    const items = document.querySelectorAll('#contenedor-almacen .drag-item');
    const btnGuardar = event.currentTarget; // Captura el botón clicado
    
    if (items.length === 0) {
        alert("No hay equipos en el almacén para guardar.");
        return;
    }

    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `GUARDANDO...`;

    const movimientos = Array.from(items).map(i => ({
        assetTag: i.getAttribute('data-tag'),
        posX: Math.round(parseFloat(i.getAttribute('data-x')) || 0),
        posY: Math.round(parseFloat(i.getAttribute('data-y')) || 0),
        plantaId: 1 // Forzamos ID 1 por ser Almacén
    }));

    try {
        const res = await fetch(CONFIG.endpoints.actualizarPosiciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimientos)
        });

        if (res.ok) {
            alert("✅ Posiciones de almacén guardadas.");
            window.location.reload(); 
        }
    } catch (error) {
        console.error("Error:", error);
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

/**
 * PERSISTENCIA MASIVA: Guarda las posiciones de los activos en una PLANTA específica
 * @param {number|string} plantaId - ID de la planta actual
 */
async function guardarPosicionesPlanta(plantaId) {
    const items = document.querySelectorAll('.area-mapa-principal .drag-item');
    const btn = event.currentTarget;
    
    if (items.length === 0) {
        alert("No hay equipos desplegados en esta planta.");
        return;
    }

    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `GUARDANDO...`;

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
            alert("✅ Plano de planta guardado correctamente.");
            window.location.reload(); 
        }
    } catch (error) {
        console.error("Error:", error);
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

/**
 * EXPORTACIÓN CSV: Descarga el listado de cualquier tabla activa (Almacén o Planta)
 * @param {string} nombreArchivoPrefix - Nombre que llevará el archivo (Almacén, Planta_1, etc.)
 */
function exportarTablaCSV(nombreArchivoPrefix = "inventario") {
    // Busca la tabla del almacén o la tabla de la planta activa
    const tabla = document.querySelector("#tablaAlmacen") || 
                  document.querySelector(".area-mapa-principal + .scroll-container table") ||
                  document.querySelector("table");
    
    if (!tabla) {
        alert("Error: No se encontró la tabla de datos para exportar.");
        return;
    }

    let csv = [];
    const filas = tabla.querySelectorAll("tr");

    for (let i = 0; i < filas.length; i++) {
        let fila = [];
        let cols = filas[i].querySelectorAll("th, td");
        
        // Exportamos todas las columnas excepto la última (Acciones)
        for (let j = 0; j < cols.length - 1; j++) {
            // Sanitización: quitar saltos de línea, escapar comillas y limpiar espacios
            let dato = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '""').trim();
            fila.push('"' + dato + '"');
        }
        csv.push(fila.join(","));
    }

    // Prefijo BOM UTF-8 para compatibilidad con Excel (acentos y Ñ)
    const contenidoCsv = "\uFEFF" + csv.join("\n"); 
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const enlaceDescarga = document.createElement("a");
    
    const fecha = new Date().toISOString().split('T')[0];
    const nombreLimpio = nombreArchivoPrefix.replace(/\s+/g, '_');
    
    enlaceDescarga.href = url;
    enlaceDescarga.download = `${nombreLimpio}_${fecha}.csv`;
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
    window.URL.revokeObjectURL(url);
}

// Alias para mantener compatibilidad con llamadas existentes en el HTML
function exportarAlmacen() { exportarTablaCSV("almacen"); }
function exportarDatosPlanta(nombre) { exportarTablaCSV(nombre); }

// Exposición global
window.exportarAlmacen = exportarAlmacen;
window.exportarDatosPlanta = exportarDatosPlanta;