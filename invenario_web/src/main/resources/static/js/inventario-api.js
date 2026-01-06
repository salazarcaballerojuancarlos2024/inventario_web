async function moverAssetAPlanta(tag, plantaId) {
    const payload = {
        assetTag: tag,
        plantaId: plantaId,
        posX: CONFIG.landingPosX, 
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
            setTimeout(() => window.location.reload(), CONFIG.animationDuration);
        }
    } catch (error) { console.error("Error en traslado:", error); }
}

async function enviarFormularioEdit() {
    const formElement = document.getElementById('formEditAsset');
    if (!formElement) return;

    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    // --- LÓGICA DE COORDENADAS REGENERADA ---
    // Recuperamos las coordenadas que guardamos en abrirModalUpdate
    // Esto asegura que se mantengan aunque cambiemos el icono o la planta
    const tempX = formElement.getAttribute('data-temp-x');
    const tempY = formElement.getAttribute('data-temp-y');

    if (tempX !== null && tempY !== null) {
        payload.posX = Math.round(parseFloat(tempX));
        payload.posY = Math.round(parseFloat(tempY));
    } else {
        // Fallback: si por algún motivo no están en el form, intentar leer del icono
        const iconoActual = document.getElementById('icono-' + payload.assetTag);
        if (iconoActual) {
            payload.posX = Math.round(parseFloat(iconoActual.getAttribute('data-x')) || 0);
            payload.posY = Math.round(parseFloat(iconoActual.getAttribute('data-y')) || 0);
        } else {
            payload.posX = 0;
            payload.posY = 0;
        }
    }

    try {
        const response = await fetch(CONFIG.endpoints.actualizarDatos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            if (typeof modalInstancia !== 'undefined' && modalInstancia) {
                modalInstancia.hide();
            }

            // Redirección inteligente manteniendo la posición
            const pId = payload.plantaId; // Usamos el dato del payload directamente
            
            if (pId === "1") {
                window.location.href = "/?seccion=vista-almacen";
            } else {
                // Forzamos la carga de la planta específica para ver el nuevo icono
                window.location.href = "/?plantaId=" + pId + "&seccion=vista-plano";
            }
        } else {
            console.error("Error en la respuesta del servidor");
            alert("No se pudo actualizar el equipo. Verifique los datos.");
        }
    } catch (error) {
        console.error("Error crítico al enviar formulario:", error);
    }
}

async function confirmarEliminarAsset(tag) {
    if (!confirm(`¿Eliminar permanentemente ${tag}?`)) return;
    try {
        const res = await fetch(CONFIG.endpoints.eliminar + tag, { method: 'DELETE' });
        if (res.ok) {
            document.getElementById('icono-' + tag)?.remove();
            const fila = document.getElementById('fila-' + tag);
            if (fila) {
                fila.style.backgroundColor = "#ffcdd2";
                setTimeout(() => fila.remove(), 400);
            }
        }
    } catch (error) { console.error("Error al eliminar:", error); }
}

async function actualizarPosicionSolo(tag, x, y) {
    const payload = [{ assetTag: tag, posX: x, posY: y }];
    try {
        await fetch(CONFIG.endpoints.actualizarPosiciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) { console.error("Error en sync:", e); }
}

async function guardarTodoAlmacen() {
    const items = document.querySelectorAll('#contenedor-almacen .drag-item');
    const btnGuardar = document.querySelector('button[onclick="guardarTodoAlmacen()"]');
    
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
        plantaId: 1 
    }));

    try {
        const res = await fetch(CONFIG.endpoints.actualizarPosiciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimientos)
        });

        if (res.ok) {
            alert("✅ Posiciones guardadas correctamente.");
            window.location.reload(); 
        }
    } catch (error) {
        console.error("Error:", error);
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
} // <--- AQUÍ TERMINABA guardarTodoAlmacen

// FUNCIÓN DE EXPORTACIÓN (FUERA DE LAS DEMÁS)
function exportarAlmacen() {
    console.log("Iniciando exportación...");
    const tabla = document.querySelector(".table-almacen-compacta") || document.querySelector("#vista-almacen table");
    
    if (!tabla) {
        alert("Error: No se encontró la tabla de datos.");
        return;
    }

    let csv = [];
    const filas = tabla.querySelectorAll("tr");

    for (let i = 0; i < filas.length; i++) {
        let fila = [];
        let cols = filas[i].querySelectorAll("th, td");
        // Omitimos la última columna (Acciones)
        for (let j = 0; j < cols.length - 1; j++) {
            let dato = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/[,;]/g, " ").trim();
            fila.push('"' + dato + '"');
        }
        csv.push(fila.join(","));
    }

    const contenidoCsv = "\uFEFF" + csv.join("\n"); 
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const enlaceDescarga = document.createElement("a");
    enlaceDescarga.href = url;
    const fecha = new Date().toISOString().split('T')[0];
    enlaceDescarga.download = `inventario_almacen_${fecha}.csv`;
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
    window.URL.revokeObjectURL(url);
}

// Aseguramos alcance global por si acaso
window.exportarAlmacen = exportarAlmacen;