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

    @GetMapping("/")
    public String index(
            @RequestParam(name = "plantaId", required = false) Long plantaId, 
            @RequestParam(name = "seccion", required = false) String seccion, 
            Model model) {

        List<Planta> todasLasPlantas = plantaRepository.findAll();
        model.addAttribute("plantas", todasLasPlantas);

        // CASO 1: SECCIÓN ALMACÉN (Forzamos carga de Planta ID 1)
        if ("vista-almacen".equals(seccion)) {
            Planta almacen = plantaRepository.findById(1L).orElse(null);
            model.addAttribute("plantaSeleccionada", almacen);
            
            // RECOMENDACIÓN: Si quieres ver TODOS los activos en el almacén, 
            // usa assetService.obtenerTodosLosAssets() aquí.
            // Si solo quieres los de la Planta 1, dejamos almacen.getAssets().
            model.addAttribute("assets", assetService.obtenerTodosLosAssets());
        } 
        
        // CASO 2: SECCIÓN DE PLANTA ESPECÍFICA (Mapa interactivo de planta)
        else if (plantaId != null) {
            Planta seleccionada = plantaRepository.findById(plantaId).orElse(null);
            model.addAttribute("plantaSeleccionada", seleccionada);
            model.addAttribute("assets", (seleccionada != null) ? seleccionada.getAssets() : List.of());
        } 
        
        // CASO 3: ESTADO INICIAL (BIENVENIDA)
        else {
            model.addAttribute("plantaSeleccionada", null);
            // LISTA VACÍA: Esto garantiza que la Pantalla de Bienvenida esté limpia
            model.addAttribute("assets", List.of()); 
        }

       
        model.addAttribute("version", System.currentTimeMillis()); 
        
        return "index";
    }
}