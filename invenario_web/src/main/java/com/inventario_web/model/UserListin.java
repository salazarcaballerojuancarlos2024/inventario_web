package com.inventario_web.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users", schema = "listin")
public class UserListin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipo")
    private String equipo;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellidos")
    private String apellidos;

    @Column(name = "correo_electronico")
    private String correoElectronico;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "departamento")
    private String departamento;

    @Column(name = "cargo")
    private String cargo;

    @Column(name = "oficina")
    private String oficina;

    @Column(name = "planta")
    private String planta;

    // Constructor por defecto requerido por JPA
    public UserListin() {
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEquipo() {
        return equipo;
    }

    public void setEquipo(String equipo) {
        this.equipo = equipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getOficina() {
        return oficina;
    }

    public void setOficina(String oficina) {
        this.oficina = oficina;
    }

    public String getPlanta() {
        return planta;
    }

    public void setPlanta(String planta) {
        this.planta = planta;
    }
}