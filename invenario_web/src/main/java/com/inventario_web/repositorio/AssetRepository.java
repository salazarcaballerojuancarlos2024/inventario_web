package com.inventario_web.repositorio;

import com.inventario_web.model.Asset; // Asegúrate de que el package sea correcto (modelo o model)
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {
    // Este método busca por el campo assetTag
    Asset findByAssetTag(String assetTag);
}