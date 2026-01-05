package com.inventario_web.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plantas")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "imagen_nombre", nullable = false)
    private String imagenNombre;

    @OneToMany(mappedBy = "planta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference // <--- EVITA EL BUCLE INFINITO (Lado padre)
    private List<Asset> assets = new ArrayList<>();

    public Planta() {}

    public Planta(String nombre, String imagenNombre) {
        this.nombre = nombre;
        this.imagenNombre = imagenNombre;
    }

    // --- MÉTODOS HELPER ---
    public void addAsset(Asset asset) {
        assets.add(asset);
        asset.setPlanta(this);
    }

    public void removeAsset(Asset asset) {
        assets.remove(asset);
        asset.setPlanta(null);
    }

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getImagenNombre() { return imagenNombre; }
    public void setImagenNombre(String imagenNombre) { this.imagenNombre = imagenNombre; }
    public List<Asset> getAssets() { return assets; }
    public void setAssets(List<Asset> assets) { this.assets = assets; }
}