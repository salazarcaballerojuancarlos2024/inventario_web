package com.inventario_web.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity
@Table(name = "assets", schema = "inventario_db")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_tag")
    private String assetTag;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "apellido")
    private String apellido;

    @Column(name = "_nombre_usuario_")
    private String nombreUsuario;

    @Column(name = "_snipeit_ram_2")
    private String snipeitRam;

    @Column(name = "_snipeit_cpu_3")
    private String snipeitCpu;

    @Column(name = "_snipeit_disco_4")
    private String snipeitDisco;

    @Column(name = "_snipeit_version_so_5")
    private String snipeitVersionSo;

    @Column(name = "_snipeit_otros_6")
    private String snipeitOtros;

    @Column(name = "pos_x")
    private Double posX;

    @Column(name = "pos_y")
    private Double posY;

    @Column(name = "tipo_equipo")
    private String tipoEquipo;

    // Relación orientada a Objetos en JPA con Planta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planta_id")
    @NotFound(action = NotFoundAction.IGNORE) // Si la planta no existe en la BD, establece el campo en null automáticamente
    @JsonBackReference
    private Planta planta;

    public Asset() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getSnipeitRam() { return snipeitRam; }
    public void setSnipeitRam(String snipeitRam) { this.snipeitRam = snipeitRam; }

    public String getSnipeitCpu() { return snipeitCpu; }
    public void setSnipeitCpu(String snipeitCpu) { this.snipeitCpu = snipeitCpu; }

    public String getSnipeitDisco() { return snipeitDisco; }
    public void setSnipeitDisco(String snipeitDisco) { this.snipeitDisco = snipeitDisco; }

    public String getSnipeitVersionSo() { return snipeitVersionSo; }
    public void setSnipeitVersionSo(String snipeitVersionSo) { this.snipeitVersionSo = snipeitVersionSo; }

    public String getSnipeitOtros() { return snipeitOtros; }
    public void setSnipeitOtros(String snipeitOtros) { this.snipeitOtros = snipeitOtros; }

    public Double getPosX() { return posX; }
    public void setPosX(Double posX) { this.posX = posX; }

    public Double getPosY() { return posY; }
    public void setPosY(Double posY) { this.posY = posY; }

    public String getTipoEquipo() { return tipoEquipo; }
    public void setTipoEquipo(String tipoEquipo) { this.tipoEquipo = tipoEquipo; }

    // Métodos para la relación con Planta
    public Planta getPlanta() { return planta; }
    public void setPlanta(Planta planta) { this.planta = planta; }
}