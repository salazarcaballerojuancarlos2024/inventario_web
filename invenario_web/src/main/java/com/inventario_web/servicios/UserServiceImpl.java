package com.inventario_web.servicios;

import com.inventario_web.model.User;
import com.inventario_web.repositorio.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean validarUsuario(String nick, String clave) {
        User user = userRepository.findByNick(nick);
        // Comparamos si el usuario existe y si la clave coincide exactamente
        return user != null && user.getClave().equals(clave);
    }
}