package com.sena.certificados.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.sena.certificados.model.Certificado;
import com.sena.certificados.service.CertificadoService;

@RestController
@RequestMapping("/api/certificados")
@CrossOrigin(origins = "*") // permite peticiones desde tu HTML (frontend)
public class CertificadoController {

    @Autowired
    private CertificadoService certificadoService;

    // Obtener todos los certificados
    @GetMapping
    public List<Certificado> listarCertificados() {
        return certificadoService.listarCertificados();
    }

    // Obtener certificado por ID
    @GetMapping("/{id}")
    public Optional<Certificado> obtenerPorId(@PathVariable int id) {
        return certificadoService.obtenerCertificadoPorId(id);
    }

    // Crear o actualizar un certificado
    @PostMapping
    public Certificado guardar(@RequestBody Certificado certificado) {
        return certificadoService.guardarCertificado(certificado);
    }

    // Eliminar un certificado
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable int id) {
        certificadoService.eliminarCertificado(id);
    }
}
