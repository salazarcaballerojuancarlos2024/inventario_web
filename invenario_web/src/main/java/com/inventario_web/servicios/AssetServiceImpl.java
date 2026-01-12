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
    public List<Asset> buscarPorPlanta(Long plantaId) {
        return assetRepository.findByPlantaId(plantaId);
    }

    /* --- ESTE ES EL MÉTODO QUE FALTABA PARA EL BUSCADOR --- */
    @Override
    @Transactional(readOnly = true)
    public List<Asset> buscarPorPlantaOrdenadosPorUsuario(Long plantaId) {
        // Llama al repositorio para obtener los datos filtrados y ordenados
        return assetRepository.findByPlantaIdOrderByNombreUsuarioAsc(plantaId);
    }

    @Override
    @Transactional
    public void eliminarListaDeTags(List<String> tags) {
        if (tags != null && !tags.isEmpty()) {
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

    @Override
    @Transactional
    public void eliminarAsset(String assetTag) {
        if (assetRepository.existsByAssetTag(assetTag)) {
            assetRepository.deleteByAssetTag(assetTag);
        }
    }

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