import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crea la carpeta de destino si todavía no existe (evita errores al guardar)
function asegurarCarpeta(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // recursive: crea también carpetas padre
}

// Genera la configuración de almacenamiento en disco para una subcarpeta dada.
// Define DÓNDE se guarda y CON QUÉ NOMBRE.
function crearStorage(subcarpeta) {
  return multer.diskStorage({
    // destination: ruta donde se guardará el archivo
    destination: (req, file, cb) => {
      const dir = `uploads/${subcarpeta}`;
      asegurarCarpeta(dir);
      cb(null, dir);
    },
    // filename: nombre final del archivo, único gracias al timestamp
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);              // conserva la extensión original (.pdf, .jpg, etc.)
      const nombre = `${subcarpeta}_${Date.now()}${ext}`;       // ej: certificados_1716742000000.pdf
      cb(null, nombre);
    }
  });
}

// Filtro de validación: solo acepta archivos PDF
const filtroPDF = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);                                       // aceptado
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false); // rechazado
  }
};

// Filtro de validación: solo acepta imágenes (image/png, image/jpeg, etc.)
const filtroImagen = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

// --- Uploaders listos para usar como middleware en las rutas ---

// Subida de certificados: PDF, máximo 10 MB. Campo del formulario: "archivo"
export const subirCertificado = multer({
  storage: crearStorage('certificados'),
  fileFilter: filtroPDF,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
}).single('archivo');

// Subida de nóminas: PDF, máximo 10 MB. Campo del formulario: "archivo"
export const subirNomina = multer({
  storage: crearStorage('nominas'),
  fileFilter: filtroPDF,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('archivo');

// Subida de foto de perfil: imagen, máximo 5 MB. Campo del formulario: "foto"
export const subirFotoPerfil = multer({
  storage: crearStorage('fotos_perfil'),
  fileFilter: filtroImagen,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
}).single('foto');