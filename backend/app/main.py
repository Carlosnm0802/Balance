from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.budgets.router import router as budgets_router
from app.categories.router import router as categories_router
from app.db.config import settings
from app.expenses.router import router as expenses_router

app = FastAPI(title="Balance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(auth_router)
app.include_router(budgets_router)
app.include_router(categories_router)
app.include_router(expenses_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
