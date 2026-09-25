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
