from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("El nombre no puede estar vacío")
        return name


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    is_default: bool
