# 🖥️ Frontend — Project HANTER

Documentación completa del frontend del sistema HANTER. Construido con **React 19 + Vite + React Router DOM v7**.

---

## 📁 Estructura de Carpetas

```
Frontend/
├── index.html                      # HTML raíz de la SPA
├── vite.config.js                  # Configuración de Vite
├── eslint.config.js                # Reglas de linting
├── package.json                    # Dependencias del frontend
├── public/
│   └── fotos/
│       └── LOGO MEL.png            # Logo público accesible por URL
├── fotos/                          # Assets estáticos importados desde JSX
│   ├── LOGO MEL.png
│   ├── icon/                       # Íconos PNG usados en toda la app
│   │   ├── campana.png
│   │   ├── dni-icon.png
│   │   ├── email-icon.png
│   │   ├── gancho-icon.png
│   │   ├── key-icon.png
│   │   ├── luna-icon.png
│   │   ├── menu-hamburguesa.png
│   │   ├── ojo abierto.png
│   │   ├── ojo cerrado.png
│   │   ├── phone-icon.png
│   │   ├── sol-icon.png
│   │   ├── user-icon.png
│   │   └── week-icon.png
│   └── pdf/
│       ├── certificados/           # PDFs de certificados de ejemplo
│       └── nomina/                 # PDFs de nóminas de ejemplo
└── src/
    ├── main.jsx                    # Punto de entrada: Router + definición de rutas
    ├── styles.css                  # Estilos globales + variables CSS + modo oscuro
    ├── components/
    │   ├── PrivateRoute.jsx        # Guard de autenticación JWT
    │   └── ToggleDarkMode.jsx      # Botón de alternancia de tema claro/oscuro
    ├── pagina-proceso/
    │   ├── proceso-page.jsx        # Página de "en construcción"
    │   └── proceso-page.css
    ├── perfil/
    │   ├── perfil.jsx              # Perfil del usuario
    │   └── perfil.css
    ├── 000/  → Bienvenida
    ├── 001/  → Login
    ├── 002/  → Recuperar contraseña
    ├── 004/  → Registro
    ├── 005/  → (vacío / reservado)
    ├── 006/  → (vacío / reservado)
    ├── 007/  → Soporte técnico
    ├── 008/  → Calificar sistema
    ├── 008-z/→ Confirmación de calificación
    ├── 009/  → Contacto WhatsApp
    ├── 010/  → Dudas e inquietudes
    ├── 011/  → Video de ayuda
    ├── 100/  → Inicio (dashboard)
    ├── 101/  → Mis certificados
    ├── 102/  → Añadir certificado
    ├── 103/  → Buscar certificado (empleado)
    ├── 103/103-A → Solicitudes de certificados (Admin)
    ├── 104/  → Nómina (empleado)
    ├── 118-A/→ Enviar nómina (Admin)
    ├── 125/  → Capacitaciones (vista info)
    ├── 125-A/→ Crear curso (Admin)
    ├── 126/  → Cursos disponibles (empleado)
    ├── 126-A/→ Gestión de inscripciones (Admin)
    ├── 133/  → Historial de cursos (empleado)
    ├── 150-A/→ Gestión de usuarios (Admin)
    ├── 151-A/→ Cursos de usuarios (Admin)
    └── 500/  → Notificaciones
```

---

## 🗺️ Sistema de Rutas (`main.jsx`)

El archivo `main.jsx` es el **punto de entrada** de la aplicación. Envuelve toda la app en `<BrowserRouter>` y define cada ruta con `<Route>`.

Las rutas que requieren sesión iniciada están envueltas en `<PrivateRoute>`, que redirige a `/001` (Login) si no hay token en `localStorage`.

### Tabla de rutas

