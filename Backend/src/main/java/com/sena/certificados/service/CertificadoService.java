package com.sena.certificados.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.sena.certificados.model.Certificado;
import com.sena.certificados.repository.CertificadoRepository;

@Service
public class CertificadoService {

    @Autowired
    private CertificadoRepository certificadoRepository;

    // Obtener todos los certificados
    public List<Certificado> listarCertificados() {
        return certificadoRepository.findAll();
    }

    // Buscar certificado por ID
    public Optional<Certificado> obtenerCertificadoPorId(int id) {
        return certificadoRepository.findById(id);
    }

    // Guardar o actualizar un certificado
    public Certificado guardarCertificado(Certificado certificado) {
        return certificadoRepository.save(certificado);
    }

    // Eliminar un certificado
    public void eliminarCertificado(int id) {
        certificadoRepository.deleteById(id);
    }
}
