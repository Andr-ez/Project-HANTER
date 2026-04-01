import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import usuariosRouter from './routes/usuarios.js';
import empleadosRouter from './routes/empleados.js';
import rolesRouter from './routes/roles.js';
import { verificarToken, verificarRol } from './middlewares/auth.js';

dotenv.config({ path: '../.env' });

console.log('JWT_SECRET:', process.env.JWT_SECRET);


const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use('/usuarios', usuariosRouter);
app.use('/empleados',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']), empleadosRouter);
app.use('/roles',
  verificarToken,
  verificarRol(['Administrador', 'Supervisor']), rolesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
