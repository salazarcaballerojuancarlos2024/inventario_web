package com.inventario_web.controlador;

import com.inventario_web.model.Planta; // Asegúrate de tener este import
import com.inventario_web.repositorio.PlantaRepository;
import com.inventario_web.servicios.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;


@Controller
public class MainController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private PlantaRepository plantaRepository;

    @Value("${config.url.externa}")
    private String urlExterna;

    @GetMapping("/")
    public String index(@RequestParam(name = "plantaId", required = false) Long plantaId, Model model) {
        List<Planta> todasLasPlantas = plantaRepository.findAll();
        model.addAttribute("plantas", todasLasPlantas);

        if (plantaId != null) {
            Planta seleccionada = plantaRepository.findById(plantaId).orElse(null);
            model.addAttribute("plantaSeleccionada", seleccionada);
            model.addAttribute("assets", (seleccionada != null) ? seleccionada.getAssets() : assetService.obtenerTodosLosAssets());
        } else {
            model.addAttribute("plantaSeleccionada", null);
            model.addAttribute("assets", assetService.obtenerTodosLosAssets());
        }
        
        // Sincronizamos el nombre con el HTML
        model.addAttribute("urlExterna", urlExterna);
        model.addAttribute("version", System.currentTimeMillis()); 
        
        return "index";
    }
}