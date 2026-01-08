package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import com.inventario_web.repositorio.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Asset> obtenerTodosLosAssets() {
        return assetRepository.findAll();
    }

    @Override
    @Transactional
    public Asset guardarAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public Asset findByAssetTag(String assetTag) {
        return assetRepository.findByAssetTag(assetTag);
    }

    /**
     * Eliminar un equipo permanentemente por su etiqueta.
     * Se utiliza el método deleteByAssetTag del repositorio para una ejecución directa.
     */
    @Override
    @Transactional
    public void eliminarAsset(String assetTag) {
        // Verificamos existencia para evitar excepciones innecesarias
        if (assetRepository.existsByAssetTag(assetTag)) {
            assetRepository.deleteByAssetTag(assetTag);
        }
    }

    /**
     * Guarda una lista completa de activos.
     * Fundamental para la sincronización masiva de coordenadas (posX, posY).
     */
    @Override
    @Transactional
    public void guardarTodos(List<Asset> assets) {
        if (assets != null && !assets.isEmpty()) {
            assetRepository.saveAll(assets);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existePorTag(String assetTag) {
        return assetRepository.existsByAssetTag(assetTag);
    }
}