# 🏢 Project HANTER

Sistema de gestión de recursos humanos para empresas. Permite administrar empleados, certificados, nóminas y capacitaciones desde una interfaz web con roles diferenciados.

---

## 📁 Estructura del Repositorio

```
Project-HANTER/
├── .env                        # Variables de entorno globales (JWT_SECRET, etc.)
├── package.json                # package.json raíz (Prisma + dependencias compartidas)
├── prisma/
│   └── schema.prisma           # Esquema de base de datos (SQLite via Prisma ORM)
├── Backend/                    # Servidor Node.js / Express
└── Frontend/                   # App React / Vite
```

---

## 🗃️ Base de Datos — Prisma + SQLite

El ORM **Prisma** gestiona una base de datos **SQLite** (`prisma/dev.db`). El cliente generado se instala directamente en `Backend/node_modules/.prisma/client`.

### Modelos

| Modelo | Descripción |
|---|---|
| `Rol` | Roles del sistema: `Administrador`, `Supervisor`, `Empleado` |
| `Empleado` | Datos personales del colaborador (nombre, correo, documento, foto, etc.) |
| `Usuario` | Credenciales de acceso (nombre de usuario, hash de contraseña, último login) |
| `Certificado` | Certificados subidos por empleados, con flujo de aprobación |
| `Nomina` | Archivos de nómina por empleado y mes, con desglose salarial |
| `Curso` | Cursos creados por el administrador |
| `Inscripcion` | Solicitudes de empleados para unirse a cursos |
| `Notificacion` | Notificaciones internas del sistema para cada empleado |
| `EmpleadoCapacitacion` | Registro de capacitaciones históricas del empleado |

### Relaciones clave

- Un `Empleado` tiene un `Rol`, un `Usuario`, muchos `Certificado`, muchas `Nomina`, muchas `Notificacion` y muchas `Inscripcion`.
- Un `Usuario` es la cuenta de acceso 1-a-1 con un `Empleado`.
- Un `Certificado` puede tener un emisor (`Usuario` administrador que lo aprueba).
- Una `Inscripcion` conecta un `Empleado` con un `Curso`.

### Comandos Prisma

```bash
# Desde la raíz del repositorio
npx prisma migrate dev --name <nombre>   # Crear y aplicar una migración
npx prisma studio                        # Interfaz visual de la BD
npx prisma generate                      # Regenerar el cliente
```

---

## ⚙️ Backend — Node.js + Express

### Tecnologías

| Paquete | Uso |
|---|---|
| `express` | Servidor HTTP y enrutamiento |
| `@prisma/client` | Acceso a la base de datos |
| `jsonwebtoken` | Autenticación con tokens JWT |
| `bcrypt` | Hash seguro de contraseñas |
| `multer` | Subida de archivos (PDFs, imágenes) |
| `dotenv` | Variables de entorno |
| `cors` | Permitir peticiones desde el frontend (`localhost:5173`) |

### Estructura

```
Backend/
├── index.js                    # Punto de entrada: configura Express, CORS y monta routers
├── middlewares/
│   ├── auth.js                 # verificarToken() y verificarRol() con JWT
│   └── upload.js               # Configuración de Multer para subida de archivos
└── routes/
    ├── auth.js                 # GET /auth/sesion — datos del usuario + menú dinámico
    ├── usuarios.js             # Perfil, foto, nombre de usuario
    ├── admin-usuarios.js       # CRUD completo de empleados (solo Admin/Supervisor)
    ├── empleados.js            # Lista de empleados para formularios internos
    ├── roles.js                # Consulta de roles disponibles
    ├── certificados.js         # Subir, listar, aprobar/rechazar certificados
    ├── nomina.js               # Subir y consultar nóminas
    ├── cursos.js               # CRUD cursos, inscripciones, historial
    └── notificaciones.js       # Leer y marcar notificaciones
```

### Endpoints principales

