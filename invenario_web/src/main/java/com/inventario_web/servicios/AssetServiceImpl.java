package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import com.inventario_web.repositorio.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Override
    public List<Asset> obtenerTodosLosAssets() {
        return assetRepository.findAll();
    }

    @Override
    public Asset guardarAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    @Override
    public Asset obtenerPorTag(String assetTag) {
        return assetRepository.findById(assetTag).orElse(null);
    }
}