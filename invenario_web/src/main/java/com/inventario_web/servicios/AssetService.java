package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import java.util.List;

public interface AssetService {
    List<Asset> obtenerTodosLosAssets();
    List<Asset> buscarPorPlanta(Long plantaId); // <--- NUEVO MÉTODO
    Asset guardarAsset(Asset asset);
    Asset findByAssetTag(String assetTag);
    void eliminarAsset(String assetTag);
    void eliminarListaDeTags(List<String> tags);
    void guardarTodos(List<Asset> assets);
    boolean existePorTag(String assetTag);
}