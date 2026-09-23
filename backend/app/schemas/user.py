from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    is_active: bool = True


UserRole = Literal["VERIFICATION_OFFICER", "AUDITOR"]


class UserCreate(UserBase):
    password: str
    role: UserRole


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    roles: list[RoleOut] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
