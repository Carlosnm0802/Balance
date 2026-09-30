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

La respuesta es siempre `202 Accepted` con un mensaje genérico, exista o no la cuenta. Si el correo está registrado, se genera un token aleatorio de un solo uso, se guarda únicamente su hash y se envía un enlace mediante Resend. El token expira según `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` (60 minutos por defecto). La validación del token y el cambio de contraseña se implementarán en el ticket siguiente.

## Frontend

En otra terminal, instalar dependencias y arrancar Vite:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará en la terminal la URL local del frontend.

## Variables de entorno

Los archivos `.env.example` documentan las variables esperadas. Para desarrollo local, copia el ejemplo correspondiente a `.env` antes de agregar valores específicos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Los archivos `.env` reales están excluidos de Git.
