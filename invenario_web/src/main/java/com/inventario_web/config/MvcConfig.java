package com.inventario_web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    // Cogemos la ruta del archivo application.properties
    @Value("${storage.location}")
    private String storageLocation;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        /*
         * Este método le dice a Spring: 
         * "Cuando en el HTML veas una ruta que empiece por /planos-file/, 
         * no la busques en el proyecto, búscala en la carpeta externa C:/temp/..."
         */
        registry.addResourceHandler("/planos-file/**")
                .addResourceLocations("file:/" + storageLocation + "/");
    }
}