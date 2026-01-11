// Variable global para controlar si el modal está en modo creación o edición
let esNuevoAsset = false;

/**
 * Prepara el modal para CREAR un activo nuevo
 */
function abrirModalCrear() {
    esNuevoAsset = true; 
    console.log("🆕 Modo: Crear nuevo activo");

    const form = document.getElementById('formEditAsset');
    if (!form) return;

    form.reset();
    
    // Configuraciones visuales para creación
    document.getElementById('tagDisplay').innerText = "Nuevo Activo";
    document.getElementById('inputAssetTag').readOnly = false;
    document.getElementById('inputAssetTag').style.backgroundColor = "#ffffff";
    
    // Posicionamiento inicial por defecto (2%)
    document.getElementById('inputPosX').value = 2;
    document.getElementById('inputPosY').value = 2;

    const selectPlanta = document.getElementById('inputPlanta');
    if (selectPlanta && selectPlanta.options.length > 0) {
        selectPlanta.value = "1"; // Almacén por defecto
    }

    if (window.modalInstancia) window.modalInstancia.show();
}

/**
 * Prepara el modal para EDITAR un activo existente
 * Se llama desde el botón naranja (icono lápiz) de la tabla
 */
function prepararModalDesdeIcono(elemento) {
    esNuevoAsset = false; 
    console.log("✏️ Modo: Editando activo existente");

    const tag = elemento.getAttribute('data-tag');
    const user = elemento.getAttribute('data-user');
    const ram = elemento.getAttribute('data-ram');
    const cpu = elemento.getAttribute('data-cpu');
    const disco = elemento.getAttribute('data-disco');
    const so = elemento.getAttribute('data-so');
    const otros = elemento.getAttribute('data-otros');
    const plantaId = elemento.getAttribute('data-planta-id');
    const tipo = elemento.getAttribute('data-tipo');

    document.getElementById('tagDisplay').innerText = tag;
    
    const tagInput = document.getElementById('inputAssetTag');
    tagInput.value = tag;
    tagInput.readOnly = true; 
    tagInput.style.backgroundColor = "#e9ecef"; 

    document.getElementById('inputUsuario').value = user || '';
    document.getElementById('inputRam').value = ram || '';
    document.getElementById('inputCpu').value = cpu || '';
    document.getElementById('inputDisco').value = disco || '';
    document.getElementById('inputSo').value = so || '';
    document.getElementById('inputOtros').value = otros || '';
    document.getElementById('inputPlanta').value = plantaId || '1';
    document.getElementById('inputTipo').value = tipo || 'PC';

    if (window.modalInstancia) window.modalInstancia.show();
}

/**
 * Función para confirmar y eliminar un activo
 */
async function confirmarEliminarAsset(tag) {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el activo ${tag}?`)) {
        try {
            const response = await fetch(`/assets/eliminar/${tag}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const fila = document.getElementById(`fila-${tag}`);
                if (fila) fila.remove();
                alert("Activo eliminado con éxito");
                location.reload(); // Recargamos para actualizar contadores y paginación
            } else {
                const data = await response.json();
                alert("Error al eliminar: " + (data.error || "Desconocido"));
            }
        } catch (error) {
            console.error("Error en la petición de borrado:", error);
            alert("Error de conexión al intentar borrar.");
        }
    }
}

/**
 * Envía el formulario del modal (Crear o Actualizar)
 */
async function enviarFormularioModal() {
    const tag = document.getElementById('inputAssetTag').value;
    if (!tag) return alert("El Asset Tag es obligatorio");

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

    try {
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
    } catch (err) {
        console.error("Error al enviar formulario:", err);
    }
}

/**
 * LÓGICA DE NAVEGACIÓN POR DOBLE CLICK (Delegación de eventos)
 * Sobrevive a la paginación y ordenación de la tabla
 
document.addEventListener('dblclick', function(event) {
    // Buscamos si el click fue en una fila de activo
    const fila = event.target.closest('.fila-asset');
    
    // Si no hay fila, o si el click fue en un botón/input dentro de la fila, ignoramos
    if (!fila || event.target.closest('button') || event.target.closest('input')) {
        return;
    }

    const plantaId = fila.getAttribute('data-planta-id');
    const assetTag = fila.getAttribute('data-tag');

    console.log(`🔍 Navegando a Planta ID: ${plantaId} por activo: ${assetTag}`);

    if (!plantaId || plantaId === "null" || plantaId === "undefined") {
        alert("Este activo no tiene una planta asignada.");
        return;
    }

    // Construcción de la URL de destino
    // Si plantaId es 1 (Almacén), usamos la sección almacén, sino la vista de plano
    const seccion = (plantaId === "1") ? "vista-almacen" : "vista-plano";
    const urlDestino = `/?plantaId=${plantaId}&seccion=${seccion}`;

    window.location.href = urlDestino;
});
*/

/**
 * Lógica de Ordenación Manual (Opcional si usas ordenarTablaPaginada en el HTML)
 */
document.querySelectorAll('#tablaAssets th[onclick]').forEach((header, index) => {
    // Si ya usas funciones inline como ordenarTablaPaginada(0), este listener es preventivo
    header.style.cursor = 'pointer';
});