package com.sena.certificados.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "certificado")
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_certificado;

    private LocalDate fecha_emision;
    private String tipo_certificado;
    private String observaciones;
    private int id_empleado;
    private int id_usuario;

    // Getters y Setters
    public int getId_certificado() {
        return id_certificado;
    }

    public void setId_certificado(int id_certificado) {
        this.id_certificado = id_certificado;
    }

    public LocalDate getFecha_emision() {
        return fecha_emision;
    }

    public void setFecha_emision(LocalDate fecha_emision) {
        this.fecha_emision = fecha_emision;
    }

    public String getTipo_certificado() {
        return tipo_certificado;
    }

    public void setTipo_certificado(String tipo_certificado) {
        this.tipo_certificado = tipo_certificado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public int getId_empleado() {
        return id_empleado;
    }

    public void setId_empleado(int id_empleado) {
        this.id_empleado = id_empleado;
    }

    public int getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(int id_usuario) {
        this.id_usuario = id_usuario;
    }
}
