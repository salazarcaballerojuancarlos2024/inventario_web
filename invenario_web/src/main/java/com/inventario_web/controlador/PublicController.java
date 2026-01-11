package com.inventario_web.controlador;

// IMPORTACIONES DE SPRING (Esto resuelve Model, RequestParam, GetMapping, etc.)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model; 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

// IMPORTACIONES DE TU PROYECTO (Asegúrate de que estas rutas sean correctas)
import com.inventario_web.servicios.AssetService;
import com.inventario_web.servicios.PlantaService; // Verifica que se llame así
import com.inventario_web.model.Planta;

@Controller
@RequestMapping("/publico")
public class PublicController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private PlantaService plantaService; 

    @GetMapping
    public String verInventarioPublico(
            @RequestParam(value = "plantaId", required = false) Long plantaId, 
            Model model) {
        
        // 1. Cargamos todas las plantas para el sidebar_public
        // Nota: Asegúrate de que el método en tu PlantaService sea 'listarTodas' u 'obtenerTodas'
        model.addAttribute("plantas", plantaService.listarTodas());

        // 2. Si el usuario seleccionó una planta, cargamos sus datos
        if (plantaId != null) {
            model.addAttribute("plantaSeleccionada", plantaService.buscarPorId(plantaId));
            model.addAttribute("assets", assetService.buscarPorPlanta(plantaId));
        } else {
            model.addAttribute("plantaSeleccionada", null);
        }

        // Importante: Este es el nombre del archivo en templates/inventario_publico.html
        return "inventario_publico"; 
    }
}