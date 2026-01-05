package com.inventario_web.servicios;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class StorageService {

    @Value("${storage.location}")
    private String storageLocation;

    // Esta anotación hace que el método se ejecute solo al iniciar la app
    @PostConstruct
    public void init() {
        try {
            Path root = Paths.get(storageLocation);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                System.out.println(">> Carpeta de planos creada en: " + storageLocation);
            } else {
                System.out.println(">> La carpeta de planos ya existe en: " + storageLocation);
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar el almacenamiento de planos", e);
        }
    }

    public String getStorageLocation() {
        return storageLocation;
    }
}