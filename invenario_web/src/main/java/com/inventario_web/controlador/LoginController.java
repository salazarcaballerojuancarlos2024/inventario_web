package com.inventario_web.controlador;

import com.inventario_web.servicios.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    @Autowired
    private UserService userService;

    @GetMapping("/login")
    public String mostrarLogin() {
        return "login"; // Nombre del HTML
    }

    @PostMapping("/login")
    public String procesarLogin(@RequestParam String usuario, 
                               @RequestParam String password, 
                               Model model) {
        if (userService.validarUsuario(usuario, password)) {
            return "redirect:/"; // Si es correcto, va al panel (index)
        } else {
            model.addAttribute("error", "Usuario o clave incorrectos");
            return "login"; // Si falla, vuelve al login con error
        }
    }
}
