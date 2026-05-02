import hmac

from fastapi import FastAPI
from api.models.profile_model import Profile
from api.services.qa_service import answer_question
from api.db_local import load_local_profile
from api.db_atlas import ADMIN_API_KEY, get_profile_from_atlas, replace_profile_in_atlas
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Depends, Header, HTTPException, Request, status
from pathlib import Path

app = FastAPI(title="Mirel Portfolio API")

# Rutas absolutas para static y templates
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(request, "portfolio.html")

@app.get("/en")
def home_en(request: Request):
    return templates.TemplateResponse(request, "portfolio_EN.html")

@app.get("/health")
def health_check():
    """Endpoint para health check de Render y monitoreo"""
    return {
        "status": "healthy",
        "service": "mirel-portfolio",
        "version": "2.0"
    }

# Intentar cargar desde Atlas
profile_data = get_profile_from_atlas()

# Si Atlas falla, usar JSON local
if not profile_data:
    profile_data = load_local_profile()

profile = Profile(**profile_data)


def verify_admin_api_key(x_api_key: str = Header(default="")):
    """Protege endpoints de escritura con una API key configurada en el entorno."""
    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API key not configured",
        )

    if not hmac.compare_digest(x_api_key, ADMIN_API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

@app.get("/profile")
def get_profile():
    return profile


@app.put("/admin/profile/{profile_id}")
def update_profile(profile_id: str, payload: Profile, _: None = Depends(verify_admin_api_key)):
    """Actualiza el documento del perfil en MongoDB Atlas de forma autenticada."""
    if payload.id != profile_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Path profile_id does not match payload id",
        )

    updated_profile = replace_profile_in_atlas(payload.model_dump(mode="json"))
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or database not available",
        )

    global profile
    profile = Profile(**updated_profile)

    return {
        "status": "updated",
        "profile": profile,
    }

@app.get("/skills")
def get_skills():
    return profile.skills

@app.get("/experience")
def get_experience():
    return profile.experience

@app.get("/education")
def get_education():
    return profile.education

@app.get("/publications")
def get_publications():
    return profile.publications

@app.get("/qa")
def qa(question: str):
    return answer_question(profile.dict(), question)

@app.get("/proyectos")
def get_projects():
    """Endpoint para obtener la lista de proyectos."""
    projects = [
        {
            "title": "Online-commerce",
            "description": "Aplicación web de Online-commerce con catálogo dinámico y diseño responsivo.",
            "url": "https://mirelsig.github.io/Online-commerce/",
            "repo": "https://github.com/MirelSIG/Online-commerce"
        },
        {
            "title": "Gourmet on the Go",
            "description": "Plataforma culinaria con recetas y navegación intuitiva.",
            "url": "https://mirelsig.github.io/Gourmet-on-the-Go/",
            "repo": "https://github.com/MirelSIG/Gourmet-on-the-Go"
        },
        {
            "title": "Sitio Web Deportivo Surf",
            "description": "Sitio temático sobre surf con diseño visual atractivo y estructura orientada a contenido deportivo.",
            "url": "https://mirelsig.github.io/sitioWebDeportivoSurf/",
            "repo": "https://github.com/MirelSIG/sitioWebDeportivoSurf"
        },
        {
            "title": "SweetLab (en construcción)",
            "description": "Laboratorio creativo para prototipos UI/UX y experimentación web.",
            "url": "https://mirelsig.github.io/SweetLab/",
            "repo": "https://github.com/MirelSIG/SweetLab"
        }
    ]
    return projects

