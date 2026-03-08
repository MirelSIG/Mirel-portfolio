# Mirel Volcán Calderón - Portfolio Profesional

Portfolio web interactivo con FastAPI backend, agente de chat con IA (Ollama), y sistema de datos dinámicos.

## Visión General del Proyecto

### Propósito
Portfolio interactivo profesional de Mirel Marsoli Volcán Calderón, diseñado específicamente para facilitar el proceso de reclutamiento en tecnología. El objetivo principal es demostrar cómo 20+ años de experiencia combinada en sostenibilidad, cooperación internacional, enseñanza y gestión estratégica se traduce en valor para roles tecnológicos.

### Problema a Resolver
Los recruiters tecnológicos a menudo descartan perfiles con trayectorias no lineales sin entender el valor transferible de experiencias previas. Este proyecto soluciona este problema mediante:

1. **Portfolio Interactivo Bilingüe**: Presentación estructurada de información profesional en ES/EN
2. **Agente Conversacional Inteligente**: Sistema de Q&A que responde preguntas específicas de recruiters sobre experiencia, certificaciones, habilidades técnicas y blandas
3. **Demostración Técnica en Vivo**: Este portfolio no es solo una presentación de información, sino una **demostración técnica viva** de capacidades en:

    - **Backend Development**: FastAPI, APIs RESTful, validación de datos
    - **Frontend Development**: JavaScript moderno, DOM manipulation, async/await
    - **AI Integration**: Ollama, prompt engineering, fallback strategies
    - **DevOps**: Docker, docker-compose, multi-service orchestration. **Architecture**: Separation of concerns, modular design, error handling
    - **Documentation**: Este documento y todos los .md asociados

El proyecto está diseñado para ser:
- **Portable**: Funciona en cualquier OS con Docker
- **Maintainable**: Código limpio, comentado, estructurado
- **Extensible**: Fácil añadir features sin reescribir
- **Resilient**: Fallbacks garantizan funcionamiento siempre
- **Professional**: Nivel de calidad enterprise

---

### Stack Tecnológico
```
Backend:
- Python 3.11+
- FastAPI (framework web moderno y rápido)
- Pydantic (validación de datos)
- Uvicorn (servidor ASGI)
- Ollama (biblioteca Python para IA local)

Frontend:
- Jinja2 (templating)
- JavaScript Vanilla (sin frameworks para demostrar fundamentos)
- CSS3 moderno (variables CSS, Grid, Flexbox)
- Diseño responsive mobile-first

Datos:
- MongoDB Atlas (producción - opcional)
- JSON local (desarrollo y Docker)

IA:
- Ollama (servidor local de modelos LLM)
- Modelo: llama3.2:3b (balance entre rendimiento y recursos)

Infraestructura:
- Docker & Docker Compose (containerización multi-servicio)
- Git/GitHub (control de versiones)
```

---

## 🚀 Métodos de Instalación

### Opción 1: Docker (Recomendado) 🐳

La forma más fácil de ejecutar el portfolio en cualquier sistema operativo:

```bash
# 1. Clonar repositorio
git clone https://github.com/MirelSIG/Mirel-portfolio.git
cd Mirel-portfolio

# 2. Iniciar con Docker Compose
docker-compose up -d

# 3. (Opcional) Descargar modelo de IA
docker-compose exec ollama ollama pull llama3.2:3b

# 4. Acceder a la aplicación
# http://localhost:8000
```

📖 [Ver documentación completa de Docker](DOCKER_SETUP.md)

**Ventajas:**
- ✅ Funciona en Windows, Mac, Linux
- ✅ No necesitas instalar Python ni dependencias
- ✅ Incluye Ollama pre-configurado
- ✅ Un comando para iniciar todo

### Opción 2: Instalación Local

#### Requisitos
- Python 3.11+
- pip

#### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/MirelSIG/Mirel-portfolio.git
cd Mirel-portfolio

# 2. Crear entorno virtual
python -m venv .venv

# 3. Activar entorno virtual
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Iniciar servidor
uvicorn api.main:app --reload

# 6. Acceder a la aplicación
# http://localhost:8000
```

#### (Opcional) Configurar Ollama para IA mejorada

📖 [Ver guía de instalación de Ollama](OLLAMA_SETUP.md)

```bash
# Instalar Ollama desde: https://ollama.com/download
# Descargar modelo:
ollama pull llama3.2:3b

