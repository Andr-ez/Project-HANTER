import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import usuariosRouter      from './routes/usuarios.js';
import empleadosRouter     from './routes/empleados.js';
import rolesRouter         from './routes/roles.js';
import authRouter          from './routes/auth.js';
import certificadosRouter  from './routes/certificados.js';
import notificacionesRouter from './routes/notificaciones.js';
import nominaRouter        from './routes/nomina.js';
import { verificarToken, verificarRol } from './middlewares/auth.js';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config({ path: '../.env' });

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/auth',            authRouter);
app.use('/usuarios',        usuariosRouter);
app.use('/certificados',    verificarToken, certificadosRouter);
app.use('/notificaciones',  notificacionesRouter);
app.use('/empleados',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']), empleadosRouter);
app.use('/roles',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']), rolesRouter);
app.use('/nomina', nominaRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});