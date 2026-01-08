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
    document.getElementById('inputAssetTag').readOnly = false; // Permitir escribir el Tag
    
    // Valores por defecto para evitar nulos en la BD
    document.getElementById('inputPosX').value = 0;
    document.getElementById('inputPosY').value = 0;
    // Seleccionar por defecto la primera planta si el select existe
    const selectPlanta = document.getElementById('inputPlanta');
    if (selectPlanta && selectPlanta.options.length > 0) {
        selectPlanta.selectedIndex = 0;
    }

    if (window.modalInstancia) window.modalInstancia.show();
}

/**
 * Esta función se llama desde el botón naranja de la tabla
 * Reutiliza prepararModalDesdeIcono pero asegura el modo edición
 */
/**
 * Prepara el modal para EDITAR un activo existente
 * Se llama desde el botón naranja de la tabla de gestión
 */
function editarDesdeTabla(elemento) {
    esNuevoAsset = false; // 🚩 IMPORTANTE: Indicamos que NO es nuevo
    console.log("✏️ Modo: Editando activo existente");

    // 1. Extraemos los datos del botón (usando los atributos data- que pusimos antes)
    const tag = elemento.getAttribute('data-tag');
    const user = elemento.getAttribute('data-user');
    const ram = elemento.getAttribute('data-ram');
    const cpu = elemento.getAttribute('data-cpu');
    const disco = elemento.getAttribute('data-disco');
    const so = elemento.getAttribute('data-so');
    const otros = elemento.getAttribute('data-otros');
    const plantaId = elemento.getAttribute('data-planta-id');
    const tipo = elemento.getAttribute('data-tipo');

    // 2. Rellenamos el formulario del modal
    document.getElementById('tagDisplay').innerText = tag;
    
    const tagInput = document.getElementById('inputAssetTag');
    tagInput.value = tag;
    tagInput.readOnly = true; // 🔒 BLOQUEAMOS el Tag para que no se pueda cambiar
    tagInput.style.backgroundColor = "#e9ecef"; // Color gris de "solo lectura"

    document.getElementById('inputUsuario').value = user || '';
    document.getElementById('inputRam').value = ram || '';
    document.getElementById('inputCpu').value = cpu || '';
    document.getElementById('inputDisco').value = disco || '';
    document.getElementById('inputSo').value = so || '';
    document.getElementById('inputOtros').value = otros || '';
    document.getElementById('inputPlanta').value = plantaId;
    document.getElementById('inputTipo').value = tipo || 'PC';

    // 3. Mostramos el modal
    if (window.modalInstancia) window.modalInstancia.show();
}

/**
 * Función para BORRAR un activo
 */
async function confirmarBorrado(tag) {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el activo ${tag}?`)) {
        try {
            const response = await fetch(`/assets/eliminar/${tag}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Si el borrado es exitoso, eliminamos la fila de la tabla sin recargar
                const fila = document.getElementById(`fila-datos-${tag}`);
                if (fila) fila.remove();
                alert("Activo eliminado con éxito");
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
 * Lógica de Ordenación (Se mantiene igual, es funcional)
 */
document.querySelectorAll('#tablaAssets th').forEach((header, index) => {
    header.addEventListener('click', () => {
        const table = header.closest('table');
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const isAscending = header.classList.contains('th-sort-asc');
        
        table.querySelectorAll('th').forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));

        rows.sort((a, b) => {
            const contentA = a.children[index].textContent.trim();
            const contentB = b.children[index].textContent.trim();
            return isAscending ? contentB.localeCompare(contentA) : contentA.localeCompare(contentB);
        });

        header.classList.toggle('th-sort-asc', !isAscending);
        header.classList.toggle('th-sort-desc', isAscending);
        rows.forEach(row => table.querySelector('tbody').appendChild(row));
    });
});

async function enviarFormularioModal() {
    const tag = document.getElementById('inputAssetTag').value;
    if (!tag) return alert("El Asset Tag es obligatorio");

    // Decidimos la URL basándonos en la variable global
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
        location.reload(); // Recarga para ver los cambios
    } else {
        const error = await response.json();
        alert("Error: " + error.error);
    }
}