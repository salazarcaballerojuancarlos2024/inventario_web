package com.inventario_web.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable // Indica a JPA que es una vista/lectura y no intentará hacer INSERT/UPDATE sobre ella
@Table(name = "vista_assets_completos")
public class AssetCompleto {

    @Id
    private Long id; // El ID que proviene de la tabla assets

    @Column(name = "asset_tag")
    private String assetTag;

    @Column(name = "_nombre_usuario_")
    private String nombreUsuario;

    private String ram;
    private String cpu;
    private String disco;

    @Column(name = "version_so")
    private String versionSo;

    private String otros;

    @Column(name = "pos_x")
    private Double posX;

    @Column(name = "pos_y")
    private Double posY;

    @Column(name = "tipo_equipo")
    private String tipoEquipo;

    // Datos traídos de la tabla users
    private String nombre;
    private String apellidos;

    @Column(name = "correo_electronico")
    private String correoElectronico;

    private String telefono;
    private String departamento;
    private String cargo;
    private String oficina;

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public String getAssetTag() { return assetTag; }
    public String getNombreUsuario() { return nombreUsuario; }
    public String getRam() { return ram; }
    public String getCpu() { return cpu; }
    public String getDisco() { return disco; }
    public String getVersionSo() { return versionSo; }
    public String getOtros() { return otros; }
    public Double getPosX() { return posX; }
    public Double getPosY() { return posY; }
    public String getTipoEquipo() { return tipoEquipo; }
    public String getNombre() { return nombre; }
    public String getApellidos() { return apellidos; }
    public String getCorreoElectronico() { return correoElectronico; }
    public String getTelefono() { return telefono; }
    public String getDepartamento() { return departamento; }
    public String getCargo() { return cargo; }
    public String getOficina() { return oficina; }
}
