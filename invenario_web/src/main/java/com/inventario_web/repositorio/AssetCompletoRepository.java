package com.inventario_web.repositorio;

import com.inventario_web.model.AssetCompleto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetCompletoRepository extends JpaRepository<AssetCompleto, Long> {
    // Ya incluye findAll(), findById(), etc.
}