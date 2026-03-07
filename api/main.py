from fastapi import FastAPI
from api.models.profile_model import Profile
from api.services.qa_service import answer_question
from api.db_local import load_local_profile
from api.db_atlas import get_profile_from_atlas
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI(title="Mirel Portfolio API")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("portfolio.html", {"request": request})

@app.get("/en")
def home_en(request: Request):
    return templates.TemplateResponse("portfolio_EN.html", {"request": request})

# Intentar cargar desde Atlas
profile_data = get_profile_from_atlas()

# Si Atlas falla, usar JSON local
if not profile_data:
    profile_data = load_local_profile()

profile = Profile(**profile_data)

@app.get("/profile")
def get_profile():
    return profile

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
            "title": "E‑commerce",
            "description": "Aplicación web de comercio electrónico con catálogo dinámico y diseño responsivo.",
            "url": "https://mirelsig.github.io/e-commerce/",
            "repo": "https://github.com/MirelSIG/e-commerce"
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

