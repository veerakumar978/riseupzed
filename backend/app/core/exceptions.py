from typing import Any, Optional
from fastapi import HTTPException, status

class RiseupzedException(HTTPException):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: Any = None,
        headers: Optional[dict] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class RecordNotFoundException(RiseupzedException):
    def __init__(self, entity_name: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with identifier '{identifier}' was not found.",
        )

class DatabaseConnectionException(RiseupzedException):
    def __init__(self, message: str = "Database connection could not be established."):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=message,
        )
