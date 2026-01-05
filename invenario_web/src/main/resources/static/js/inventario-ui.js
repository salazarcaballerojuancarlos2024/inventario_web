function mostrarSeccion(id) {
    document.querySelectorAll('.map-area > div').forEach(div => div.classList.add('seccion-oculta'));
    const target = document.getElementById(id);
    if(target) {
        target.classList.remove('seccion-oculta');
        // RE-INICIALIZAR INTERACT SI ES ALMACÉN O PLANO
        if(id === 'vista-almacen' || id === 'vista-plano') {
            initInteract(); 
        }
    }
}

function resaltarFila(tag, activar) {
    const fila = document.getElementById('fila-' + tag);
    if (fila) activar ? fila.classList.add('fila-resaltada') : fila.classList.remove('fila-resaltada');
}

/**
 * Maneja el clic sobre un icono en el mapa.
 * Resalta la fila correspondiente en la tabla y prepara el modal de edición.
 */
function manejarClickIcono(el, ev) {
    // 1. Detener la propagación para que no interfiera con clics en el contenedor del plano
    if (ev) ev.stopPropagation();

    // 2. SEGURIDAD: Si el icono se está arrastrando, ignoramos el clic
    if (el.classList.contains('interact-dragging')) {
        return; 
    }

    const tag = el.getAttribute('data-tag');
    
    // 3. Lógica de Resaltado en la Tabla
    const fila = document.getElementById('fila-' + tag);
    if (fila) {
        // Eliminar resaltados previos si existen
        document.querySelectorAll('.fila-resaltada').forEach(f => f.classList.remove('fila-resaltada'));
        
        // Aplicar nuevo resaltado y scroll
        fila.classList.add('fila-resaltada');
        fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Quitar el efecto visual después de un tiempo
        setTimeout(() => {
            fila.classList.remove('fila-resaltada');
        }, 3000);
    }

    // 4. Lógica de Apertura de Modal (Si tienes la función de carga de datos)
    // Se asume que existe una función para llenar el modal con los datos del asset
    if (typeof abrirModalEditar === 'function') {
        abrirModalEditar(tag);
    } else {
        console.log("Icono seleccionado: " + tag + ". (Función abrirModalEditar no detectada)");
    }
}

/**
 * Función complementaria para resaltar visualmente el icono 
 * cuando pasamos el ratón sobre la fila de la tabla (Efecto Inverso)
 */
function resaltarIcono(tag, activo) {
    const icono = document.getElementById('icono-' + tag);
    if (!icono) return;

    if (activo) {
        icono.style.zIndex = "3000";
        icono.style.transform = icono.style.transform.replace(/scale\([^)]*\)/, '') + " scale(1.4)";
        icono.style.filter = "drop-shadow(0 0 10px #2e7d32)";
    } else {
        icono.style.zIndex = "50";
        icono.style.transform = icono.style.transform.replace(/scale\([^)]*\)/, '').trim();
        icono.style.filter = "none";
    }
}

function abrirModalUpdate(tag, user, ram, cpu, disco, so, otros, plantaId, tipo) {
    document.getElementById('tagDisplay').innerText = tag;
    document.getElementById('inputAssetTag').value = tag;
    document.getElementById('inputUsuario').value = user || '';
    document.getElementById('inputRam').value = ram || '';
    document.getElementById('inputCpu').value = cpu || '';
    document.getElementById('inputDisco').value = disco || '';
    document.getElementById('inputSo').value = so || '';
    document.getElementById('inputOtros').value = otros || '';
    document.getElementById('inputPlanta').value = plantaId;
    const selectorTipo = document.getElementById('inputTipo');
    if (selectorTipo) selectorTipo.value = (tipo && typeof tipo === 'string') ? tipo.toLowerCase().trim() : 'pc';
    if (modalInstancia) modalInstancia.show();
}

function seleccionarPlanta(id) { window.location.href = "/?plantaId=" + id + "&seccion=vista-plano"; }

// Lógica de ordenar tabla (mantén tus funciones ordenarTabla y actualizarIconosOrden aquí)
let ordenAscendente = true;
let ultimaColumna = -1;
function ordenarTabla(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    // Seleccionamos la tabla dentro del contenedor de almacén
    table = document.querySelector(".table-almacen-compacta");
    switching = true;
    // Establecer la dirección de ordenación en ascendente
    dir = "asc";
    
    /* Bucle que continuará hasta que no se haya hecho ningún cambio */
    while (switching) {
        switching = false;
        rows = table.rows;
        
        /* Recorrer todas las filas de la tabla (excepto el encabezado) */
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            
            /* Comparar dos elementos adyacentes */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            
            /* Comprobar si deben intercambiarse según la dirección */
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        
        if (shouldSwitch) {
            /* Si se ha marcado el cambio, se intercambian las filas y se marca switching */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            /* Si no se hizo ningún cambio y la dirección era "asc", 
               se cambia a "desc" y se vuelve a ejecutar el bucle */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
    
    // Opcional: Actualizar los iconos visuales (↕)
    actualizarIconosOrden(n, dir);
}

function actualizarIconosOrden(columnaActiva, direccion) {
    const ths = document.querySelectorAll(".table-almacen-compacta th");
    ths.forEach((th, index) => {
        const icon = th.querySelector(".sort-icon");
        if (icon) {
            if (index === columnaActiva) {
                icon.innerHTML = direccion === "asc" ? "↑" : "↓";
                icon.style.color = "#28a745"; // Color verde éxito
            } else {
                icon.innerHTML = "↕";
                icon.style.color = "";
            }
        }
    });
}

