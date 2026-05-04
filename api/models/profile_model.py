from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class Profile(BaseModel):
    id: str
    personal_info: Dict[str, Any]
    summary: Dict[str, List[str]]
    skills: Dict[str, Dict[str, List[str]]]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    certifications: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    publications: List[Dict[str, Any]]
    meta: Dict[str, Any]
