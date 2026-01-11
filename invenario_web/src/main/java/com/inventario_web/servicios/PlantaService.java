package com.inventario_web.servicios;

// IMPORTACIONES NECESARIAS
import java.util.List; // Resuelve el error de "List cannot be resolved"
import com.inventario_web.model.Planta; // Resuelve el error de "Planta cannot be resolved"

public interface PlantaService {
    
    List<Planta> listarTodas();
    
    Planta buscarPorId(Long id);
    
    // Si tienes otros métodos como guardar o eliminar, añádelos aquí
}