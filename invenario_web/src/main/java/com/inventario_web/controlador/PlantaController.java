package com.inventario_web.controlador;

import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.PlantaRepository;
import com.inventario_web.servicios.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Controller
@RequestMapping("/plantas")
public class PlantaController {

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private StorageService storageService;

    /**
     * Guarda una nueva planta y su imagen
     */
    @PostMapping("/guardar")
    public String guardarPlanta(@RequestParam("nombre") String nombre,
                                @RequestParam("file") MultipartFile file) {
        if (!file.isEmpty()) {
            try {
                String nombreArchivo = procesarArchivo(file);
                Planta planta = new Planta(nombre, nombreArchivo);
                plantaRepository.save(planta);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return "redirect:/?seccion=vista-gestion-plantas";
    }

    /**
     * Actualiza la imagen de una planta existente y borra la anterior
     */
    @PostMapping("/actualizar-imagen")
    public String actualizarImagen(@RequestParam("id") Long id,
                                   @RequestParam("file") MultipartFile file) {
        plantaRepository.findById(id).ifPresent(planta -> {
            if (!file.isEmpty()) {
                try {
                    // 1. Borrar la imagen antigua físicamente para ahorrar espacio
                    borrarArchivoFisico(planta.getImagenNombre());

                    // 2. Guardar la nueva imagen
                    String nuevoNombre = procesarArchivo(file);
                    
                    // 3. Actualizar DB
                    planta.setImagenNombre(nuevoNombre);
                    plantaRepository.save(planta);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
        return "redirect:/?seccion=vista-gestion-plantas";
    }

    /**
     * Elimina una planta y su archivo de imagen asociado
     */
    @GetMapping("/eliminar/{id}")
    public String borrarPlanta(@PathVariable("id") Long id) {
        plantaRepository.findById(id).ifPresent(planta -> {
            // Protección: No permitir borrar el ALMACEN
            if (!"ALMACEN".equalsIgnoreCase(planta.getNombre())) {
                borrarArchivoFisico(planta.getImagenNombre());
                plantaRepository.delete(planta);
            }
        });
        return "redirect:/?seccion=vista-gestion-plantas";
    }

    // --- MÉTODOS PRIVADOS DE UTILIDAD (Limpieza de código) ---

    /**
     * Procesa el guardado del archivo en el sistema de archivos
     * He añadido un prefijo único para evitar colisiones de nombres
     */
    private String procesarArchivo(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        // Generamos un nombre único: UUID + nombre original
        String nombreUnico = UUID.randomUUID().toString() + "_" + originalName;
        
        Path rutaDestino = Paths.get(storageService.getStorageLocation()).resolve(nombreUnico);
        Files.copy(file.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);
        
        return nombreUnico;
    }

    /**
     * Intenta borrar un archivo del disco si existe
     */
    private void borrarArchivoFisico(String nombreArchivo) {
        if (nombreArchivo != null && !nombreArchivo.isEmpty()) {
            try {
                Path ruta = Paths.get(storageService.getStorageLocation()).resolve(nombreArchivo);
                Files.deleteIfExists(ruta);
            } catch (IOException e) {
                System.err.println("No se pudo borrar el archivo: " + nombreArchivo);
            }
        }
    }
}