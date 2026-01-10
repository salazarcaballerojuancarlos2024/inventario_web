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

    /**
     * Borrado masivo de activos por su etiqueta (Asset Tag).
     * Se utiliza en la funcionalidad tipo Gmail de vista-Datos.html.
     */
    @Override
    @Transactional
    public void eliminarListaDeTags(List<String> tags) {
        if (tags != null && !tags.isEmpty()) {
            // Usamos el repositorio para eliminar uno a uno dentro de la misma transacción
            tags.forEach(tag -> assetRepository.deleteByAssetTag(tag));
        }
    }

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
     * Eliminar un equipo individual.
     */
    @Override
    @Transactional
    public void eliminarAsset(String assetTag) {
        if (assetRepository.existsByAssetTag(assetTag)) {
            assetRepository.deleteByAssetTag(assetTag);
        }
    }

    /**
     * Guarda una lista completa de activos.
     * Crucial para guardar las posiciones (posX, posY) de todos los iconos a la vez.
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