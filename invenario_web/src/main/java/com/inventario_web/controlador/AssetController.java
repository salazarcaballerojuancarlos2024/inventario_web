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
    private AssetService assetService; // Usamos el Service en lugar del Repo directamente

    @Autowired
    private PlantaRepository plantaRepository;

    /**
     * 1. ACTUALIZAR DATOS
     * Maneja el modal de edición y los cambios de planta vía Dropzone.
     */
    @PostMapping("/actualizar-datos")
    public ResponseEntity<?> actualizarAsset(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            Asset assetExistente = assetService.findByAssetTag(tag);
            
            if (assetExistente != null) {
                // Actualización de campos de texto
                if (payload.containsKey("nombreUsuario")) assetExistente.setNombreUsuario((String) payload.get("nombreUsuario"));
                if (payload.containsKey("ram")) assetExistente.setRam((String) payload.get("ram"));
                if (payload.containsKey("cpu")) assetExistente.setCpu((String) payload.get("cpu"));
                if (payload.containsKey("disco")) assetExistente.setDisco((String) payload.get("disco"));
                if (payload.containsKey("versionSo")) assetExistente.setVersionSo((String) payload.get("versionSo"));
                if (payload.containsKey("otros")) assetExistente.setOtros((String) payload.get("otros"));
                
                // Actualizar Tipo de Equipo (PC/Portátil)
                if (payload.containsKey("tipoEquipo")) {
                    assetExistente.setTipoEquipo((String) payload.get("tipoEquipo"));
                }
                
                // Cambio de Planta
                if (payload.containsKey("plantaId")) {
                    Object plantaObj = payload.get("plantaId");
                    if (plantaObj != null && !plantaObj.toString().isEmpty()) {
                        Long plantaId = Long.parseLong(plantaObj.toString());
                        Planta nuevaPlanta = plantaRepository.findById(plantaId).orElse(null);
                        if (nuevaPlanta != null) {
                            assetExistente.setPlanta(nuevaPlanta);
                            // Si se mueve a otra planta, reseteamos coordenadas para que no aparezca "fuera" del plano
                            assetExistente.setPosX(0);
                            assetExistente.setPosY(0);
                        }
                    }
                }
                
                assetService.guardarAsset(assetExistente);
                return ResponseEntity.ok(Map.of("mensaje", "Equipo " + tag + " actualizado con éxito"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Asset no encontrado"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar: " + e.getMessage()));
        }
    }

    /**
     * ACTUALIZAR POSICIONES (Sincronización)
     * Soporta tanto movimientos individuales como masivos.
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
                    // Usamos Number para evitar errores si el JSON envía decimales (float/double)
                    if (mov.containsKey("posX")) {
                        asset.setPosX(((Number) mov.get("posX")).intValue());
                    }
                    if (mov.containsKey("posY")) {
                        asset.setPosY(((Number) mov.get("posY")).intValue());
                    }
                    assetsParaGuardar.add(asset);
                }
            }
            
            assetService.guardarTodos(assetsParaGuardar);
            return ResponseEntity.ok(Map.of("mensaje", "Se han actualizado " + assetsParaGuardar.size() + " activos"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en sincronización: " + e.getMessage()));
        }
    }

    /**
     * 3. ELIMINAR ASSET (Botón '-' rojo)
     * Borrado permanente desde la tabla de almacén.
     */
    @DeleteMapping("/eliminar/{tag}")
    public ResponseEntity<?> eliminarAsset(@PathVariable String tag) {
        try {
            Asset asset = assetService.findByAssetTag(tag);
            if (asset != null) {
                assetService.eliminarAsset(tag);
                return ResponseEntity.ok(Map.of("mensaje", "Asset " + tag + " eliminado correctamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "El equipo no existe"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error al eliminar el activo"));
        }
    }
}