import pytest
from fastapi import HTTPException

from app.budgets.router import validate_year


def test_validate_year_accepts_limits() -> None:
    validate_year(2000)
    validate_year(2100)


@pytest.mark.parametrize("year", [1999, 2101])
def test_validate_year_out_of_range_raises(year: int) -> None:
    with pytest.raises(HTTPException) as error:
        validate_year(year)

    assert error.value.status_code == 422
    assert error.value.detail == "El año debe estar entre 2000 y 2100"