| Ruta | Componente | Carpeta | Auth |
|---|---|---|---|
| `/` | `Bienvenido` | `000/` | No |
| `/001` | `Login` | `001/` | No |
| `/002` | `RecuperarContrasena` | `002/` | No |
| `/004` | `Registro` | `004/` | No |
| `/007` | `SoporteTecnico` | `007/` | No |
| `/008` | `CalificarSistema` | `008/` | No |
| `/008-z` | `CalificarGuardada` | `008-z/` | No |
| `/009` | `ContactoWhatsApp` | `009/` | No |
| `/010` | `DudasInquietudes` | `010/` | No |
| `/011` | `VideoSolucion` | `011/` | No |
| `/proceso` | `ProcesoPage` | `pagina-proceso/` | No |
| `/100` | `Inicio` | `100/` | ✅ Sí |
| `/101` | `Certificados` | `101/` | ✅ Sí |
| `/102` | `AnadirCertificado` | `102/` | ✅ Sí |
| `/103` | `BuscarCertificado` | `103/` | ✅ Sí |
| `/103-A` | `SolicitudCertificadosAdmin` | `103/` | ✅ Sí |
| `/104` | `Nomina` | `104/` | ✅ Sí |
| `/118-A` | `EnviarNominaAdmin` | `118-A/` | ✅ Sí |
| `/125` | `Capacitaciones` | `125/` | ✅ Sí |
| `/125-A` | `AdminCrearCurso` | `125-A/` | ✅ Sí |
| `/126` | `CursosDisponibles` | `126/` | ✅ Sí |
| `/126-A` | `AdminInscripciones` | `126-A/` | ✅ Sí |
| `/133` | `HistorialCursos` | `133/` | ✅ Sí |
| `/150-A` | `AdminGestionUsuarios` | `150-A/` | ✅ Sí |
| `/151-A` | `AdminCursosUsuarios` | `151-A/` | ✅ Sí |
| `/500` | `Notificaciones` | `500/` | ✅ Sí |
| `/perfil` | `Perfil` | `perfil/` | ✅ Sí |

---

## 📄 Páginas Públicas (sin autenticación)

### `/` — Bienvenida (`000/000.jsx`)

Página de entrada de la aplicación. Muestra el logo, un mensaje de bienvenida y botones para acceder al login o explorar las opciones de soporte. Incluye el botón de modo oscuro/claro.

**Conexiones:** Navega a `/001` (Login), `/007` (Soporte), `/004` (Registro).

---

### `/001` — Login (`001/001.jsx`)

Formulario de inicio de sesión con campos de nombre de usuario y contraseña. Incluye:
- Mostrar/ocultar contraseña con íconos de ojo.
- Validación de campos.
- Llamada `POST` al backend para autenticar y guardar el token JWT en `localStorage`.
- Redirección a `/100` (Inicio) al autenticarse correctamente.

**API:** `POST http://localhost:3000/auth/login`  
**Conexiones:** Navega a `/002` (Recuperar contraseña).

---

### `/002` — Recuperar Contraseña (`002/002.jsx`)

Formulario de recuperación de contraseña por correo electrónico. El usuario introduce su correo y un código de verificación.

> ⚠️ Esta funcionalidad aún no tiene conexión a un endpoint real del backend.

**Conexiones:** Regresa a `/001`.

---

### `/004` — Registro (`004/004.jsx`)

Formulario de registro de nuevo usuario con campos: nombre, correo, contraseña (con toggle de visibilidad). Muestra confirmación al completar el registro.

**Conexiones:** Navega a `/001` tras registrarse.

---

### `/007` — Soporte Técnico (`007/007.jsx`)

Página informativa con opciones de soporte disponibles: WhatsApp, dudas frecuentes y video de ayuda.

**Conexiones:** Navega a `/009`, `/010`, `/011`.

---

### `/008` — Calificar Sistema (`008/008.jsx`)

Formulario que permite al usuario calificar la experiencia con la plataforma. Opciones: `SUPERIOR`, `ALTO`, `MEDIO`, `BAJO`. Puede añadir un comentario libre. Al guardar, redirige a `/008-z`.

**Conexiones:** Navega a `/008-z`.

---

### `/008-z` — Confirmación de Calificación (`008-z/008-z.jsx`)

Pantalla de confirmación que se muestra después de guardar una calificación en `/008`.

**Conexiones:** Regresa a `/008`.

---

### `/009` — Contacto WhatsApp (`009/009.jsx`)

Muestra el número de WhatsApp de soporte (`57 1234567890`) y un botón para abrirlo directamente. El número se define como constante al inicio del archivo para fácil actualización.

**Conexiones:** Regresa a `/007`.

---

### `/010` — Dudas e Inquietudes (`010/010.jsx`)

Página informativa con preguntas frecuentes o instrucciones de uso. Incluye enlace al video de ayuda.

**Conexiones:** Navega a `/011`.

---

### `/011` — Video de Ayuda (`011/011.jsx`)

