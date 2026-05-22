import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crea la carpeta si no existe
function asegurarCarpeta(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Configura dónde y con qué nombre se guarda cada tipo de archivo
function crearStorage(subcarpeta) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `uploads/${subcarpeta}`;
      asegurarCarpeta(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const nombre = `${subcarpeta}_${Date.now()}${ext}`;
      cb(null, nombre);
    }
  });
}

// Filtro: solo PDFs
const filtroPDF = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Filtro: solo imágenes
const filtroImagen = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

// Los tres uploaders listos para usar en las rutas
export const subirCertificado = multer({
  storage: crearStorage('certificados'),
  fileFilter: filtroPDF,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
}).single('archivo');

export const subirNomina = multer({
  storage: crearStorage('nominas'),
  fileFilter: filtroPDF,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('archivo');

export const subirFotoPerfil = multer({
  storage: crearStorage('fotos_perfil'),
  fileFilter: filtroImagen,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
}).single('foto');