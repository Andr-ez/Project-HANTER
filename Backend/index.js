import express from 'express';
import dotenv from 'dotenv';
import usuariosRouter from './routes/usuarios.js';
import empleadosRouter from './routes/empleados.js';
import rolesRouter from './routes/roles.js';

dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);


const app = express();
app.use(express.json());

// Montar las rutas
app.use('/usuarios', usuariosRouter);
app.use('/empleados', empleadosRouter);
app.use('/roles', rolesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