Muestra un video de YouTube embebido (ID definido en la constante `YOUTUBE_VIDEO_ID`) como guía visual de uso del sistema.

**Conexiones:** Regresa a `/010`.

---

### `/proceso` — Página en Proceso (`pagina-proceso/proceso-page.jsx`)

Página genérica de "en construcción" que se muestra cuando una funcionalidad aún no está disponible. Tiene un botón **Volver** que usa `navigate(-1)` para regresar a la pantalla anterior.

**Conexiones:** Volver con `navigate(-1)`.

---

## 🔒 Páginas Privadas (requieren token JWT)

Todas las páginas privadas siguen el mismo **patrón de carga inicial**:

1. Al montar el componente, hacen un `fetch` a `GET /auth/sesion` con el token.
2. Reciben `{ usuario: { nombre, foto, rol }, botones: [...] }`.
3. Almacenan esos datos para mostrar el nombre/foto en el header y los botones en el sidebar.
4. Si la sesión falla (token inválido o expirado), redirigen a `/001`.

---

### `/100` — Inicio (`100/100.jsx`)

Dashboard principal. Muestra el saludo al usuario con su nombre, foto de perfil y rol. Contiene el **header** con campana de notificaciones y **sidebar** de navegación dinámico basado en el rol.

**API:** `GET /auth/sesion`

---

### `/101` — Mis Certificados (`101/101.jsx`)

Lista los certificados del empleado autenticado. Muestra título, institución, fecha, estado (`PENDIENTE`, `APROBADO`, `RECHAZADO`) y permite descargar el PDF de cada certificado.

**API:** `GET /auth/sesion`  
*(Nota: la carga de certificados se hace desde `/103`)*

**Conexiones:** Navega a `/102` (añadir), `/103` (buscar).

---

### `/102` — Añadir Certificado (`102/102.jsx`)

Formulario para que el empleado suba un nuevo certificado. Campos: título, institución, fecha (DD/MM/AA), y archivo PDF. Usa `FormData` para el envío multipart.

**API:**
- `GET /auth/sesion`
- `POST /certificados/anadir` (multipart: PDF + campos JSON)

**Conexiones:** Regresa a `/101`.

---

### `/103` — Buscar Certificado — Vista Empleado (`103/103.jsx`)

Lista todos los certificados del empleado con opciones de filtrado por estado. Permite seleccionar certificados y descargar los PDFs.

**API:**
- `GET /auth/sesion`
- `GET /certificados`

---

### `/103-A` — Solicitudes de Certificados — Vista Admin (`103/103-A.jsx`)

Vista exclusiva para **Administrador/Supervisor**. Muestra todos los certificados en estado `PENDIENTE` de todos los empleados. Permite expandir cada solicitud para ver los detalles y tomar la acción de **Aprobar** o **Rechazar**.

**API:**
- `GET /auth/sesion`
- `GET /certificados/pendientes`
- `PATCH /certificados/:id/aprobar`
- `PATCH /certificados/:id/rechazar`

---

### `/104` — Nómina — Vista Empleado (`104/104.jsx`)

Muestra las nóminas disponibles para el empleado autenticado. Lista organizada por mes/año con detalles de salario base, deducciones, bonos y total. Permite filtrar y descargar los PDFs.

**API:**
- `GET /auth/sesion`
- `GET /nomina`

---

### `/118-A` — Enviar Nómina — Vista Admin (`118-A/118-A.jsx`)

Formulario para que el **Administrador** suba una nómina (PDF) asignada a un empleado específico. Incluye un selector de empleados cargado desde el backend y campos para mes, año y desglose salarial.

**API:**
- `GET /auth/sesion`
- `GET /empleados` (para poblar el selector)
- `POST /nomina/enviar` (multipart: PDF + campos)

---

### `/125` — Capacitaciones — Vista Empleado (`125/125.jsx`)

Página informativa que presenta las opciones del módulo de capacitaciones: ver cursos disponibles e historial. Sirve como hub de navegación.

**API:** `GET /auth/sesion`  
**Conexiones:** Navega a `/126` (cursos disponibles), `/133` (historial).

---

### `/125-A` — Crear Curso — Vista Admin (`125-A/125-A.jsx`)

Formulario para que el **Administrador** cree un nuevo curso. Campos: nombre, tipo/categoría, fecha de inicio y descripción.

