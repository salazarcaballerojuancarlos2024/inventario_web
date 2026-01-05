package com.inventario_web.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users") // Nombre de la tabla que creamos en MySQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nick;
    private String clave;

    public User() {
    }

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNick() { return nick; }
    public void setNick(String nick) { this.nick = nick; }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
}