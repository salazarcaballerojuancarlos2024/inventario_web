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
 * Procesa la importación de CSV enviando los datos a AssetController
 */
window.ejecutarImportacionCsv = function(input) {
    console.log("--> Evento onchange detectado en el input CSV.");

    if (!input || !input.files || input.files.length === 0) {
        console.warn("No se ha seleccionado ningún archivo.");
        return;
    }

    const file = input.files[0];
    console.log("--> Archivo seleccionado:", file.name, "Tamaño:", file.size, "bytes");

    // Pop-up de confirmación explícita
    const confirmacion = confirm(`¿Deseas importar y guardar los activos del archivo "${file.name}" en la base de datos?`);
    
    if (!confirmacion) {
        console.log("Importación cancelada por el usuario.");
        input.value = ''; 
        return;
    }

    console.log("--> Enviando archivo a /assets/importar-csv...");

    const formData = new FormData();
    formData.append("archivo", file);

    fetch('/assets/importar-csv', {
        method: 'POST',
        body: formData
    })
    .then(async response => {
        console.log("--> Estado HTTP del servidor:", response.status);
        const data = await response.json();
        
        if (response.ok && data.exito) {
            alert(`¡Importación completada con éxito!\n\nSe han registrado ${data.registrosProcesados} activos en la base de datos.`);
            location.reload(); 
        } else {
            alert("Error al importar el archivo CSV:\n\n" + (data.error || "Formato no válido."));
        }
    })
    .catch(err => {
        console.error("--> Error crítico en la petición Fetch:", err);
        alert("Ocurrió un error al procesar la comunicación con el servidor: " + err.message);
    })
    .finally(() => {
        input.value = ''; 
    });
};


 /* Lógica de Ordenación Manual (Opcional si usas ordenarTablaPaginada en el HTML)
 */
document.querySelectorAll('#tablaAssets th[onclick]').forEach((header, index) => {
    // Si ya usas funciones inline como ordenarTablaPaginada(0), este listener es preventivo
    header.style.cursor = 'pointer';
});