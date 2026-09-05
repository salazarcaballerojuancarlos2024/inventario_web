package com.inventario_web.repositorio;

import com.inventario_web.model.Planta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlantaRepository extends JpaRepository<Planta, Long> {

    // Añadir esta línea para habilitar la búsqueda por nombre devuelta en un Optional
    Optional<Planta> findByNombre(String nombre);
    
}