| Método | Ruta | Descripción | Auth requerida |
|---|---|---|---|
| `GET` | `/auth/sesion` | Datos del usuario + botones de navegación | Token |
| `POST` | `/certificados/anadir` | Subir certificado (PDF + datos) | Token |
| `GET` | `/certificados` | Listar certificados del empleado autenticado | Token |
| `GET` | `/certificados/pendientes` | Ver solicitudes pendientes (Admin) | Token |
| `PATCH` | `/certificados/:id/aprobar` | Aprobar un certificado | Token |
| `PATCH` | `/certificados/:id/rechazar` | Rechazar un certificado | Token |
| `GET` | `/nomina` | Ver nóminas del empleado autenticado | Token |
| `POST` | `/nomina/enviar` | Subir nómina a un empleado (Admin) | Token |
| `GET` | `/cursos/disponibles` | Cursos activos para inscripción | Token |
| `POST` | `/cursos/inscripcion` | Solicitar inscripción a un curso | Token |
| `GET` | `/cursos/historial` | Historial de cursos del empleado | Token |
| `GET` | `/cursos/inscripciones/activas` | Ver solicitudes activas (Admin) | Token |
| `PATCH` | `/cursos/:id/matricular` | Matricular empleado en curso | Token |
| `PATCH` | `/cursos/:id/declinar` | Declinar solicitud de inscripción | Token |
| `GET` | `/admin/usuarios` | Listar todos los empleados | — |
| `POST` | `/admin/usuarios` | Crear empleado | — |
| `PUT` | `/admin/usuarios/:id` | Editar empleado | — |
| `PUT` | `/admin/usuarios/:id/foto` | Cambiar foto de perfil | — |
| `DELETE` | `/admin/usuarios/:id` | Eliminar empleado | — |
| `GET` | `/notificaciones` | Listar notificaciones del empleado | Token |
| `PATCH` | `/notificaciones/:id/leer` | Marcar notificación como leída | Token |
| `GET` | `/usuarios/perfil` | Ver perfil completo | Token |
| `POST` | `/usuarios/perfil/foto` | Subir nueva foto de perfil | Token |
| `PATCH` | `/usuarios/perfil/nombre` | Cambiar nombre de usuario | Token |

### Archivos estáticos

La carpeta `Backend/uploads/` sirve archivos estáticos en la ruta `/uploads`:

```
Backend/uploads/
├── fotos_perfil/       # Fotos de perfil de empleados
├── certificados/       # PDFs de certificados subidos
└── nominas/            # PDFs de nóminas
```

### Arrancar el servidor

```bash
cd Backend
npm install
node index.js         # Corre en http://localhost:3000
```

---

## 🖥️ Frontend — React + Vite

### Tecnologías

| Paquete | Uso |
|---|---|
| `react` v19 | Librería de UI |
| `react-dom` | Renderizado en el DOM |
| `react-router-dom` v7 | Navegación SPA con rutas declarativas |
| `vite` + `@vitejs/plugin-react-swc` | Bundler y servidor de desarrollo |

### Arrancar el frontend

```bash
cd Frontend
npm install
npm run dev           # Corre en http://localhost:5173
```

---

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)**:

1. El usuario ingresa sus credenciales en `/001` (Login).
2. El backend valida y devuelve un `token` JWT.
3. El frontend guarda el token en `localStorage`.
4. Cada petición protegida incluye el header `Authorization: Bearer <token>`.
5. El componente `PrivateRoute` redirige a `/001` si no hay token en `localStorage`.
6. El endpoint `GET /auth/sesion` devuelve el nombre, foto, rol y botones de menú del usuario activo.

---

## 🌗 Modo Oscuro

El tema se guarda en `localStorage` bajo la clave `"tema"` (`"dark"` / `"light"`). Al cargar la app, `main.jsx` aplica el atributo `data-theme="dark"` al `<html>` si corresponde. Los colores se definen con variables CSS en `styles.css`.

---

## 🚀 Flujo de Inicio Rápido

```bash
# 1. Instalar dependencias
npm install              # raíz (Prisma)
cd Backend && npm install
cd ../Frontend && npm install

# 2. Configurar entorno
cp .env.example .env     # Completar JWT_SECRET

# 3. Inicializar base de datos
cd ..
npx prisma migrate dev --name init
npx prisma db seed       # Si hay seed configurado

# 4. Iniciar servicios (dos terminales)
cd Backend && node index.js        # :3000
cd Frontend && npm run dev         # :5173
```

---

## 📎 Notas

- El archivo `.env` en la raíz es compartido entre Prisma y el Backend (`dotenv.config({ path: '../.env' })`).
- La carpeta `Backend/src/` contiene una estructura Java/Spring (vestigio de un backend alternativo) que **no está activa** en el flujo Node.js.
- Los archivos PDF de ejemplo en `Frontend/fotos/pdf/` son datos de prueba para desarrollo.