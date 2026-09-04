package com.inventario_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class InvenarioWebApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        // Esto le dice a Tomcat que use esta clase como configuración
        return application.sources(InvenarioWebApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(InvenarioWebApplication.class, args);
    }
}
