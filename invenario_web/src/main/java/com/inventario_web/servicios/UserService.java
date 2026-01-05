package com.inventario_web.servicios;
import com.inventario_web.model.User;

public interface UserService {
    boolean validarUsuario(String nick, String clave);
}