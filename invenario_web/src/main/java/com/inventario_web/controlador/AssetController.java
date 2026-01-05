package com.inventario_web.controlador;

import com.inventario_web.model.Asset;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.AssetRepository;
import com.inventario_web.repositorio.PlantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    /**
     * 1. ACTUALIZAR DATOS (Desde el Modal Update)
     * Ahora incluye la capacidad de cambiar de planta mediante plantaId.
     */
    @PostMapping("/actualizar-datos")
    public ResponseEntity<?> actualizarAsset(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            Asset assetExistente = assetRepository.findByAssetTag(tag);
            
            if (assetExistente != null) {
                // Actualización de campos de texto
                assetExistente.setNombreUsuario((String) payload.get("nombreUsuario"));
                assetExistente.setRam((String) payload.get("ram"));
                assetExistente.setCpu((String) payload.get("cpu"));
                assetExistente.setDisco((String) payload.get("disco"));
                assetExistente.setVersionSo((String) payload.get("versionSo"));
                assetExistente.setOtros((String) payload.get("otros"));
                
                // Lógica para cambio de Planta
                if (payload.containsKey("plantaId")) {
                    Long plantaId = Long.parseLong(payload.get("plantaId").toString());
                    Planta nuevaPlanta = plantaRepository.findById(plantaId).orElse(null);
                    if (nuevaPlanta != null) {
                        assetExistente.setPlanta(nuevaPlanta);
                    }
                }
                
                assetRepository.save(assetExistente);
                return ResponseEntity.ok(Map.of("mensaje", "Equipo " + tag + " actualizado con éxito"));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Asset no encontrado"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar: " + e.getMessage()));
        }
    }

    /**
     * 2. ACTUALIZAR POSICIONES (Guardado Masivo tras arrastre)
     * Mantiene tu funcionalidad original intacta.
     */
    @PostMapping("/actualizar-posiciones")
    public ResponseEntity<?> actualizarPosiciones(@RequestBody List<Map<String, Object>> movimientos) {
        try {
            List<Asset> assetsParaGuardar = new ArrayList<>();

            for (Map<String, Object> mov : movimientos) {
                String tag = (String) mov.get("assetTag");
                int posX = ((Number) mov.get("posX")).intValue();
                int posY = ((Number) mov.get("posY")).intValue();
                
                Asset asset = assetRepository.findByAssetTag(tag);
                if (asset != null) {
                    asset.setPosX(posX);
                    asset.setPosY(posY);
                    assetsParaGuardar.add(asset);
                }
            }
            
            if (!assetsParaGuardar.isEmpty()) {
                assetRepository.saveAll(assetsParaGuardar);
            }
            
            return ResponseEntity.ok(Map.of("mensaje", "Posiciones de " + assetsParaGuardar.size() + " iconos sincronizadas"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error al procesar el movimiento: " + e.getMessage()));
        }
    }

    /**
     * 3. ELIMINAR ASSET
     */
    @DeleteMapping("/eliminar/{tag}")
    public ResponseEntity<?> eliminarAsset(@PathVariable String tag) {
        try {
            Asset asset = assetRepository.findByAssetTag(tag);
            if (asset != null) {
                assetRepository.delete(asset);
                return ResponseEntity.ok(Map.of("mensaje", "Asset " + tag + " eliminado correctamente"));
            }
            return ResponseEntity.status(404).body(Map.of("error", "El equipo no existe"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "No se pudo eliminar"));
        }
    }
}