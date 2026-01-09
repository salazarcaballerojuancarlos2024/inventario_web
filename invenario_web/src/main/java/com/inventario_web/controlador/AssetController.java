package com.inventario_web.controlador;

import com.inventario_web.model.Asset;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.PlantaRepository;
import com.inventario_web.servicios.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller; // Cambiado para soportar vistas
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller // Cambiado de @RestController a @Controller
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private PlantaRepository plantaRepository;

    /**
     * Carga la página principal con todos los datos necesarios
     */
    @GetMapping("/index")
    public String index(Model model) {
        List<Asset> todos = assetService.obtenerTodosLosAssets();
        model.addAttribute("todosLosAssets", todos);

        List<Planta> plantas = plantaRepository.findAll();
        model.addAttribute("plantas", plantas);

        if (!plantas.isEmpty()) {
            model.addAttribute("plantaSeleccionada", plantas.get(0));
            List<Asset> assetsPlanta = todos.stream()
                .filter(a -> a.getPlanta() != null && a.getPlanta().getId().equals(plantas.get(0).getId()))
                .toList();
            model.addAttribute("assets", assetsPlanta);
        } else {
            model.addAttribute("assets", new ArrayList<>());
        }

        return "index"; // Renderiza index.html
    }

    /**
     * 1. CREAR NUEVO ACTIVO
     * Invocado cuando esNuevoAsset = true en el JS
     */
    @PostMapping("/crear")
    @ResponseBody // Necesario porque la clase es @Controller
    public ResponseEntity<?> crearAsset(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            
            // Verificación de duplicados
            if (assetService.findByAssetTag(tag) != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El Asset Tag '" + tag + "' ya existe."));
            }

            Asset nuevo = new Asset();
            nuevo.setAssetTag(tag);
            actualizarCamposComunes(nuevo, payload);
            
            // Al ser nuevo, forzamos posición inicial si no viene dada
            nuevo.setPosX(payload.containsKey("posX") ? Integer.parseInt(payload.get("posX").toString()) : 0);
            nuevo.setPosY(payload.containsKey("posY") ? Integer.parseInt(payload.get("posY").toString()) : 0);

            // Asignar planta inicial
            if (payload.get("plantaId") != null && !payload.get("plantaId").toString().isEmpty()) {
                Long pId = Long.parseLong(payload.get("plantaId").toString());
                plantaRepository.findById(pId).ifPresent(nuevo::setPlanta);
            }

            assetService.guardarAsset(nuevo);
            return ResponseEntity.ok(Map.of("mensaje", "Activo creado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al crear: " + e.getMessage()));
        }
    }

    /**
     * 2. ACTUALIZAR DATOS EXISTENTES
     */
    @PostMapping("/actualizar-datos")
    @ResponseBody
    public ResponseEntity<?> actualizarAsset(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            Asset assetExistente = assetService.findByAssetTag(tag);
            
            if (assetExistente != null) {
                actualizarCamposComunes(assetExistente, payload);
                
                if (payload.containsKey("plantaId") && payload.get("plantaId") != null) {
                    Long nuevaPlantaId = Long.parseLong(payload.get("plantaId").toString());
                    Long plantaActualId = (assetExistente.getPlanta() != null) ? assetExistente.getPlanta().getId() : -1L;

                    if (!nuevaPlantaId.equals(plantaActualId)) {
                        Planta nuevaPlanta = plantaRepository.findById(nuevaPlantaId).orElse(null);
                        if (nuevaPlanta != null) {
                            assetExistente.setPlanta(nuevaPlanta);
                            assetExistente.setPosX(0); // Reset por cambio de planta
                            assetExistente.setPosY(0);
                        }
                    } else {
                        if (payload.get("posX") != null) assetExistente.setPosX(Integer.parseInt(payload.get("posX").toString()));
                        if (payload.get("posY") != null) assetExistente.setPosY(Integer.parseInt(payload.get("posY").toString()));
                    }
                }
                
                assetService.guardarAsset(assetExistente);
                return ResponseEntity.ok(Map.of("mensaje", "Equipo actualizado con éxito"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Asset no encontrado"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. ELIMINAR ASSET
     */
    /**
     * 3. ELIMINAR ASSET - Cambiado a POST para máxima compatibilidad
     */
    @PostMapping("/eliminar/{tag}") // Cambiado de @DeleteMapping a @PostMapping
    @ResponseBody
    public ResponseEntity<?> eliminarAsset(@PathVariable String tag) {
        try {
            Asset asset = assetService.findByAssetTag(tag);
            if (asset != null) {
                assetService.eliminarAsset(tag);
                return ResponseEntity.ok(Map.of("mensaje", "Asset " + tag + " eliminado"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "El activo no existe en la base de datos"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al eliminar: " + e.getMessage()));
        }
    }

    /**
     * Métodos auxiliares para evitar repetición de código
     */
    private void actualizarCamposComunes(Asset asset, Map<String, Object> payload) {
        if (payload.containsKey("nombreUsuario")) asset.setNombreUsuario((String) payload.get("nombreUsuario"));
        if (payload.containsKey("ram")) asset.setRam((String) payload.get("ram"));
        if (payload.containsKey("cpu")) asset.setCpu((String) payload.get("cpu"));
        if (payload.containsKey("disco")) asset.setDisco((String) payload.get("disco"));
        if (payload.containsKey("versionSo")) asset.setVersionSo((String) payload.get("versionSo"));
        if (payload.containsKey("otros")) asset.setOtros((String) payload.get("otros"));
        if (payload.containsKey("tipoEquipo")) asset.setTipoEquipo((String) payload.get("tipoEquipo"));
    }

    @PostMapping("/actualizar-posiciones")
    @ResponseBody
    public ResponseEntity<?> actualizarPosiciones(@RequestBody List<Map<String, Object>> movimientos) {
        try {
            List<Asset> assetsParaGuardar = new ArrayList<>();
            for (Map<String, Object> mov : movimientos) {
                Asset asset = assetService.findByAssetTag((String) mov.get("assetTag"));
                if (asset != null) {
                    asset.setPosX(((Number) mov.get("posX")).intValue());
                    asset.setPosY(((Number) mov.get("posY")).intValue());
                    assetsParaGuardar.add(asset);
                }
            }
            assetService.guardarTodos(assetsParaGuardar);
            return ResponseEntity.ok(Map.of("mensaje", "Posiciones actualizadas"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/actualizar-posicion")
    @ResponseBody
    public ResponseEntity<?> actualizarPosicion(@RequestBody Map<String, Object> payload) {
        try {
            Asset asset = assetService.findByAssetTag((String) payload.get("assetTag"));
            if (asset != null) {
                asset.setPosX(((Number) payload.get("posX")).intValue());
                asset.setPosY(((Number) payload.get("posY")).intValue());
                assetService.guardarAsset(asset);
                return ResponseEntity.ok(Map.of("mensaje", "Posición guardada"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}