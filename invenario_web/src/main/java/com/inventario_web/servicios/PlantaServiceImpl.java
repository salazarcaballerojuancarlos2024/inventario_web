package com.inventario_web.servicios;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.PlantaRepository;

@Service
public class PlantaServiceImpl implements PlantaService {

    @Autowired
    private PlantaRepository plantaRepository;

    @Override
    public List<Planta> listarTodas() {
        return plantaRepository.findAll();
    }

    @Override
    public Planta buscarPorId(Long id) {
        return plantaRepository.findById(id).orElse(null);
    }
}