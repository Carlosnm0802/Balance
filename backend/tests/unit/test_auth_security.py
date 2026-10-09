import jwt
import pytest

from app.auth.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password() -> None:
    raw_password = "Password123!"
    hashed_password = hash_password(raw_password)

    assert hashed_password != raw_password
    assert verify_password(raw_password, hashed_password) is True
    assert verify_password("wrong-password", hashed_password) is False


def test_create_and_decode_access_token() -> None:
    subject = "123e4567-e89b-12d3-a456-426614174000"

    token = create_access_token(subject)
    payload = decode_access_token(token)

    assert payload["sub"] == subject
    assert "exp" in payload


def test_decode_access_token_with_invalid_token_raises() -> None:
    valid_token = create_access_token("123e4567-e89b-12d3-a456-426614174000")
    invalid_token = valid_token[:-1] + ("a" if valid_token[-1] != "a" else "b")

    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(invalid_token)
