import os
import sys
from pathlib import Path
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://balance:balance@localhost:5432/balance"
)
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("RESEND_API_KEY", "re_test_key")
os.environ.setdefault("RESEND_FROM_EMAIL", "onboarding@resend.dev")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")
os.environ.setdefault("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "60")

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

DEFAULT_CATEGORIES = (
    ("11111111-1111-4111-8111-111111111111", "Alimentación"),
    ("22222222-2222-4222-8222-222222222222", "Transporte"),
    ("33333333-3333-4333-8333-333333333333", "Vivienda"),
    ("44444444-4444-4444-8444-444444444444", "Salud"),
    ("55555555-5555-4555-8555-555555555555", "Entretenimiento"),
    ("66666666-6666-4666-8666-666666666666", "Educación"),
    ("77777777-7777-4777-8777-777777777777", "Servicios"),
    ("88888888-8888-4888-8888-888888888888", "Compras"),
    ("99999999-9999-4999-8999-999999999999", "Otros"),
)


@pytest.fixture
def db_session() -> Session:
    from app.db.session import Base
    from app.models.category import Category

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    Base.metadata.create_all(bind=engine)
    session = testing_session_local()
    session.add_all(
        [
            Category(id=UUID(category_id), name=name, is_default=True)
            for category_id, name in DEFAULT_CATEGORIES
        ]
    )
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def client(db_session: Session) -> TestClient:
    from app.db.session import get_db
    from app.main import app

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def create_authenticated_user(client: TestClient):
    def _create_user(
        name: str = "Usuario Prueba", password: str = "Password123"
    ) -> dict:
        email = f"user-{uuid4()}@example.com"
        register_response = client.post(
            "/auth/register",
            json={"name": name, "email": email, "password": password},
        )
        assert register_response.status_code == 201

        login_response = client.post(
            "/auth/login",
            json={"email": email, "password": password},
        )
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        return {
            "email": email,
            "password": password,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
            "user": register_response.json(),
        }

    return _create_user
