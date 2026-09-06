package com.inventario_web.repositorio;

import com.inventario_web.model.AssetCompletoView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetCompletoViewRepository extends JpaRepository<AssetCompletoView, Long> {

    // Buscar todos los activos completos asignados a una planta específica
    List<AssetCompletoView> findByPlantaId(Long plantaId);

    // Buscar por Asset Tag exacto
    Optional<AssetCompletoView> findByAssetTag(String assetTag);

    // Búsqueda rápida por nombre de equipo (campo equipo_tag)
    List<AssetCompletoView> findByEquipoTagContainingIgnoreCase(String equipoTag);

    // Búsqueda global (para la interfaz pública): busca por tag, equipo, nombre de usuario o departamento
    @Query("SELECT v FROM AssetCompletoView v WHERE " +
           "LOWER(v.assetTag) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(v.equipoTag) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(v.usuarioNombreCompleto) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
           "LOWER(v.usuarioDepartamento) LIKE LOWER(CONCAT('%', :filtro, '%'))")
    List<AssetCompletoView> buscarGlobalmente(@Param("filtro") String filtro);
}