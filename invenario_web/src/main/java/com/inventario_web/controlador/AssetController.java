package com.inventario_web.controlador;

import com.inventario_web.model.Asset;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.PlantaRepository;
import com.inventario_web.servicios.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private PlantaRepository plantaRepository;

    /**
     * 1. ACTUALIZAR DATOS
     * Maneja el modal de edición y cambios de equipo.
     */
    @PostMapping("/actualizar-datos")
    public ResponseEntity<?> actualizarAsset(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            Asset assetExistente = assetService.findByAssetTag(tag);
            
            if (assetExistente != null) {
                // ... (Tus actualizaciones de texto: usuario, ram, etc., se mantienen igual)
                if (payload.containsKey("nombreUsuario")) assetExistente.setNombreUsuario((String) payload.get("nombreUsuario"));
                if (payload.containsKey("ram")) assetExistente.setRam((String) payload.get("ram"));
                if (payload.containsKey("cpu")) assetExistente.setCpu((String) payload.get("cpu"));
                if (payload.containsKey("disco")) assetExistente.setDisco((String) payload.get("disco"));
                if (payload.containsKey("versionSo")) assetExistente.setVersionSo((String) payload.get("versionSo"));
                if (payload.containsKey("otros")) assetExistente.setOtros((String) payload.get("otros"));
                if (payload.containsKey("tipoEquipo")) assetExistente.setTipoEquipo((String) payload.get("tipoEquipo"));
                
                // --- GESTIÓN DE UBICACIÓN Y COORDENADAS ---
                if (payload.containsKey("plantaId") && payload.get("plantaId") != null) {
                    Long nuevaPlantaId = Long.parseLong(payload.get("plantaId").toString());
                    Long plantaActualId = (assetExistente.getPlanta() != null) ? assetExistente.getPlanta().getId() : -1L;

                    if (!nuevaPlantaId.equals(plantaActualId)) {
                        // CAMBIO REAL DE PLANTA: Reseteo total
                        Planta nuevaPlanta = plantaRepository.findById(nuevaPlantaId).orElse(null);
                        if (nuevaPlanta != null) {
                            assetExistente.setPlanta(nuevaPlanta);
                            assetExistente.setPosX(0);
                            assetExistente.setPosY(0);
                        }
                    } else {
                        // MISMA PLANTA: Preservamos la posición enviada desde el modal
                        if (payload.containsKey("posX") && payload.get("posX") != null) {
                            assetExistente.setPosX(Integer.parseInt(payload.get("posX").toString()));
                        }
                        if (payload.containsKey("posY") && payload.get("posY") != null) {
                            assetExistente.setPosY(Integer.parseInt(payload.get("posY").toString()));
                        }
                    }
                }
                
                assetService.guardarAsset(assetExistente);
                return ResponseEntity.ok(Map.of("mensaje", "Equipo actualizado con éxito"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Asset no encontrado"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error crítico: " + e.getMessage()));
        }
    }

    /**
     * 2. ACTUALIZAR POSICIONES (Sincronización por Drag & Drop masivo)
     */
    @PostMapping("/actualizar-posiciones")
    public ResponseEntity<?> actualizarPosiciones(@RequestBody List<Map<String, Object>> movimientos) {
        try {
            if (movimientos == null || movimientos.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se recibieron datos"));
            }

            List<Asset> assetsParaGuardar = new ArrayList<>();

            for (Map<String, Object> mov : movimientos) {
                String tag = (String) mov.get("assetTag");
                if (tag == null) continue;

                Asset asset = assetService.findByAssetTag(tag);
                if (asset != null) {
                    if (mov.containsKey("posX")) asset.setPosX(((Number) mov.get("posX")).intValue());
                    if (mov.containsKey("posY")) asset.setPosY(((Number) mov.get("posY")).intValue());
                    assetsParaGuardar.add(asset);
                }
            }
            
            assetService.guardarTodos(assetsParaGuardar);
            return ResponseEntity.ok(Map.of("mensaje", "Posiciones actualizadas"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en sincronización: " + e.getMessage()));
        }
    }

    /**
     * 3. ELIMINAR ASSET
     */
    @DeleteMapping("/eliminar/{tag}")
    public ResponseEntity<?> eliminarAsset(@PathVariable String tag) {
        try {
            Asset asset = assetService.findByAssetTag(tag);
            if (asset != null) {
                assetService.eliminarAsset(tag);
                return ResponseEntity.ok(Map.of("mensaje", "Asset " + tag + " eliminado"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No existe"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error al eliminar"));
        }
    }
    
    /**
     * 4. ACTUALIZAR POSICIÓN INDIVIDUAL
     * Endpoint para guardar un solo movimiento sin esperar al botón "Guardar Todo"
     */
    @PostMapping("/actualizar-posicion")
    public ResponseEntity<?> actualizarPosicion(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            Asset asset = assetService.findByAssetTag(tag);
            if (asset != null) {
                if (payload.containsKey("posX")) asset.setPosX(((Number) payload.get("posX")).intValue());
                if (payload.containsKey("posY")) asset.setPosY(((Number) payload.get("posY")).intValue());
                assetService.guardarAsset(asset);
                return ResponseEntity.ok(Map.of("mensaje", "Posición de " + tag + " guardada"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No encontrado"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}