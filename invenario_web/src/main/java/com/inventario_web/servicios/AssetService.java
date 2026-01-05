package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import java.util.List;

public interface AssetService {
    List<Asset> obtenerTodosLosAssets();
    Asset guardarAsset(Asset asset);
    Asset obtenerPorTag(String assetTag);
}