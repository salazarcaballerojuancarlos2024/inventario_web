package com.inventario_web.repositorio;

import com.inventario_web.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Asset findByAssetTag(String assetTag);

    boolean existsByAssetTag(String assetTag);

    /**
     * Eliminación por Tag.
     * Mantenemos una sola versión del método con las anotaciones necesarias.
     */
    @Modifying
    @Transactional
    void deleteByAssetTag(String assetTag);

    Asset findByAssetTagIgnoreCase(String assetTag);
}