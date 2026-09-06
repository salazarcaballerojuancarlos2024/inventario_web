package com.inventario_web.controlador;

import com.inventario_web.model.Asset;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.PlantaRepository;
import com.inventario_web.servicios.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
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

        return "index";
    }

    /**
     * IMPORTAR CSV Y GUARDAR/ACTUALIZAR EN BD
     */
    @PostMapping("/importar-csv")
    @ResponseBody
    public ResponseEntity<?> importarCsv(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("exito", false, "error", "El archivo proporcionado está vacío."));
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            String primeraLinea = br.readLine();
            if (primeraLinea == null) {
                return ResponseEntity.badRequest().body(Map.of("exito", false, "error", "El archivo CSV está completamente vacío."));
            }

            // Normalización de primera línea
            primeraLinea = primeraLinea.replace("\"", "").replace("\uFEFF", "").trim();
            String delimitador = primeraLinea.contains(";") ? ";" : ",";

            List<Asset> activosParaGuardar = new ArrayList<>();
            String linea;
            int count = 0;

            while ((linea = br.readLine()) != null) {
                if (linea.trim().isEmpty()) continue;

                try {
                    String[] columnas = linea.split(delimitador, -1);
                    if (columnas.length < 1) continue;

                    String tag = columnas[0].replace("\"", "").trim();
                    if (tag.isEmpty() || tag.equalsIgnoreCase("tag")) continue; // Evitar procesar cabecera

                    Asset asset = assetService.findByAssetTag(tag);
                    if (asset == null) {
                        asset = new Asset();
                        asset.setAssetTag(tag);
                        asset.setPosX(2.0);
                        asset.setPosY(2.0);
                    }

                    if (columnas.length > 1) {
                        String usuarioStr = columnas[1].replace("\"", "").trim();
                        asset.setNombreUsuario(usuarioStr);
                        String[] partes = usuarioStr.split("\\s+", 2);
                        asset.setNombre(partes[0]);
                        asset.setApellido(partes.length > 1 ? partes[1] : "");
                    }

                    if (columnas.length > 2) asset.setTipoEquipo(columnas[2].replace("\"", "").trim());

                    if (columnas.length > 3) {
                        String nombreUbicacion = columnas[3].replace("\"", "").trim();
                        if (!nombreUbicacion.isEmpty() && !nombreUbicacion.equalsIgnoreCase("Sin Ubicación")) {
                            Planta planta = plantaRepository.findByNombre(nombreUbicacion).orElse(null);
                            asset.setPlanta(planta);
                        } else {
                            asset.setPlanta(null);
                        }
                    }

                    if (columnas.length > 4) asset.setSnipeitRam(columnas[4].replace("\"", "").trim());
                    if (columnas.length > 5) asset.setSnipeitCpu(columnas[5].replace("\"", "").trim());
                    if (columnas.length > 6) asset.setSnipeitDisco(columnas[6].replace("\"", "").trim());
                    if (columnas.length > 7) asset.setSnipeitVersionSo(columnas[7].replace("\"", "").trim());
                    if (columnas.length > 8) asset.setSnipeitOtros(columnas[8].replace("\"", "").trim());

                    activosParaGuardar.add(asset);
                    count++;
                } catch (Exception exFila) {
                    System.err.println("Error procesando línea CSV: " + linea + " | " + exFila.getMessage());
                }
            }

            if (!activosParaGuardar.isEmpty()) {
                assetService.guardarTodos(activosParaGuardar);
            }

            return ResponseEntity.ok(Map.of(
                "exito", true,
                "registrosProcesados", count
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("exito", false, "error", "Error interno al guardar los registros en BD: " + e.getMessage()));
        }
    }

    @PostMapping("/eliminar-multiple")
    @ResponseBody
    public ResponseEntity<?> eliminarMultiple(@RequestBody Map<String, List<String>> payload) {
        List<String> tags = payload.get("tags");
        
        if (tags == null || tags.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se han seleccionado activos."));
        }

        try {
            assetService.eliminarListaDeTags(tags); 
            return ResponseEntity.ok(Map.of("message", "Se han eliminado " + tags.size() + " activos correctamente."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al procesar el borrado: " + e.getMessage()));
        }
    }

    /**
     * 1. CREAR NUEVO ACTIVO
     */
    @PostMapping("/crear")
    @ResponseBody
    public ResponseEntity<?> crearAsset(@RequestBody Map<String, Object> payload) {
        try {
            String tag = (String) payload.get("assetTag");
            
            if (assetService.findByAssetTag(tag) != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El Asset Tag '" + tag + "' ya existe."));
            }

            Asset nuevo = new Asset();
            nuevo.setAssetTag(tag);
            actualizarCamposComunes(nuevo, payload);
            
            nuevo.setPosX(payload.containsKey("posX") ? Double.parseDouble(payload.get("posX").toString()) : 0.0);
            nuevo.setPosY(payload.containsKey("posY") ? Double.parseDouble(payload.get("posY").toString()) : 0.0);

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
                            assetExistente.setPosX(0.0); 
                            assetExistente.setPosY(0.0);
                        }
                    } else {
                        if (payload.get("posX") != null) {
                            assetExistente.setPosX(Double.parseDouble(payload.get("posX").toString()));
                        }
                        if (payload.get("posY") != null) {
                            assetExistente.setPosY(Double.parseDouble(payload.get("posY").toString()));
                        }
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
    @PostMapping("/eliminar/{tag}")
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

    private void actualizarCamposComunes(Asset asset, Map<String, Object> payload) {
        if (payload.containsKey("nombreUsuario")) {
            String u = (String) payload.get("nombreUsuario");
            asset.setNombreUsuario(u);
            if (u != null && !u.trim().isEmpty()) {
                String[] partes = u.trim().split("\\s+", 2);
                asset.setNombre(partes[0]);
                asset.setApellido(partes.length > 1 ? partes[1] : "");
            } else {
                asset.setNombre("");
                asset.setApellido("");
            }
        }
        if (payload.containsKey("ram")) asset.setSnipeitRam((String) payload.get("ram"));
        if (payload.containsKey("cpu")) asset.setSnipeitCpu((String) payload.get("cpu"));
        if (payload.containsKey("disco")) asset.setSnipeitDisco((String) payload.get("disco"));
        if (payload.containsKey("versionSo")) asset.setSnipeitVersionSo((String) payload.get("versionSo"));
        if (payload.containsKey("otros")) asset.setSnipeitOtros((String) payload.get("otros"));
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
                    if (mov.get("posX") != null) {
                        asset.setPosX(Double.parseDouble(mov.get("posX").toString()));
                    }
                    if (mov.get("posY") != null) {
                        asset.setPosY(Double.parseDouble(mov.get("posY").toString()));
                    }
                    assetsParaGuardar.add(asset);
                }
            }
            assetService.guardarTodos(assetsParaGuardar);
            return ResponseEntity.ok(Map.of("mensaje", "Posiciones actualizadas"));
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/actualizar-posicion")
    @ResponseBody
    public ResponseEntity<?> actualizarPosicion(@RequestBody Map<String, Object> payload) {
        try {
            Asset asset = assetService.findByAssetTag((String) payload.get("assetTag"));
            if (asset != null) {
                if (payload.get("posX") != null) {
                    asset.setPosX(Double.parseDouble(payload.get("posX").toString()));
                }
                if (payload.get("posY") != null) {
                    asset.setPosY(Double.parseDouble(payload.get("posY").toString()));
                }
                assetService.guardarAsset(asset);
                return ResponseEntity.ok(Map.of("mensaje", "Posición guardada"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}