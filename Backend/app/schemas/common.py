"""
Common Pydantic schemas for API responses.

Defines standard response formats for all API endpoints.
"""
from typing import Optional, TypeVar, Generic
from pydantic import BaseModel, Field


# ============================================================================
# Standard Response Schemas
# ============================================================================

T = TypeVar('T')


class SuccessResponse(BaseModel, Generic[T]):
    """
    Standard success response schema.

    Attributes:
        success: Always true for success responses
        data: Response payload (can be any type)
        message: Optional success message
        errors: Always null for success responses
    """
    success: bool = Field(default=True, description="Success flag")
    data: Optional[T] = Field(default=None, description="Response data")
    message: Optional[str] = Field(default=None, description="Success message")
    errors: Optional[list] = Field(default=None, description="Error list (null on success)")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "data": {"id": "tsk_123", "title": "New task"},
                    "message": "Task created successfully",
                    "errors": None
                }
            ]
        }
    }


class ErrorDetail(BaseModel):
    """
    Schema for individual error details.

    Attributes:
        field: Field name that has validation error
        message: Human-readable error message
    """
    field: str = Field(description="Field with error")
    message: str = Field(description="Error message")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "field": "title",
                    "message": "Title is required"
                }
            ]
        }
    }


class ErrorResponse(BaseModel):
    """
    Standard error response schema.

    Attributes:
        success: Always false for error responses
        data: Always null for error responses
        message: General error message
        errors: List of specific validation errors
    """
    success: bool = Field(default=False, description="Success flag (false on error)")
    data: Optional[dict] = Field(default=None, description="Response data (null on error)")
    message: str = Field(description="General error message")
    errors: Optional[list[ErrorDetail]] = Field(
        default=None,
        description="List of validation errors"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": False,
                    "data": None,
                    "message": "Validation failed",
                    "errors": [
                        {
                            "field": "title",
                            "message": "Title is required"
                        },
                        {
                            "field": "email",
                            "message": "Invalid email format"
                        }
                    ]
                }
            ]
        }
    }


# ============================================================================
# Helper Functions
# ============================================================================

def create_success_response(
    data: Optional[T] = None,
    message: Optional[str] = None
) -> dict:
    """
    Create a standardized success response.

    Args:
        data: Response payload
        message: Optional success message

    Returns:
        dict: Formatted success response

    Example:
        return create_success_response(
            data={"user": user_dict},
            message="User created successfully"
        )
    """
    return {
        "success": True,
        "data": data,
        "message": message,
        "errors": None
    }


def create_error_response(
    message: str,
    errors: Optional[list[ErrorDetail]] = None
) -> dict:
    """
    Create a standardized error response.

    Args:
        message: General error message
        errors: Optional list of specific errors

    Returns:
        dict: Formatted error response

    Example:
        return create_error_response(
            message="Validation failed",
            errors=[
                ErrorDetail(field="title", message="Title is required")
            ]
        )
    """
    # Convert ErrorDetail objects to dicts for JSON serialization
    errors_list = [err.model_dump() if hasattr(err, 'model_dump') else err for err in (errors or [])]

    return {
        "success": False,
        "data": None,
        "message": message,
        "errors": errors_list
    }
