const CONFIG = {
    landingPosX: 850,
    landingPosY: 10,
    animationDuration: 600,
    endpoints: {
        actualizarDatos: '/assets/actualizar-datos',
        actualizarPosiciones: '/assets/actualizar-posiciones',
        actualizarPosicionSimple: '/assets/actualizar-posicion',
        eliminar: '/assets/eliminar/'
    }
};

// Instancia global para el modal
let modalInstancia = null;