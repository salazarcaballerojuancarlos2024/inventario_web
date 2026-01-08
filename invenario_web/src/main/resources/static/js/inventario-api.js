/**
 * ==================================================================================
 * INVENTARIO-API.JS
 * Módulo de comunicación con el Servidor y Gestión de Datos
 * ==================================================================================
 */

/**
 * TRASLADO RÁPIDO: Mueve un activo a una planta específica (Dropzone)
 */
async function moverAssetAPlanta(tag, plantaId) {
    const payload = {
        assetTag: tag,
        plantaId: plantaId,
        posX: 0, // Al mover a planta nueva, reseteamos a origen de imagen
        posY: 0
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
                // Desactivamos interact para que no interfiera con la animación
                interact(icono).unset();
                
                // Animación de "absorción" hacia la planta
                icono.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
                icono.style.transform += " scale(0) rotate(15deg)";
                icono.style.opacity = "0";
                icono.style.filter = "blur(5px)";
            }
            
            // Esperamos a que la animación termine antes de recargar
            setTimeout(() => {
                window.location.reload();
            }, 600);
        }
    } catch (error) { 
        console.error("Error en traslado:", error); 
        alert("Error al comunicar con el servidor.");
    }
}

/**
 * Envía los datos del formulario al servidor vía Fetch API
 */
function actualizarAssetAPI(data) {
    return fetch(CONFIG.endpoints.actualizarDatos, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

/**
 * GESTIÓN DE FORMULARIO: Envía los datos editados en el modal
 */
async function enviarFormularioEdit() {
    const formElement = document.getElementById('formEditAsset');
    if (!formElement) return;

    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    const tempX = formElement.getAttribute('data-temp-x');
    const tempY = formElement.getAttribute('data-temp-y');

    if (tempX !== null && tempY !== null) {
        payload.posX = Math.round(parseFloat(tempX));
        payload.posY = Math.round(parseFloat(tempY));
    } else {
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
            
            const pId = payload.plantaId;
            // Redirección limpia
            if (pId === "1") {
                window.location.href = "/?seccion=vista-almacen";
            } else {
                window.location.href = `/?plantaId=${pId}&seccion=vista-plano`;
            }
        } else {
            alert("No se pudo actualizar el equipo. Verifique los datos.");
        }
    } catch (error) {
        console.error("Error crítico:", error);
    }
}

/**
 * ELIMINACIÓN: Borra un activo permanentemente
 */
async function confirmarEliminarAsset(tag) {
    if (!confirm(`¿Eliminar permanentemente ${tag}?`)) return;
    try {
        const res = await fetch(CONFIG.endpoints.eliminar + tag, { method: 'DELETE' });
        if (res.ok) {
            const icono = document.getElementById('icono-' + tag);
            if (icono) {
                icono.style.transition = "transform 0.3s ease";
                icono.style.transform = "scale(0)";
                setTimeout(() => icono.remove(), 300);
            }
            const fila = document.getElementById('fila-' + tag);
            if (fila) {
                fila.style.backgroundColor = "#ffcdd2";
                fila.style.transition = "opacity 0.4s";
                fila.style.opacity = "0";
                setTimeout(() => fila.remove(), 400);
            }
        }
    } catch (error) { 
        console.error("Error al eliminar:", error); 
    }
}

/**
 * PERSISTENCIA MASIVA: Guarda posiciones en ALMACÉN
 */
async function guardarTodoAlmacen() {
    const items = document.querySelectorAll('#contenedor-almacen .drag-item');
    const btnGuardar = document.querySelector('button[onclick="guardarTodoAlmacen()"]') || event.currentTarget;
    
    if (items.length === 0) {
        alert("No hay equipos en el almacén para guardar.");
        return;
    }

    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> GUARDANDO...`;

    const movimientos = Array.from(items).map(i => ({
        assetTag: i.getAttribute('data-tag'),
        posX: Math.round(parseFloat(i.getAttribute('data-x')) || 0),
        posY: Math.round(parseFloat(i.getAttribute('data-y')) || 0),
        plantaId: 1
    }));

    try {
        const res = await fetch(CONFIG.endpoints.actualizarPosiciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimientos)
        });

        if (res.ok) {
            btnGuardar.innerHTML = "✅ ¡GUARDADO!";
            setTimeout(() => window.location.reload(), 800);
        }
    } catch (error) {
        console.error("Error:", error);
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

/**
 * PERSISTENCIA MASIVA: Guarda posiciones en PLANTA
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

/**
 * EXPORTACIÓN CSV
 */
function exportarTablaCSV(nombreArchivoPrefix = "inventario") {
    const tabla = document.querySelector("#tablaAlmacen") || 
                  document.querySelector("table");
    
    if (!tabla) {
        alert("Error: No se encontró la tabla para exportar.");
        return;
    }

    let csv = [];
    const filas = tabla.querySelectorAll("tr");

    for (let i = 0; i < filas.length; i++) {
        let fila = [];
        let cols = filas[i].querySelectorAll("th, td");
        for (let j = 0; j < cols.length - 1; j++) {
            let dato = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '""').trim();
            fila.push('"' + dato + '"');
        }
        csv.push(fila.join(","));
    }

    const contenidoCsv = "\uFEFF" + csv.join("\n"); 
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const enlaceDescarga = document.createElement("a");
    
    enlaceDescarga.href = url;
    enlaceDescarga.download = `${nombreArchivoPrefix}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
}

function exportarAlmacen() { exportarTablaCSV("almacen"); }
function exportarDatosPlanta(nombre) { exportarTablaCSV(nombre); }