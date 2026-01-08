package com.inventario_web.repositorio;

import com.inventario_web.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /**
     * Devuelve un Optional para manejar de forma más segura los casos
     * donde el Tag no existe, evitando NullPointerException.
     */
    Asset findByAssetTag(String assetTag);

    /**
     * Vital para el ServiceImpl: Se usa para validar que no duplicamos Tags 
     * al crear nuevos activos en el modal.
     */
    boolean existsByAssetTag(String assetTag);

    /**
     * Eliminación por Tag.
     * Añadimos @Modifying para indicar que es una operación de escritura/cambio
     * y @Transactional para asegurar que si algo falla, la DB no quede corrupta.
     */
    @Modifying
    @Transactional
    void deleteByAssetTag(String assetTag);

    /**
     * Opcional: Útil si necesitas buscar ignorando mayúsculas/minúsculas.
     */
    Asset findByAssetTagIgnoreCase(String assetTag);
}