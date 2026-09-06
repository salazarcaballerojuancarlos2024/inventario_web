package com.inventario_web.controlador;


import com.inventario_web.model.AssetCompletoView;
import com.inventario_web.servicios.AssetCompletoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicDataController {

    private final AssetCompletoService assetCompletoService;

    @Autowired
    public PublicDataController(AssetCompletoService assetCompletoService) {
        this.assetCompletoService = assetCompletoService;
    }

    // Endpoint para obtener todos los datos combinados de la planta seleccionada
    @GetMapping("/assets-completos")
    public ResponseEntity<List<AssetCompletoView>> obtenerAssetsCompletos(
            @RequestParam(required = false) Long plantaId,
            @RequestParam(required = false) String buscar) {
        
        List<AssetCompletoView> resultado;

        if (buscar != null && !buscar.isEmpty()) {
            resultado = assetCompletoService.buscar(buscar);
        } else if (plantaId != null) {
            resultado = assetCompletoService.obtenerPorPlanta(plantaId);
        } else {
            resultado = assetCompletoService.obtenerTodos();
        }

        return ResponseEntity.ok(resultado);
    }
}