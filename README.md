# Balance

Balance es una aplicación para registrar y analizar gastos personales. El proyecto está en su primera etapa de implementación.

## Requisitos

- Python 3.10 o posterior
- Node.js 20 o posterior
- npm

## Backend

Crear y activar el entorno virtual:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Instalar dependencias y arrancar FastAPI:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

El backend queda disponible en `http://localhost:8000`.

- Health check: `http://localhost:8000/health`
- Documentación interactiva: `http://localhost:8000/docs`

## Base de datos local

Con Docker instalado, iniciar PostgreSQL desde la raíz del proyecto:

```bash
docker compose up -d
```

El contenedor usa PostgreSQL en `localhost:5432`. El volumen `postgres-data` conserva los datos cuando el contenedor se detiene.

Con el entorno virtual activo, ejecutar la primera migración desde `backend`:

```bash
cd backend
alembic upgrade head
```

La primera migración fue intencionalmente vacía para confirmar la conexión. La migración actual crea las tablas de Balance y carga las categorías predefinidas.

Para revertir la migración:

```bash
alembic downgrade base
```

Para detener PostgreSQL sin eliminar los datos:

```bash
docker compose down
```

## Calidad de código

El backend usa Ruff para revisar y formatear Python:

```bash
cd backend
ruff check .
ruff format --check .
```

Para aplicar correcciones automáticas:

```bash
ruff check . --fix
ruff format .
```

El frontend usa ESLint para revisar JavaScript/React y Prettier para formatear:

```bash
cd frontend
npm run lint
npm run format:check
```

Para aplicar correcciones automáticas:

```bash
npm run lint:fix
npm run format
```

Antes de considerar un cambio listo, también se debe confirmar que el frontend compila:

```bash
npm run build
```

## Registro de usuarios

El backend expone el registro mediante `POST /auth/register`. El cuerpo debe incluir:

```json
{
  "name": "Carlos",
  "email": "carlos@example.com",
  "password": "UnaContrasenaSegura123"
}
```

Las contraseñas se almacenan como hashes Argon2id y nunca se devuelven en la respuesta. El registro normaliza el correo, crea la cuenta activa y responde con `201 Created`.

El login está disponible en `POST /auth/login`:

```json
{
  "email": "carlos@example.com",
  "password": "UnaContrasenaSegura123"
}
```

Devuelve un access token JWT con algoritmo HS256 y expiración configurable mediante `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (30 minutos por defecto). La clave usada para firmar tokens se configura con `JWT_SECRET_KEY` y nunca debe subirse al repositorio.

La ruta protegida `GET /auth/me` requiere enviar el token así:

```http
Authorization: Bearer <access_token>
```

La API valida la firma, expiración, usuario y estado activo antes de devolver sus datos públicos.

Para solicitar la recuperación de contraseña:

```http
POST /auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "carlos@example.com"
}
```

La respuesta es siempre `202 Accepted` con un mensaje genérico, exista o no la cuenta. Si el correo está registrado, se genera un token aleatorio de un solo uso, se guarda únicamente su hash y se envía un enlace mediante Resend. El token expira según `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` (60 minutos por defecto).

Para completar el cambio de contraseña, el frontend enviará el token del enlace junto con la nueva contraseña a `POST /auth/reset-password`. El backend valida que el token coincida, no esté usado ni expirado, actualiza la contraseña con Argon2id y marca los tokens activos del usuario como usados. Los tokens inválidos responden con `400 Bad Request` y las contraseñas que no cumplen las reglas responden con `422 Unprocessable Entity`.

## Frontend

En otra terminal, instalar dependencias y arrancar Vite:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará en la terminal la URL local del frontend.

La pantalla inicial permite iniciar sesión mediante `POST /auth/login` o cambiar al formulario de registro para crear una cuenta mediante `POST /auth/register`. Después de un registro exitoso, el usuario vuelve al login y debe iniciar sesión manualmente. El JWT se mantiene únicamente en memoria del navegador durante esta primera versión, por lo que se pierde al recargar la página. El frontend consulta `GET /auth/me` después del login para mostrar el usuario autenticado.

El enlace `¿La olvidaste?` abre el formulario de recuperación y llama a `POST /auth/forgot-password`. Los enlaces enviados por Resend abren `/reset-password?token=...`, donde la aplicación permite crear una nueva contraseña mediante `POST /auth/reset-password`. El token se mantiene solo en memoria y se elimina de la URL después de un cambio exitoso.

Las categorías se administran mediante rutas protegidas en `/categories`. El listado incluye las categorías predefinidas y las categorías personalizadas del usuario autenticado. Las categorías predefinidas no se pueden editar ni eliminar, y una categoría personalizada con gastos asociados no puede eliminarse.

Después de iniciar sesión, la pantalla principal muestra la gestión de categorías. Desde ahí se pueden crear, editar y eliminar categorías personalizadas; las categorías del sistema se muestran como elementos de solo lectura. El JWT se conserva en memoria mientras la sesión está activa.

La API de gastos está disponible en `/expenses` para crear, listar, consultar, actualizar y eliminar gastos autenticados. Cada gasto pertenece al usuario que lo registra, requiere una categoría disponible para ese usuario y conserva el indicador manual `is_recurring`. Los listados se ordenan por fecha descendente; los filtros y la pantalla de historial se implementarán posteriormente.

La pantalla autenticada también incluye el formulario `Registrar gasto`, con importe en MXN, fecha, categoría, descripción opcional y la opción de marcar el gasto como recurrente.

Debajo del formulario se muestra el historial de gastos con filtros locales por categoría, rango de fechas y recurrencia. El total visible se calcula sobre los resultados filtrados y las acciones de editar/eliminar actualizan la lista sin recargar la página.

Los presupuestos mensuales se configuran mediante `PUT /budgets/{year}/{month}` y se consultan con `GET /budgets/{year}/{month}`. El presupuesto es un valor manual por usuario y período; al repetir el `PUT` se actualiza el importe existente.

## Variables de entorno

Los archivos `.env.example` documentan las variables esperadas. Para desarrollo local, copia el ejemplo correspondiente a `.env` antes de agregar valores específicos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Los archivos `.env` reales están excluidos de Git.
