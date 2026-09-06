package com.inventario_web.controlador;

import com.inventario_web.model.AssetCompleto;
import com.inventario_web.repositorio.AssetCompletoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets-completos")
@CrossOrigin(origins = "*") // Permite peticiones desde cualquier frontend
public class AssetCompletoController {

    private final AssetCompletoRepository assetCompletoRepository;

    // Inyección de dependencias por constructor
    public AssetCompletoController(AssetCompletoRepository assetCompletoRepository) {
        this.assetCompletoRepository = assetCompletoRepository;
    }

    // GET: http://localhost:8080/api/assets-completos
    @GetMapping
    public List<AssetCompleto> obtenerTodos() {
        return assetCompletoRepository.findAll();
    }

    // GET: http://localhost:8080/api/assets-completos/1
    @GetMapping("/{id}")
    public AssetCompleto obtenerPorId(@PathVariable Long id) {
        return assetCompletoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset no encontrado con ID: " + id));
    }
}
