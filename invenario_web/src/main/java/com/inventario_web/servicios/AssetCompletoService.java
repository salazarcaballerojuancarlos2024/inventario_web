package com.inventario_web.servicios;

import com.inventario_web.model.AssetCompletoView;
import com.inventario_web.repositorio.AssetCompletoViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AssetCompletoService {

    private final AssetCompletoViewRepository assetCompletoViewRepository;

    @Autowired
    public AssetCompletoService(AssetCompletoViewRepository assetCompletoViewRepository) {
        this.assetCompletoViewRepository = assetCompletoViewRepository;
    }

    public List<AssetCompletoView> obtenerTodos() {
        return assetCompletoViewRepository.findAll();
    }

    public List<AssetCompletoView> obtenerPorPlanta(Long plantaId) {
        return assetCompletoViewRepository.findByPlantaId(plantaId);
    }

    public Optional<AssetCompletoView> obtenerPorTag(String assetTag) {
        return assetCompletoViewRepository.findByAssetTag(assetTag);
    }

    public List<AssetCompletoView> buscar(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return obtenerTodos();
        }
        return assetCompletoViewRepository.buscarGlobalmente(texto.trim());
    }
}