# El agente usará automáticamente Ollama si está disponible
```

## 📁 Estructura del Proyecto

```
Mirel-portfolio/
├── api/
│   ├── main.py              # FastAPI app principal
│   ├── models/              # Modelos Pydantic
│   └── services/
│       └── qa_service.py    # Servicio de chat con IA
├── data/
│   └── mirel_profile.json   # Datos del perfil
├── static/
│   ├── css/                 # Estilos
│   ├── js/                  # JavaScript (ES/EN)
│   └── img/                 # Imágenes
├── templates/
│   ├── portfolio.html       # Página principal (español)
│   └── portfolio_EN.html    # Página principal (inglés)
├── Dockerfile               # Configuración Docker
├── docker-compose.yml       # Orquestación de servicios
└── requirements.txt         # Dependencias Python
```

## 🌟 Características

- 🌐 **Bilingüe**: Español e Inglés
- 🤖 **Agente de Chat IA**: Responde preguntas sobre experiencia, habilidades y proyectos
- 📊 **Datos Dinámicos**: Información cargada desde JSON
- 🎨 **UI Moderna**: Sidebar navegable, modales informativos
- 🔍 **API RESTful**: Endpoints documentados (Swagger en `/docs`)
- 🐳 **Docker Ready**: Fácil deploy en cualquier plataforma

## 📡 API Endpoints

- `GET /` - Página principal (español)
- `GET /en` - Página principal (inglés)
- `GET /profile` - Información personal
- `GET /skills` - Habilidades técnicas y blandas
- `GET /experience` - Experiencia laboral
- `GET /education` - Formación académica
- `GET /publications` - Publicaciones
- `GET /qa?question=...` - Chat con agente IA
- `GET /docs` - Documentación Swagger

## 🛠️ Tecnologías

**Backend:**
- FastAPI
- Python 3.11+
- Pydantic
- Ollama (IA opcional)

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Jinja2 Templates
- Diseño Responsive

**DevOps:**
- Docker & Docker Compose
- Uvicorn
- Git

## 🧪 Testing

```bash
# Con instalación local:
python test_ollama.py

# Con Docker:
docker-compose exec web python test_ollama.py
```

## 📝 Comandos Útiles

### Docker

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Reconstruir después de cambios
docker-compose build
docker-compose up -d
```

### Local

```bash
# Actualizar dependencias
pip install -r requirements.txt

# Ver logs del servidor
# (Se muestran automáticamente con --reload)

# Detener servidor
# Ctrl+C en terminal
```

## 🌍 Deploy en Producción

### Con Docker

1. En servidor con Docker instalado:
```bash
git clone https://github.com/MirelSIG/Mirel-portfolio.git
cd Mirel-portfolio
docker-compose up -d
```

2. Configurar nginx como proxy reverso (opcional).

### Sin Docker

Ver documentación de [FastAPI deployment](https://fastapi.tiangolo.com/deployment/).

## 📚 Documentación Adicional

- [Configuración Docker](DOCKER_SETUP.md)
- [Configuración Ollama](OLLAMA_SETUP.md)

## 🐛 Troubleshooting

**Puerto 8000 en uso:**
```bash
# Ver qué proceso usa el puerto y eliminarlo
# O cambiar puerto en docker-compose.yml o comando uvicorn
```

**Ollama no conecta:**
```bash
# Verificar que esté corriendo
docker-compose ps ollama  # Con Docker
ollama ps                  # Local
```

**Cambios no se reflejan:**
- Con Docker: volúmenes están montados, deberían actualizarse automáticamente
- Local: --reload debería auto-recargar el servidor

---

## 🌐 Proyectos desplegados

### **Online‑commerce**
- 🔗 Proyecto: [https://mirelsig.github.io/Online-commerce/]
- 💻 Código: https://github.com/MirelSIG/Online-commerce
  
> Updated links (user provided):
- 🔗 Proyecto: https://mirelsig.github.io/Online-commerce/
- 💻 Código: https://github.com/MirelSIG/Online-commerce

### **Gourmet on the Go**
- 🔗 Proyecto: https://mirelsig.github.io/Gourmet-on-the-Go/
- 💻 Código: https://github.com/MirelSIG/Gourmet-on-the-Go

### **Sitio Web Deportivo Surf**
- 🔗 Proyecto: https://mirelsig.github.io/sitioWebDeportivoSurf/
- 💻 Código: https://github.com/MirelSIG/sitioWebDeportivoSurf

### **SweetLab (en construcción)**
- 🔗 Proyecto: https://mirelsig.github.io/SweetLab/
- 💻 Código: https://github.com/MirelSIG/SweetLab

## 🌐 Deployed Projects


**Última actualización**: 8 de marzo de 2026
**Versión**: 2.0
**Autor**: Mirel Marsoli Volcán Calderón
**Repositorio**: [github.com/MirelSIG/Mirel-portfolio](https://github.com/MirelSIG/Mirel-portfolio)
