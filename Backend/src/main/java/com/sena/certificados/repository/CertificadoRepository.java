package com.sena.certificados.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sena.certificados.model.Certificado;

public interface CertificadoRepository extends JpaRepository<Certificado, Integer> {
    // Aquí puedes agregar consultas personalizadas si las necesitas más adelante
}
