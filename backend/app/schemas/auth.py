from typing import Literal

from pydantic import BaseModel, EmailStr

LoginRole = Literal["OFFICER", "ADMIN", "AUDITOR"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: LoginRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
