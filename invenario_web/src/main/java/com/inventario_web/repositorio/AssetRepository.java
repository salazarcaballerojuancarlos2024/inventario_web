package com.inventario_web.repositorio;

import com.inventario_web.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Repositorio para la entidad Asset.
 * Se extiende JpaRepository usando Long para coincidir con el @Id numérico de la entidad.
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /**
     * Busca un equipo por su etiqueta lógica (assetTag).
     * Es fundamental para las búsquedas desde el frontend y el modal de edición.
     */
    Asset findByAssetTag(String assetTag);

    /**
     * Comprueba si existe un equipo con un Tag específico.
     */
    boolean existsByAssetTag(String assetTag);

    /**
     * NUEVA FUNCIONALIDAD: Eliminar directamente por Asset Tag.
     * Al añadir @Transactional aquí, permitimos que Spring gestione el borrado
     * directamente por este campo sin tener que buscar el objeto Id antes.
     */
    @Transactional
    void deleteByAssetTag(String assetTag);
}