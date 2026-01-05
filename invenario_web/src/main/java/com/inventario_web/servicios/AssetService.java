package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import java.util.List;

public interface AssetService {
    List<Asset> obtenerTodosLosAssets();
    Asset guardarAsset(Asset asset);
    Asset findByAssetTag(String assetTag); // Renombrado para coincidir con el Controller
    void eliminarAsset(String assetTag);    // Nueva funcionalidad de borrado
    void guardarTodos(List<Asset> assets); // Para el guardado masivo de posiciones
}