**API:**
- `GET /auth/sesion`
- `POST /cursos`

---

### `/126` — Cursos Disponibles — Vista Empleado (`126/126.jsx`)

Lista los cursos activos a los que el empleado puede inscribirse. Permite filtrar por categoría y enviar solicitud de inscripción. Muestra el estado de cada inscripción si ya existe.

**API:**
- `GET /auth/sesion`
- `GET /cursos/disponibles`
- `POST /cursos/inscripcion`

---

### `/126-A` — Gestión de Inscripciones — Vista Admin (`126-A/126-A.jsx`)

Vista para el **Administrador** de todas las solicitudes de inscripción a cursos. Permite expandir cada solicitud y tomar la decisión de **Matricular** o **Declinar**.

**API:**
- `GET /auth/sesion`
- `GET /cursos/inscripciones/activas` *(o similar)*
- `PATCH /cursos/:id/matricular`
- `PATCH /cursos/:id/declinar`

---

### `/133` — Historial de Cursos (`133/133.jsx`)

Muestra el historial completo de cursos en los que el empleado ha participado, con su estado (`MATRICULADO`, `EN_PROGRESO`, `COMPLETADO`, `DECLINADO`). Incluye un componente `EstadoBadge` para la visualización del estado con colores diferenciados.

**API:**
- `GET /auth/sesion`
- `GET /cursos/historial`

---

### `/150-A` — Gestión de Usuarios — Vista Admin (`150-A/150-A.jsx`)

Panel completo de administración de empleados/usuarios. Muestra la lista de todos los usuarios del sistema. Permite expandir cada tarjeta para:
- **Editar** datos del empleado (nombre, apellido, correo, etc.)
- **Cambiar la foto** de perfil
- **Eliminar** el usuario

**API:**
- `GET /auth/sesion`
- `GET /admin/usuarios`
- `PUT /admin/usuarios/:id`
- `PUT /admin/usuarios/:id/foto`
- `DELETE /admin/usuarios/:id`
- `POST /admin/usuarios` (crear nuevo)

---

### `/151-A` — Cursos de Usuarios — Vista Admin (`151-A/151-A.jsx`)

Vista administrativa que muestra las inscripciones activas de todos los empleados. Permite ver qué curso tiene cada persona y gestionar el estado de la inscripción.

**API:**
- `GET /auth/sesion`
- `GET /cursos/inscripciones/activas`
- `PATCH /cursos/:id/...`

---

### `/500` — Notificaciones (`500/500.jsx`)

Centro de notificaciones del usuario. Muestra notificaciones del sistema (aprobación/rechazo de certificados, mensajes generales) con iconos y colores por tipo. Permite marcar como leídas individualmente y navegar a la ruta destino de cada notificación.

**Tipos de notificación:** `certificado_pendiente`, `certificado_aprobado`, `certificado_rechazado`, `general`

**API:**
- `GET /auth/sesion`
- `GET /notificaciones`
- `PATCH /notificaciones/:id/leer`

---

### `/perfil` — Perfil de Usuario (`perfil/perfil.jsx`)

Página de perfil personal del empleado autenticado. Muestra:
- Foto de perfil (con opción de cambiarla subiendo una nueva imagen)
- Nombre, apellido, correo, documento, teléfono, rol
- Fecha de último login (formateada)
- Opción para editar el nombre de usuario

**API:**
- `GET /auth/sesion`
- `GET /usuarios/perfil`
- `POST /usuarios/perfil/foto` (subida de imagen)
- `PATCH /usuarios/perfil/nombre`

---

## 🧩 Componentes Reutilizables

### `PrivateRoute` (`components/PrivateRoute.jsx`)

Guard de autenticación. Verifica la existencia de un token en `localStorage`. Si no hay token, redirige automáticamente a `/001`. Se usa envolviendo cada ruta protegida en `main.jsx`.

```jsx
<Route path="/100" element={<PrivateRoute><Inicio /></PrivateRoute>} />
```

### `ToggleDarkMode` (`components/ToggleDarkMode.jsx`)

Botón de alternancia entre tema claro y oscuro. Persiste la preferencia en `localStorage` bajo la clave `"tema"`. Cambia el atributo `data-theme` en el elemento `<html>`. Muestra íconos de sol/luna según el tema activo.

### `SidebarBtn` (patrón repetido en cada página)

