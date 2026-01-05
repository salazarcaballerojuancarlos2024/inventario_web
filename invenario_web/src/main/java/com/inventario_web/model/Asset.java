package com.inventario_web.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // <--- ESTA ES LA CLAVE PRIMARIA REAL

    @Column(name = "asset_tag", unique = true) // El tag es único, pero no es la PK
    private String assetTag;

    @Column(name = "_nombre_usuario_")
    private String nombreUsuario;

    @Column(name = "_snipeit_ram_2")
    private String ram;

    @Column(name = "_snipeit_cpu_3")
    private String cpu;

    @Column(name = "_snipeit_disco_4")
    private String disco;

    @Column(name = "_snipeit_version_so_5")
    private String versionSo;

    @Column(name = "_snipeit_otros_6")
    private String otros;

    @Column(name = "pos_x")
    private Integer posX = 0;

    @Column(name = "pos_y")
    private Integer posY = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planta_id", referencedColumnName = "id")
    @JsonBackReference 
    private Planta planta;
    
    @Column(name = "tipo_equipo") 
    private String tipoEquipo;

    public Asset() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    // ... (Mantén el resto de tus getters y setters exactamente igual) ...
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public String getRam() { return ram; }
    public void setRam(String ram) { this.ram = ram; }
    public String getCpu() { return cpu; }
    public void setCpu(String cpu) { this.cpu = cpu; }
    public String getDisco() { return disco; }
    public void setDisco(String disco) { this.disco = disco; }
    public String getVersionSo() { return versionSo; }
    public void setVersionSo(String versionSo) { this.versionSo = versionSo; }
    public String getOtros() { return otros; }
    public void setOtros(String otros) { this.otros = otros; }
    public Integer getPosX() { return posX; }
    public void setPosX(Integer posX) { this.posX = posX; }
    public Integer getPosY() { return posY; }
    public void setPosY(Integer posY) { this.posY = posY; }
    public Planta getPlanta() { return planta; }
    public void setPlanta(Planta planta) { this.planta = planta; }
    public String getTipoEquipo() { return tipoEquipo; }
    public void setTipoEquipo(String tipoEquipo) { this.tipoEquipo = tipoEquipo; }
}