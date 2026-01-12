package com.inventario_web.repositorio;

import com.inventario_web.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    // --- Búsquedas ---
    Asset findByAssetTag(String assetTag);
    
    Asset findByAssetTagIgnoreCase(String assetTag);

    // NUEVO: Fundamental para la vista pública y filtrado por ubicación
    List<Asset> findByPlantaId(Long plantaId);

    // --- Validaciones ---
    boolean existsByAssetTag(String assetTag);

    List<Asset> findByPlantaIdOrderByNombreUsuarioAsc(Long plantaId);
    /**
     * Eliminación por Tag.
     * @Modifying se usa para consultas que modifican la BD (INSERT, UPDATE, DELETE).
     * @Transactional asegura que la operación sea atómica.
     */
    @Modifying
    @Transactional
    void deleteByAssetTag(String assetTag);
    
    // Opcional: Para eliminación múltiple si el service lo requiere
    @Modifying
    @Transactional
    void deleteByAssetTagIn(List<String> assetTags);
}