from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import json
import os

app = FastAPI()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app.add_middleware( CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], )

# -----------------------------
# CARGA CORRECTA DE JSON (ARREGLADO)
# -----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "perfil_ES.json"), "r", encoding="utf-8") as f:
    perfil = json.load(f)


# -----------------------------
# MODELOS Pydantic
# -----------------------------

class Pregunta(BaseModel):
    pregunta: str

class TraduccionSeccion(BaseModel):
    seccion: str
    idioma: str = "en"

class Buscar(BaseModel):
    termino: str

class PreguntarSobre(BaseModel):
    seccion: str
    pregunta: str

class ResumirSeccion(BaseModel):
    seccion: str
    longitud: str = "corto"

class CompararExperiencias(BaseModel):
    exp1: str
    exp2: str

class Publicacion(BaseModel):
    titulo: str

class PublicacionResumen(BaseModel):
    titulo: str


# -----------------------------
# ENDPOINTS DE INFORMACIÓN
# -----------------------------

@app.get("/perfil")
async def obtener_perfil():
    return perfil["personal_info"]

@app.get("/experiencia")
async def obtener_experiencia():
    return perfil["experience"]

@app.get("/habilidades")
async def obtener_habilidades():
    return perfil["skills"]

@app.get("/educacion")
async def obtener_educacion():
    return perfil["education"]

@app.get("/resumen")
async def obtener_resumen():
    return perfil["professional_summary"]


# -----------------------------
# TRADUCIR SECCIÓN COMPLETA
# -----------------------------

@app.post("/traducir_seccion")
async def traducir_seccion(data: TraduccionSeccion):

    seccion = data.seccion.lower()

    if seccion not in perfil:
        return {"error": f"La sección '{data.seccion}' no existe."}

    contenido = perfil[seccion]

    prompt = f"Traduce al {data.idioma} el siguiente contenido:\n\n{json.dumps(contenido, ensure_ascii=False, indent=2)}"

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return {"traduccion": response.choices[0].message.content}


# -----------------------------
# BUSCAR DENTRO DEL PERFIL
# -----------------------------

@app.post("/buscar")
async def buscar(data: Buscar):

    termino = data.termino.lower()
    resultados = []

    def buscar_recursivo(obj, ruta=""):
        if isinstance(obj, dict):
            for k, v in obj.items():
                buscar_recursivo(v, f"{ruta}/{k}")
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                buscar_recursivo(item, f"{ruta}[{i}]")
        else:
            if termino in str(obj).lower():
                resultados.append({"ruta": ruta, "valor": obj})

    buscar_recursivo(perfil)

    return {"resultados": resultados}


# -----------------------------
# PREGUNTAR SOBRE UNA SECCIÓN
# -----------------------------

@app.post("/preguntar_sobre")
async def preguntar_sobre(data: PreguntarSobre):

    seccion = data.seccion.lower()

    if seccion not in perfil:
        return {"error": f"La sección '{data.seccion}' no existe."}

    contenido = perfil[seccion]

    prompt = f"""
Responde la siguiente pregunta usando SOLO esta sección del perfil:

SECCIÓN: {data.seccion}
CONTENIDO:
{json.dumps(contenido, ensure_ascii=False)}

PREGUNTA:
{data.pregunta}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return {"respuesta": response.choices[0].message.content}


# -----------------------------
# RESUMIR UNA SECCIÓN
# -----------------------------

@app.post("/resumir_seccion")
async def resumir_seccion(data: ResumirSeccion):

    seccion = data.seccion.lower()

    if seccion not in perfil:
        return {"error": f"La sección '{data.seccion}' no existe."}

    contenido = perfil[seccion]

    prompt = f"""
Resume la siguiente sección del perfil con un nivel de detalle '{data.longitud}':

SECCIÓN: {data.seccion}
CONTENIDO:
{json.dumps(contenido, ensure_ascii=False)}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return {"resumen": response.choices[0].message.content}


# -----------------------------
# COMPARAR DOS EXPERIENCIAS
# -----------------------------

@app.post("/comparar_experiencias")
async def comparar_experiencias(data: CompararExperiencias):

    exp1 = data.exp1.lower()
    exp2 = data.exp2.lower()

    if exp1 not in perfil["experience"] or exp2 not in perfil["experience"]:
        return {"error": "Una o ambas experiencias no existen."}

    contenido1 = perfil["experience"][exp1]
    contenido2 = perfil["experience"][exp2]

    prompt = f"""
Compara estas dos experiencias profesionales de Mirel:

EXPERIENCIA 1 ({data.exp1}):
{json.dumps(contenido1, ensure_ascii=False)}

EXPERIENCIA 2 ({data.exp2}):
{json.dumps(contenido2, ensure_ascii=False)}

Haz una comparación clara, profesional y estructurada.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return {"comparacion": response.choices[0].message.content}


# -----------------------------
# CHATBOT GENERAL
# -----------------------------

@app.post("/preguntar")
async def preguntar(p: Pregunta):

    prompt = f"""
Eres un asistente que responde preguntas sobre el perfil profesional de Mirel.
Usa únicamente la información del siguiente JSON:

{json.dumps(perfil, ensure_ascii=False)}

Pregunta del usuario: {p.pregunta}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return {"respuesta": response.choices[0].message.content}


# -----------------------------
# RESUMIR PUBLICACIÓN (ES)
# -----------------------------

@app.post("/resumir_publicacion")
async def resumir_publicacion_es(data: Publicacion):
    titulo = data.titulo

    publicacion = next(
        (p for p in perfil.get("publicaciones", []) if p.get("titulo") == titulo),
        None
    )

    if not publicacion:
        return {"resumen": "No encontré esa publicación en el perfil."}

    prompt = f"""
Resume la siguiente publicación de Mirel de forma clara y profesional:

{json.dumps(publicacion, ensure_ascii=False)}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return {"resumen": response.choices[0].message.content}


# -----------------------------
# RESUMIR PUBLICACIÓN (EN)
# -----------------------------

@app.post("/publicaciones/resumen")
async def resumir_publicacion(data: PublicacionResumen):
    titulo = data.titulo

    publicacion = next(
        (p for p in perfil.get("publicaciones", []) if p.get("titulo") == titulo or p.get("title") == titulo),
        None
    )

    if not publicacion:
        return {"resumen": "No encontré esa publicación en el perfil."}

    prompt = f"""
Resume the following publication of Mirel in a clear, professional way. 
If the content is in Spanish, you may keep the language consistent with it.

Publication data:
{json.dumps(publicacion, ensure_ascii=False)}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return {"resumen": response.choices[0].message.content}

@app.get("/proyectos")
async def obtener_proyectos():
    return [
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
