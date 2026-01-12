package com.inventario_web.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model; 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.inventario_web.servicios.AssetService;
import com.inventario_web.servicios.PlantaService; 
import com.inventario_web.model.Planta;
import com.inventario_web.model.Asset; // Importante añadir esta
import java.util.List;

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
        model.addAttribute("plantas", plantaService.listarTodas());

        // 2. Si el usuario seleccionó una planta, cargamos sus datos
        if (plantaId != null) {
            Planta planta = plantaService.buscarPorId(plantaId);
            model.addAttribute("plantaSeleccionada", planta);
            
            // BUSCADOR: Obtenemos los assets de ESTA planta ordenados por Usuario
            // Asegúrate de que este método exista en tu AssetService
            List<Asset> assetsOrdenados = assetService.buscarPorPlantaOrdenadosPorUsuario(plantaId);
            model.addAttribute("assets", assetsOrdenados);
            
        } else {
            model.addAttribute("plantaSeleccionada", null);
        }

        return "inventario_publico"; 
    }
}