Componente de botón de navegación del sidebar. Soporta botones con hijos (submenú colapsable) e indica visualmente si está abierto con una flecha rotada. Se define localmente en cada página por convención del proyecto.

---

## 🎨 Estilos Globales (`styles.css`)

Define las **variables CSS** que unifican la paleta de colores de toda la aplicación:

### Variables de color

| Variable | Valor claro | Valor oscuro |
|---|---|---|
| `--color-fondo` | `#3F88C5` | `#1E293B` |
| `--color-titulos` | `#2F2E41` | `#E2E8F0` |
| `--color-texto` | `#6E6B7B` | `#CBD5E1` |
| `--color-contenedores` | `#C8C6C6` | `#334155` |
| `--color-blanco` | `#ffffff` | `#F8FAFC` |

### Modo oscuro

Se activa añadiendo `data-theme="dark"` al elemento `<html>`. Las variables se redefinen automáticamente en el bloque `[data-theme="dark"]`.

### Tipografía

La fuente principal es `'Darumadrop One'` (importada de Google Fonts).

### Sombras

| Variable | Valor |
|---|---|
| `--sombra-card` | `0 10px 40px rgba(0,0,0,0.18)` |
| `--sombra-suave` | `0 4px 14px rgba(0,0,0,0.12)` |

---

## 🔗 Conexiones con el Backend

Todas las llamadas al backend usan la URL base `http://localhost:3000`. El token JWT se incluye en el header `Authorization`:

```js
fetch("http://localhost:3000/ruta", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
})
```

### Mapa de conexiones por módulo

| Módulo frontend | Rutas de backend consumidas |
|---|---|
| Login (`/001`) | `POST /auth/login` |
| Todas las páginas privadas | `GET /auth/sesion` |
| Certificados empleado (`/103`) | `GET /certificados` |
| Añadir certificado (`/102`) | `POST /certificados/anadir` |
| Certificados admin (`/103-A`) | `GET /certificados/pendientes`, `PATCH /certificados/:id/aprobar`, `PATCH /certificados/:id/rechazar` |
| Nómina empleado (`/104`) | `GET /nomina` |
| Enviar nómina admin (`/118-A`) | `GET /empleados`, `POST /nomina/enviar` |
| Cursos disponibles (`/126`) | `GET /cursos/disponibles`, `POST /cursos/inscripcion` |
| Crear curso admin (`/125-A`) | `POST /cursos` |
| Inscripciones admin (`/126-A`) | `GET /cursos/inscripciones/activas`, `PATCH /cursos/:id/...` |
| Historial cursos (`/133`) | `GET /cursos/historial` |
| Gestión usuarios admin (`/150-A`) | `GET /admin/usuarios`, `PUT`, `DELETE` |
| Cursos usuarios admin (`/151-A`) | `GET /cursos/inscripciones/activas` |
| Notificaciones (`/500`) | `GET /notificaciones`, `PATCH /notificaciones/:id/leer` |
| Perfil (`/perfil`) | `GET /usuarios/perfil`, `POST /usuarios/perfil/foto`, `PATCH /usuarios/perfil/nombre` |

---

## ⚙️ Configuración de Vite (`vite.config.js`)

```js
{
  plugins: [react()],          // React con compilador SWC (rápido)
  server: {
    port: 5173,
    open: true,                // Abre el navegador automáticamente
    historyApiFallback: true   // Necesario para React Router en SPA
  },
  build: { outDir: 'dist' },
  resolve: { alias: { '@': './src' } }
}
```

El alias `@` apunta a `src/`, permitiendo imports como `import X from '@/components/X'`.

---

## 🛠️ Scripts disponibles

```bash
npm run dev       # Inicia servidor de desarrollo en :5173
npm run build     # Compila para producción en /dist
npm run preview   # Previsualiza el build de producción
npm run lint      # Ejecuta ESLint
```

---

## 📝 Convención de nombres

El proyecto usa una numeración como nombre de carpeta y archivo para las páginas:

- **000–011:** Páginas públicas (acceso sin login)
- **100–133:** Páginas privadas de empleados
- **118-A, 125-A, 126-A, 103-A, 150-A, 151-A:** Variantes administrativas (solo Admin/Supervisor)
- **500:** Notificaciones
- **perfil / pagina-proceso:** Carpetas con nombre descriptivo (excepciones a la numeración)
- **005, 006:** Carpetas reservadas actualmente vacías