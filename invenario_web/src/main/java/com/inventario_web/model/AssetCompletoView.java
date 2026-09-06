package com.inventario_web.model;


import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "vista_assets_completos", schema = "inventario")
public class AssetCompletoView {

    @Id
    @Column(name = "asset_id")
    private Long id;

    @Column(name = "asset_tag")
    private String assetTag;

    @Column(name = "equipo_tag")
    private String equipoTag;

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

    @Column(name = "planta_id")
    private Long plantaId;

    @Column(name = "tipo_equipo")
    private String tipoEquipo;

    // Campos vinculados de la tabla listin.users
    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "usuario_nombre")
    private String usuarioNombre;

    @Column(name = "usuario_apellidos")
    private String usuarioApellidos;

    @Column(name = "usuario_nombre_completo")
    private String usuarioNombreCompleto;

    @Column(name = "usuario_email")
    private String usuarioEmail;

    @Column(name = "usuario_telefono")
    private String usuarioTelefono;

    @Column(name = "usuario_departamento")
    private String usuarioDepartamento;

    @Column(name = "usuario_cargo")
    private String usuarioCargo;

    @Column(name = "usuario_oficina")
    private String usuarioOficina;

    @Column(name = "usuario_planta_nombre")
    private String usuarioPlantaNombre;

    public AssetCompletoView() {}

    // --- GETTERS ---
    public Long getId() { return id; }
    public String getAssetTag() { return assetTag; }
    public String getEquipoTag() { return equipoTag; }
    public String getRam() { return ram; }
    public String getCpu() { return cpu; }
    public String getDisco() { return disco; }
    public String getVersionSo() { return versionSo; }
    public String getOtros() { return otros; }
    public Double getPosX() { return posX; }
    public Double getPosY() { return posY; }
    public Long getPlantaId() { return plantaId; }
    public String getTipoEquipo() { return tipoEquipo; }
    public Long getUsuarioId() { return usuarioId; }
    public String getUsuarioNombre() { return usuarioNombre; }
    public String getUsuarioApellidos() { return usuarioApellidos; }
    public String getUsuarioNombreCompleto() { return usuarioNombreCompleto; }
    public String getUsuarioEmail() { return usuarioEmail; }
    public String getUsuarioTelefono() { return usuarioTelefono; }
    public String getUsuarioDepartamento() { return usuarioDepartamento; }
    public String getUsuarioCargo() { return usuarioCargo; }
    public String getUsuarioOficina() { return usuarioOficina; }
    public String getUsuarioPlantaNombre() { return usuarioPlantaNombre; }
}