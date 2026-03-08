# 📚 Mirel Portfolio - Documentación Técnica Completa (Know-How)

## Índice
1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Evolución del Desarrollo](#evolución-del-desarrollo)
4. [El Agente de Q&A: Diseño e Implementación](#el-agente-de-qa-diseño-e-implementación)
5. [Integración de Ollama: IA Conversacional](#integración-de-ollama-ia-conversacional)
6. [Containerización con Docker](#containerización-con-docker)
7. [Estructura de Datos](#estructura-de-datos)
8. [Frontend: Interactividad y UX](#frontend-interactividad-y-ux)
9. [Problemas Técnicos y Soluciones](#problemas-técnicos-y-soluciones)
10. [Decisiones de Diseño Clave](#decisiones-de-diseño-clave)
11. [Guía de Mantenimiento y Extensión](#guía-de-mantenimiento-y-extensión)

---

## Visión General del Proyecto

### Propósito
Portfolio interactivo profesional para Mirel Marsoli Volcán Calderón, diseñado específicamente para facilitar el proceso de reclutamiento en tecnología. El objetivo principal es demostrar cómo 20+ años de experiencia combinada en sostenibilidad, cooperación internacional, enseñanza y gestión estratégica se traduce en valor para roles tecnológicos.

### Problema a Resolver
Los recruiters tecnológicos a menudo descartan perfiles con trayectorias no lineales sin entender el valor transferible de experiencias previas. Este proyecto soluciona este problema mediante:

1. **Portfolio Interactivo Bilingüe**: Presentación estructurada de información profesional en ES/EN
2. **Agente Conversacional Inteligente**: Sistema de Q&A que responde preguntas específicas de recruiters sobre experiencia, certificaciones, habilidades técnicas y blandas
3. **Demostración Técnica en Vivo**: El portfolio mismo es una prueba de competencias en:
   - Backend (Python/FastAPI)
   - Frontend (JavaScript/CSS moderno)
   - Arquitectura de APIs RESTful
   - Integración de IA (Ollama)
   - DevOps (Docker/Docker Compose)
   - Bases de datos (MongoDB)

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

## Arquitectura del Sistema

### Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                             │
│  ┌───────────────────┐         ┌──────────────────────┐    │
│  │ portfolio.html    │         │ portfolio_EN.html    │    │
│  │ (Jinja2 template) │         │ (Jinja2 template)    │    │
│  └─────────┬─────────┘         └──────────┬───────────┘    │
│            │                                │                │
│            └────────────┬───────────────────┘                │
│                         │                                    │
│                  ┌──────▼──────┐                            │
│                  │ portfolio.js │                            │
│                  │ (ES + EN)    │                            │
│                  └──────┬───────┘                            │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTP Requests (Fetch API)
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    main.py                           │  │
│  │  - CORS configuration                                │  │
│  │  - Static files mounting                             │  │
│  │  - Template rendering                                │  │
│  │  - API route definitions                             │  │
│  └────────┬─────────────────────────────┬───────────────┘  │
│           │                              │                  │
│  ┌────────▼──────────┐         ┌────────▼──────────────┐  │
│  │  profile_model.py │         │   qa_service.py       │  │
│  │  (Pydantic)       │         │   (Agente Q&A)        │  │
│  │  - Validación     │         │   - Ollama API        │  │
│  │  - Tipado         │         │   - Keyword fallback  │  │
│  └────────┬──────────┘         └────────┬──────────────┘  │
│           │                              │                  │
│  ┌────────▼──────────────────────────────▼──────────────┐  │
│  │            db_local.py / db_atlas.py                 │  │
│  │            (Data Access Layer)                       │  │
│  └────────┬─────────────────────────────────────────────┘  │
└───────────┼──────────────────────────────────────────────┘
            │
┌───────────▼─────────────────┐    ┌─────────────────────┐
│  data/mirel_profile.json    │    │   MongoDB Atlas     │
│  (Fuente de verdad local)   │    │   (Opcional/Prod)   │
└─────────────────────────────┘    └─────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    Ollama Service                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Servidor Ollama (Puerto 11434)                    │  │
│  │  └─> Modelo: llama3.2:3b                           │  │
│  │       - Procesamiento de lenguaje natural          │  │
│  │       - Generación de respuestas contextuales      │  │
│  │       - Timeout: 30 segundos                       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Flujo de Datos: Pregunta al Agente

```
1. Usuario escribe pregunta → Chat UI (portfolio.js)
                                    ↓
2. Fetch POST → /api/chat con {"question": "..."}
                                    ↓
3. FastAPI recibe request → main.py endpoint /api/chat
                                    ↓
4. Llama qa_service.answer_question(question, profile_data)
                                    ↓
5. qa_service intenta Ollama primero:
   ├─> Ollama disponible → answer_question_with_ollama()
   │                        └─> Prompt con contexto completo
   │                        └─> Respuesta IA natural
   ├─> Ollama no disponible/timeout → Fallback a keywords
   │                                   └─> 15+ patrones regex
   │                                   └─> Respuesta estructurada
                                    ↓
6. FastAPI devuelve JSON: {"answer": "..."}
                                    ↓
7. portfolio.js renderiza respuesta en chat window
```

---

## Evolución del Desarrollo

### Fase 1: Configuración Base y Servidor (Semana 1)

**Contexto**: Proyecto FastAPI inicial con estructura básica pero servidor no arrancaba.

**Problemas Encontrados**:
- Virtual environment no activado correctamente
- Dependencias faltantes (uvicorn no instalado)
- Puerto 8000 conflictos con otros servicios

**Soluciones Implementadas**:
```bash
# Activación correcta del entorno
.venv\Scripts\Activate.ps1  # Windows PowerShell

# Instalación completa de dependencias
pip install -r requirements.txt

# Inicio con auto-reload para desarrollo
uvicorn api.main:app --reload --host localhost --port 8000
```

**Aprendizajes**:
- Siempre verificar que el venv esté activado antes de instalar o ejecutar
- `--reload` es esencial en desarrollo para ver cambios sin reiniciar
- FastAPI necesita declaración explícita de `app` en main.py

---

### Fase 2: Estructura de Datos y Modelos (Semana 1)

**Contexto**: El servidor arrancaba pero fallaba al cargar datos del JSON.

**Problema Crítico**:
```python
# Error de validación Pydantic
ValidationError: field required (type=value_error.missing)
```

**Causa Raíz**:
El JSON tenía una estructura con clave `"profile"` pero el modelo Pydantic esperaba `"personal_info"`:

```json
// ❌ data/mirel_profile.json (versión incorrecta)
{
  "profile": {
    "full_name": "Mirel Marsoli Volcán Calderón",
    ...
  }
}
```

```python
# ✅ api/models/profile_model.py
class Profile(BaseModel):
    personal_info: PersonalInfo  # <- Esperaba este nombre
    skills: Skills
    ...
```

**Solución**:
Cambiar la clave en el JSON para que coincida con el modelo:
```json
// ✅ data/mirel_profile.json (corregido)
{
  "personal_info": {
    "full_name": "Mirel Marsoli Volcán Calderón",
    ...
  }
}
```

**Decisión de Diseño**:
Mantener `personal_info` en lugar de `profile` porque:
1. Es más descriptivo y específico
2. Evita confusión con el concepto de "perfil general"
3. Sigue convenciones de nomenclatura clara en APIs

---

### Fase 3: Frontend - Corrección de Errores JavaScript (Semana 2)

**Contexto**: HTML cargaba pero botones de sidebar y chat no respondían.

**Problema 1: SyntaxError en JavaScript**

Errores encontrados en `portfolio.js` y `portfolio_EN.js`:
```javascript
// ❌ Líneas 430-435 (código duplicado)
} else {
    console.error('Error al cargar publicaciones:', error);
    publicationsContent.innerHTML = '<p>Error al cargar publicaciones.</p>';
}
// Código duplicado causaba SyntaxError
} else {
    console.error('Error al cargar publicaciones:', error);
    publicationsContent.innerHTML = '<p>Error al cargar publicaciones.</p>';
}
```

**Solución**:
Eliminar completamente el bloque duplicado, dejando solo uno:
```javascript
// ✅ Corrección
try {
    const response = await fetch('/api/publications');
    // ... código de procesamiento
} catch (error) {
    console.error('Error al cargar publicaciones:', error);
    publicationsContent.innerHTML = '<p>Error al cargar publicaciones.</p>';
} // <- Un solo bloque catch
```

**Problema 2: Múltiples DOMContentLoaded**

Código disperso en múltiples listeners causaba conflictos:
```javascript
// ❌ Patrón problemático
document.addEventListener('DOMContentLoaded', () => {
    // Setup sidebar
});
// ... 50 líneas después ...
document.addEventListener('DOMContentLoaded', () => {
    // Setup chat
});
// ... 100 líneas después ...
document.addEventListener('DOMContentLoaded', () => {
    // Otro setup
});
```

**Solución - Consolidación**:
```javascript
// ✅ Un solo DOMContentLoaded con todo el setup
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // 2. Chat launcher
    const chatLauncher = document.getElementById('chat-launcher');
    const chatWindow = document.getElementById('chat-window');
    
    if (chatLauncher && chatWindow) {
        chatLauncher.addEventListener('click', () => {
            chatWindow.style.display = 'flex';
        });
    }
    
    // 3. Chat send button
    const chatSend = document.getElementById('chat-send');
    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }
    
    // 4. Enter key en input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
```

**Aprendizajes**:
- Un solo `DOMContentLoaded` mejora mantenibilidad y previene race conditions
- Verificar existencia de elementos (`if (element)`) antes de añadir listeners
- Mantener el setup de interactividad en un solo lugar, al inicio del archivo

---

### Fase 4: Mejoras en Visualización de Datos (Semana 2)

**Problema: Soft Skills no se mostraban**

El modal de habilidades solo mostraba habilidades técnicas.

**Causa**:
```javascript
// ❌ portfolio.js línea 364 (aproximada)
if (data.soft && data.soft.es) {
    data.soft.es.forEach(skill => {
        // ...
    });
}
```

Pero en el JSON la estructura era:
```json
{
  "skills": {
    "technical": {
      "es": [...],
      "en": [...]
    },
    "skills": {  // <- Las soft skills están aquí
      "es": [...],
      "en": [...]
    }
  }
}
```

**Solución**:
```javascript
// ✅ Corrección
if (data.skills && data.skills.es) {
    data.skills.es.forEach(skill => {
        softSkillsList.innerHTML += `<li>${skill}</li>`;
    });
}
```

**Decisión de Diseño**:
Aunque la estructura `skills.skills` puede parecer redundante, se mantiene por:
1. Compatibilidad con el modelo Pydantic existente
2. Claridad: `skills.technical` vs `skills.skills` (soft)
3. Extensibilidad: facilita añadir futuros tipos de habilidades

---

### Fase 5: Reestructuración del Sidebar (Semana 2)

**Cambios Solicitados**:
1. Eliminar link "Documentación Swagger"
2. Añadir botón "Proyectos" que navegue a sección `#proyectos`
3. "Publicaciones" debe abrir modal, no navegar directamente

**Implementación en `portfolio.html` y `portfolio_EN.html`**:

```html
<!-- ❌ Antes -->
<li><a href="/docs" target="_blank">Documentación Swagger</a></li>
<li><a href="#publicaciones">Publicaciones</a></li>

<!-- ✅ Después -->
<li><a href="#proyectos">Proyectos</a></li>
<li><a href="#" data-endpoint="publications">Publicaciones</a></li>
```

**JavaScript Handling**:
```javascript
// Sistema de modales con data-endpoint
document.querySelectorAll('[data-endpoint]').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const endpoint = link.getAttribute('data-endpoint');
        
        // Fetch data y mostrar en modal
        const response = await fetch(`/api/${endpoint}`);
        const data = await response.json();
        
        // Renderizar según tipo de data
        showModal(endpoint, data);
    });
});
```

---

## El Agente de Q&A: Diseño e Implementación

### Concepto y Propósito

El agente conversacional es el **componente diferenciador** del portfolio. Su propósito es:

1. **Responder preguntas específicas** que los recruiters tienen pero no hacen por falta de tiempo
2. **Contextualizar experiencia no tecnológica** explicando su valor transferible
3. **Proporcionar información detallada** sobre certificaciones, habilidades, proyectos
4. **Demostrar capacidad técnica** implementando un sistema Q&A inteligente

### Arquitectura del Agente: Sistema Dual

```
                    ┌─────────────────────┐
                    │  Pregunta Usuario   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   qa_service.py     │
                    │ answer_question()   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
    ┌───────────▼────────────┐    ┌──────────▼──────────┐
    │   MODO 1: OLLAMA IA    │    │  MODO 2: KEYWORDS   │
    │   (Preferido)          │    │  (Fallback)         │
    └───────────┬────────────┘    └──────────┬──────────┘
                │                             │
    ┌───────────▼────────────┐    ┌──────────▼──────────┐
    │ answer_question_with   │    │ Regex Pattern       │
    │ _ollama()              │    │ Matching            │
    │ - Contexto completo    │    │ - 15+ patrones      │
    │ - Respuesta natural    │    │ - Respuestas        │
    │ - Timeout 30s          │    │   estructuradas     │
    └───────────┬────────────┘    └──────────┬──────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Respuesta JSON    │
                    │  {"answer": "..."}  │
                    └─────────────────────┘
```

### Implementación Detallada

#### Archivo: `api/services/qa_service.py`

```python
import re
import ollama
import os
from typing import Dict, Any, Optional

def answer_question_with_ollama(question: str, profile_data: Dict[str, Any]) -> Optional[str]:
    """
    Modo 1: Respuestas con Ollama (IA)
    
    Ventajas:
    - Respuestas naturales y contextuales
    - Capacidad de inferencia y síntesis
    - Mejor manejo de preguntas complejas o ambiguas
    
    Limitaciones:
    - Requiere Ollama instalado y modelo descargado
    - Timeout de 30s puede no ser suficiente para preguntas muy complejas
    - Respuestas pueden variar ligeramente entre llamadas
    """
    try:
        # Configuración del host (importante para Docker)
        ollama_host = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
        
        # Construcción del contexto completo
        # Este es el "conocimiento" que le pasamos al modelo
        context = f"""
        Eres un asistente virtual para el portfolio profesional de Mirel Marsoli Volcán Calderón.

        INFORMACIÓN PERSONAL:
        - Nombre completo: {profile_data['personal_info']['full_name']}
        - Email: {profile_data['personal_info']['email']}
        - Ubicación: {profile_data['personal_info']['location']}
        - Nacionalidades: {', '.join(profile_data['personal_info']['nationalities'])}
        - Idiomas: {', '.join([f"{lang['language']} ({lang['level']})" for lang in profile_data['personal_info']['languages']])}

        RESUMEN PROFESIONAL (ES):
        {profile_data['summary']['es']}

        RESUMEN PROFESIONAL (EN):
        {profile_data['summary']['en']}

        HABILIDADES TÉCNICAS:
        {', '.join(profile_data['skills']['technical']['es'])}

        HABILIDADES BLANDAS:
        {', '.join(profile_data['skills']['skills']['es'])}

        EXPERIENCIA PROFESIONAL:
        """
        
        # Añadir cada posición con detalles completos
        for exp in profile_data['experience']:
            context += f"""
            
            Empresa: {exp['company']}
            Cargo: {exp['position']}
            Período: {exp['period']}
            Ubicación: {exp['location']}
            Responsabilidades: {', '.join(exp['responsibilities_es'])}
            """
        
        # Educación
        context += "\n\nEDUCACIÓN:\n"
        for edu in profile_data['education']:
            context += f"- {edu['degree']} en {edu['institution']} ({edu['period']})\n"
        
        # Certificaciones (crítico para posiciones Salesforce)
        if 'certifications' in profile_data:
            context += "\n\nCERTIFICACIONES:\n"
            for cert in profile_data['certifications']:
                credential = cert.get('credential_id', 'N/A')
                context += f"- {cert['name']} (Credential: {credential}, {cert['date']})\n"
        
        # Publicaciones
        if 'publications' in profile_data:
            context += "\n\nPUBLICACIONES:\n"
            for pub in profile_data['publications']:
                context += f"- {pub['title']} ({pub['year']}): {pub['description_es']}\n"
        
        # System prompt con instrucciones claras
        system_prompt = """
        Eres un asistente profesional y técnico. Responde de manera:
        1. Concisa pero completa
        2. Profesional y técnica cuando sea apropiado
        3. En el mismo idioma de la pregunta (español o inglés)
        4. Destacando competencias transferibles de experiencias diversas
        5. Si la pregunta es sobre experiencia no tecnológica, explica su valor para tech
        
        NO inventes información. Si no sabes algo, admítelo.
        """
        
        # Llamada a Ollama
        response = ollama.chat(
            model='llama3.2:3b',  # Modelo específico
            messages=[
                {
                    'role': 'system',
                    'content': system_prompt + "\n\n" + context
                },
                {
                    'role': 'user',
                    'content': question
                }
            ],
            options={'timeout': 30}  # Timeout de 30 segundos
        )
        
        return response['message']['content']
        
    except Exception as e:
        # Si algo falla, log y return None para usar fallback
        print(f"Error en Ollama: {str(e)}")
        return None


def answer_question(question: str, profile_data: Dict[str, Any]) -> str:
    """
    Modo 2: Respuestas con Keywords (Fallback)
    
    Este método se usa cuando:
    - Ollama no está instalado
    - Ollama no responde (timeout, error)
    - Ollama devuelve None o string vacío
    
    Ventajas:
    - Siempre disponible (no requiere dependencias externas)
    - Respuestas instant��neas (sin latencia de IA)
    - Respuestas predecibles y consistentes
    
    Limitaciones:
    - Requiere patrones predefinidos
    - No entiende preguntas fuera de patrones
    - Respuestas menos naturales
    """
    
    # Primero intentar con Ollama
    ollama_response = answer_question_with_ollama(question, profile_data)
    if ollama_response:
        return ollama_response
    
    # Si Ollama falla, usar keywords
    question_lower = question.lower()
    
    # ===== PATRÓN 1: Salesforce =====
    if re.search(r'\b(salesforce|crm salesforce|sales cloud|service cloud)\b', question_lower):
        certs = profile_data.get('certifications', [])
        sf_certs = [c for c in certs if 'Salesforce' in c['name']]
        
        response = "Mirel cuenta con las siguientes certificaciones Salesforce:\n\n"
        for cert in sf_certs:
            credential = cert.get('credential_id', 'No disponible')
            response += f"• {cert['name']} (Credencial: {credential}, {cert['date']})\n"
        
        response += "\nEstas certificaciones demuestran competencia en:"
        response += "\n- Administración de Salesforce"
        response += "\n- Desarrollo de aplicaciones personalizadas"
        response += "\n- Implementación de Service Cloud"
        response += "\n- Integración de IA en Salesforce"
        
        return response
    
    # ===== PATRÓN 2: CRM General =====
    if re.search(r'\b(crm|customer relationship|gestión de clientes)\b', question_lower):
        # Buscar experiencia en Kernet (Odoo/CRM)
        kernet_exp = next((exp for exp in profile_data['experience'] 
                          if 'Kernet' in exp['company']), None)
        
        if kernet_exp:
            response = f"Experiencia en CRM:\n\n"
            response += f"**{kernet_exp['position']} en {kernet_exp['company']}** ({kernet_exp['period']})\n\n"
            response += "Responsabilidades clave:\n"
            for resp in kernet_exp['responsibilities_es'][:4]:
                response += f"• {resp}\n"
            
            response += "\nAdemás, cuento con 5 certificaciones Salesforce que validan mis conocimientos en CRM empresarial."
            return response
    
    # ===== PATRÓN 3: Odoo/ERP =====
    if re.search(r'\b(odoo|erp|enterprise resource planning)\b', question_lower):
        kernet_exp = next((exp for exp in profile_data['experience'] 
                          if 'Kernet' in exp['company']), None)
        
        if kernet_exp:
            response = f"Experiencia con Odoo/ERP:\n\n"
            response += f"**{kernet_exp['position']} en {kernet_exp['company']}**\n"
            response += f"Período: {kernet_exp['period']}\n"
            response += f"Ubicación: {kernet_exp['location']}\n\n"
            response += "Principales actividades:\n"
            for resp in kernet_exp['responsibilities_es']:
                response += f"• {resp}\n"
            
            response += "\nOdoo es una plataforma ERP integral que incluye CRM, ventas, inventario, contabilidad y más."
            return response
    
    # ===== PATRÓN 4: Certificaciones (separado de educación) =====
    if re.search(r'\b(certificaci[oó]n|certificado|credential|badge)\b', question_lower):
        certs = profile_data.get('certifications', [])
        
        if certs:
            response = "Certificaciones profesionales:\n\n"
            for cert in certs:
                credential = cert.get('credential_id', 'N/A')
                response += f"• **{cert['name']}**\n"
                response += f"  Fecha: {cert['date']}\n"
                response += f"  Credencial: {credential}\n\n"
            
            response += "\nEstas certificaciones están activas y pueden verificarse en Trailhead de Salesforce."
            return response
    
    # ===== PATRÓN 5: Educación =====
    if re.search(r'\b(educaci[oó]n|estudio|universidad|formaci[oó]n académica)\b', question_lower):
        edu = profile_data['education']
        
        response = "Formación académica:\n\n"
        for item in edu:
            response += f"• **{item['degree']}**\n"
            response += f"  Institución: {item['institution']}\n"
            response += f"  Período: {item['period']}\n"
            response += f"  Ubicación: {item['location']}\n\n"
        
        return response
    
    # ===== PATRÓN 6: Experiencia Ambiental/Sostenibilidad =====
    if re.search(r'\b(ambient|sostenibilidad|sustentabilidad|conservaci[oó]n|ecosistema|biodiversidad)\b', question_lower):
        # Buscar experiencias relacionadas: INTEC, USAID/USFS
        env_experiences = [exp for exp in profile_data['experience'] 
                          if any(keyword in exp['company'].lower() 
                          for keyword in ['intec', 'usaid', 'usfs', 'forestal'])]
        
        response = "Experiencia en sostenibilidad y medio ambiente:\n\n"
        
        for exp in env_experiences:
            response += f"**{exp['position']} en {exp['company']}** ({exp['period']})\n"
            response += f"Ubicación: {exp['location']}\n\n"
            response += "Principales contribuciones:\n"
            for resp in exp['responsibilities_es']:
                response += f"• {resp}\n"
            response += "\n"
        
        response += "\n**Valor transferible para tech:**\n"
        response += "• Análisis de datos complejos y sistemas interconectados\n"
        response += "• Gestión de proyectos técnicos con múltiples stakeholders\n"
        response += "• Implementación de soluciones tecnológicas para monitoreo\n"
        response += "• Visión sistémica aplicable a arquitectura de software\n"
        
        return response
    
    # ===== PATRÓN 7: Cooperación Internacional =====
    if re.search(r'\b(internacional|usaid|usfs|cooperaci[oó]n|desarrollo)\b', question_lower):
        usaid_exp = next((exp for exp in profile_data['experience'] 
                         if 'USAID' in exp['company']), None)
        
        if usaid_exp:
            response = f"Experiencia en cooperación internacional:\n\n"
            response += f"**{usaid_exp['position']} en {usaid_exp['company']}**\n"
            response += f"Período: {usaid_exp['period']}\n"
            response += f"Ubicación: {usaid_exp['location']}\n\n"
            response += "Logros clave:\n"
            for resp in usaid_exp['responsibilities_es']:
                response += f"• {resp}\n"
            
            response += "\n**Competencias desarrolladas relevantes para tech:**\n"
            response += "• Gestión de proyectos complejos con estándares internacionales\n"
            response += "• Trabajo en equipos distribuidos geográficamente (remote-first)\n"
            response += "• Comunicación técnica con audiencias diversas\n"
            response += "• Documentación y reportería estructurada\n"
            
            return response
    
    # ===== PATRÓN 8: Experiencia Docente/Facilitación =====
    if re.search(r'\b(docente|profesor|enseñanza|capacitaci[oó]n|formaci[oó]n|mentor)\b', question_lower):
        teaching_exp = [exp for exp in profile_data['experience'] 
                       if any(univ in exp['company'] for univ in ['UNELLEZ', 'UBV'])]
        
        response = "Experiencia docente y de facilitación:\n\n"
        
        for exp in teaching_exp:
            response += f"**{exp['position']} en {exp['company']}** ({exp['period']})\n"
            response += f"Ubicación: {exp['location']}\n\n"
            response += "Actividades principales:\n"
            for resp in exp['responsibilities_es'][:3]:
                response += f"• {resp}\n"
            response += "\n"
        
        response += "**Habilidades transferibles a tech:**\n"
        response += "• Comunicación técnica clara y adaptada a la audiencia (crucial en documentación y colaboración)\n"
        response += "• Capacidad de aprendizaje continuo y enseñanza de conceptos complejos\n"
        response += "• Mentoría y desarrollo de talento (team leadership)\n"
        response += "• Diseño instruccional aplicable a onboarding y training de usuarios\n"
        
        return response
    
    # ===== PATRÓN 9: Transición a Tech =====
    if re.search(r'\b(transici[oó]n|cambio|por qu[eé] tech|tecnolog[ií]a)\b', question_lower):
        response = "**Mi transición hacia tecnología**\n\n"
        response += "Después de 20+ años combinando sostenibilidad, estrategia y gestión de proyectos, "
        response += "la transición a tech es la evolución natural de mi trayectoria:\n\n"
        response += "**Catalizadores:**\n"
        response += "• Implementación de sistemas ERP/CRM (Odoo) en Kernet\n"
        response += "• Necesidad de herramientas digitales para gestión de proyectos complejos\n"
        response += "• Interés personal en automatización y eficiencia de procesos\n\n"
        response += "**Formación actual:**\n"
        response += "• 42 École Urduliz - ZIP Program (metodología peer-to-peer, proyectos reales)\n"
        response += "• 5 certificaciones Salesforce (Administrator, Developer, AI)\n\n"
        response += "**Valor diferencial:**\n"
        response += "• Entiendo el negocio (no solo la tecnología)\n"
        response += "• Experiencia gestionando stakeholders diversos\n"
        response += "• Visión estratégica para alinear tech con objetivos organizacionales\n"
        response += "• Capacidad probada de aprendizaje rápido en nuevos dominios\n"
        
        return response
    
    # ===== PATRÓN 10: Habilidades Blandas/Soft Skills =====
    if re.search(r'\b(habilidad blanda|soft skill|competencia personal|liderazgo|comunicaci[oó]n|trabajo en equipo)\b', question_lower):
        soft_skills = profile_data['skills']['skills']['es']
        
        response = "**Habilidades blandas desarrolladas:**\n\n"
        for skill in soft_skills:
            response += f"• {skill}\n"
        
        response += "\n**Contexto de desarrollo:**\n"
        response += "• Liderazgo: Coordinación de equipos multidisciplinarios en proyectos USAID e INTEC\n"
        response += "• Comunicación: Docencia universitaria y facilitación de talleres técnicos\n"
        response += "• Adaptabilidad: Trabajo en 3 países diferentes (Venezuela, España, Nicaragua)\n"
        response += "• Pensamiento crítico: Investigación aplicada y análisis de sistemas complejos\n"
        response += "• Colaboración: Gestión de stakeholders en proyectos con sector público, privado y ONG\n"
        
        return response
    
    # ===== PATRÓN 11: Experiencia Detallada (empresa específica) =====
    # Buscar si mencionan alguna empresa específica
    for exp in profile_data['experience']:
        company_name = exp['company'].lower()
        if company_name.replace(' ', '') in question_lower.replace(' ', ''):
            response = f"**{exp['position']} en {exp['company']}**\n\n"
            response += f"📍 {exp['location']}\n"
            response += f"📅 {exp['period']}\n\n"
            response += "**Responsabilidades:**\n"
            for i, resp in enumerate(exp['responsibilities_es'], 1):
                response += f"{i}. {resp}\n"
            
            return response
    
    # ===== PATRÓN 12: Idiomas =====
    if re.search(r'\b(idioma|lenguaje|habla|ingl[eé]s|español)\b', question_lower):
        languages = profile_data['personal_info']['languages']
        
        response = "**Competencia lingüística:**\n\n"
        for lang in languages:
            response += f"• **{lang['language']}**: {lang['level']}\n"
        
        response += "\n**Aplicación profesional:**\n"
        response += "• Documentación técnica en inglés y español\n"
        response += "• Comunicación con equipos internacionales\n"
        response += "• Capacidad de trabajar en entornos multiculturales\n"
        
        return response
    
    # ===== PATRÓN 13: Ubicación/Disponibilidad =====
    if re.search(r'\b(ubicaci[oó]n|d[oó]nde|lugar|vives|residencia|barakaldo|euskadi|pa[ií]s vasco)\b', question_lower):
        location = profile_data['personal_info']['location']
        nationalities = profile_data['personal_info']['nationalities']
        
        response = f"**Ubicación:** {location}\n\n"
        response += f"**Nacionalidades:** {', '.join(nationalities)}\n\n"
        response += "**Disponibilidad:**\n"
        response += "• Trabajo remoto (experiencia previa en USAID/equipos distribuidos)\n"
        response += "• Híbrido en área metropolitana de Bilbao\n"
        response += "• Presencial en Bizkaia y alrededores\n"
        response += "• Movilidad dentro de la UE (doble nacionalidad)\n"
        
        return response
    
    # ===== PATRÓN 14: Contacto =====
    if re.search(r'\b(contacto|email|correo|linkedin|github|portfolio)\b', question_lower):
        personal = profile_data['personal_info']
        
        response = "**Información de contacto:**\n\n"
        response += f"📧 Email: {personal['email']}\n\n"
        response += "**Enlaces profesionales:**\n"
        for link in personal['links']:
            response += f"• {link['name']}: {link['url']}\n"
        
        response += "\n💡 También puedes descargar mi CV desde la sección correspondiente del portfolio."
        
        return response
    
    # ===== PATRÓN 15: Perfil General/Resumen =====
    if re.search(r'\b(qui[eé]n|perfil|resumen|sobre ti|presentaci[oó]n|background)\b', question_lower):
        # Detectar idioma de la pregunta
        is_english = re.search(r'\b(who|about|background|profile|summary)\b', question_lower)
        
        if is_english:
            return profile_data['summary']['en']
        else:
            return profile_data['summary']['es']
    
    # ===== RESPUESTA POR DEFECTO =====
    return (
        "No encontré información específica sobre esa pregunta. "
        "Puedes preguntar sobre:\n\n"
        "• Certificaciones Salesforce\n"
        "• Experiencia en CRM/Odoo\n"
        "• Habilidades técnicas y blandas\n"
        "• Experiencia ambiental o internacional\n"
        "• Educación y formación\n"
        "• Mi transición a tecnología\n"
        "• Ubicación y disponibilidad\n\n"
        "O navega por el portfolio para ver toda mi información."
    )
```

### Decisiones de Diseño del Agente

#### 1. **Sistema Dual (Ollama + Keywords)**

**Razonamiento**:
- **Ollama proporciona** respuestas naturales y contextuales, mejorando UX
- **Keywords garantizan** funcionamiento incluso sin Ollama instalado
- **Gradual degradation**: el sistema siempre funciona, con mejor o peor calidad

**Trade-offs**:
- Mantener dos sistemas requiere más código
- Keywords necesitan actualización manual al cambiar datos
- Respuestas de Ollama son menos predecibles

**¿Por qué vale la pena?**
- Portabilidad: el portfolio funciona en cualquier entorno
- Demostración técnica: muestra capacidad de arquitectura robusta
- Mejora continua: el fallback permite recoger datos sobre preguntas frecuentes para mejorar patrones

#### 2. **Contexto Completo en System Prompt**

**Implementación**:
```python
context = f"""
INFORMACIÓN PERSONAL:
{personal_info}

EXPERIENCIA:
{all_experiences}

CERTIFICACIONES:
{all_certifications}
...
"""
```

**Ventajas**:
- El modelo tiene acceso a todos los datos en cada pregunta
- No depende de "memoria" entre llamadas (stateless)
- Respuestas consistentes con información actualizada

**Desventajas**:
- Prompt largo (~3000-4000 tokens)
- Mayor latencia en cada llamada
- Costo computacional más alto

**Alternativa considerada pero rechazada**: RAG (Retrieval-Augmented Generation)
- Requeriría vector database (Pinecone, Chroma)
- Mayor complejidad de setup
- Overhead innecesario para un dataset pequeño (~5KB de JSON)

#### 3. **15+ Patrones de Keywords**

**Estrategia**: Cada patrón cubre un "caso de uso" específico de recruiter

Ejemplos:
```python
# Patrón técnico específico
r'\b(salesforce|crm salesforce)\b'

# Patrón de contexto amplio
r'\b(ambient|sostenibilidad|conservaci[oó]n)\b'

# Patrón de intención
r'\b(transici[oó]n|por qu[eé] tech)\b'
```

**Orden de evaluación**: De más específico a más general
1. Salesforce (muy específico)
2. CRM (específico)
3. Certificaciones (específico)
4. Experiencia ambiental (amplio)
5. Perfil general (muy amplio)
6. Default (catch-all)

**¿Por qué regex y no keyword simple?**
- Permite variaciones: "certificación" / "certificado" / "certificaciones"
- Maneja acentos: "transición" / "transicion"
- Word boundaries (`\b`) evitan falsos positivos

#### 4. **Respuestas Estructuradas con Valor Transferible**

Cada respuesta sobre experiencia no-tech incluye explícitamente el valor transferible:

```python
response += "\n**Valor transferible para tech:**\n"
response += "• Análisis de datos complejos...\n"
response += "• Gestión de proyectos técnicos...\n"
```

**Por qué es crítico**:
- Los recruiters tech no entienden automáticamente el valor de experiencia diversa
- Explicitar los puentes conceptuales facilita la comprensión
- Demuestra auto-awareness y capacidad de síntesis

---

## Integración de Ollama: IA Conversacional

### ¿Qué es Ollama?

Ollama es un **servidor local de modelos LLM** (Large Language Models) que permite ejecutar modelos de IA en tu propia máquina sin depender de APIs cloud como OpenAI o Claude.

**Ventajas**:
- Privacidad total (datos nunca salen de tu máquina)
- Sin costos por uso (solo computación local)
- Sin límites de rate
- Funciona offline

**Desventajas**:
- Requiere recursos computacionales (RAM, CPU/GPU)
- Modelos más pequeños que GPT-4 (menor capacidad)
- Setup inicial requerido

### Proceso de Integración

#### Paso 1: Instalación de Ollama

```bash
# Windows: Descargar desde ollama.com
# Instala como servicio de Windows

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

#### Paso 2: Descarga del Modelo

```bash
# Modelo elegido: llama3.2:3b
ollama pull llama3.2:3b
```

**¿Por qué llama3.2:3b?**
- **3b parámetros**: Balance entre calidad y velocidad
- **Requisitos**: ~2GB RAM, funciona en laptops estándar
- **Rendimiento**: Suficiente para Q&A contextual
- **Latencia**: Respuestas en 2-5 segundos

**Alternativas consideradas**:
- `llama3.2:1b`: Más rápido pero menos preciso
- `llama3:8b`: Mejor calidad pero requiere más recursos
- `mistral:7b`: Excelente pero más lento en CPU

#### Paso 3: Biblioteca Python

```bash
pip install ollama
```

#### Paso 4: Código de Integración

```python
import ollama

def answer_question_with_ollama(question, profile_data):
    # Construcción de contexto (ver sección anterior)
    context = build_context(profile_data)
    
    # System prompt con instrucciones
    system_prompt = """
    Eres un asistente profesional. Responde:
    1. En el idioma de la pregunta
    2. De forma concisa pero completa
    3. Destaca competencias transferibles
    """
    
    # Llamada al modelo
    response = ollama.chat(
        model='llama3.2:3b',
        messages=[
            {'role': 'system', 'content': system_prompt + "\n\n" + context},
            {'role': 'user', 'content': question}
        ],
        options={'timeout': 30}
    )
    
    return response['message']['content']
```

### Optimizaciones Implementadas

#### 1. **Timeout de 30 segundos**

```python
options={'timeout': 30}
```

**Razón**: Evitar que el usuario espere indefinidamente si el modelo se cuelga.

**Comportamiento**:
- Si responde en < 30s → respuesta de Ollama
- Si timeout → excepción → fallback a keywords

#### 2. **Variable de Entorno para Host**

```python
ollama_host = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
```

**Por qué es necesario**:
- En desarrollo local: `http://localhost:11434`
- En Docker: `http://ollama:11434` (nombre del servicio)
- En producción: podría ser un servidor remoto

**Configuración en Docker**:
```yaml
# docker-compose.yml
services:
  web:
    environment:
      - OLLAMA_HOST=http://ollama:11434
```

#### 3. **Try-Except con Fallback Silencioso**

```python
try:
    return ollama.chat(...)
except Exception as e:
    print(f"Error en Ollama: {str(e)}")
    return None  # Trigger fallback
```

**Ventajas**:
- El usuario nunca ve errores de Ollama
- El sistema degrada gracefully a keywords
- Los errores se loggean para debugging

### Mejora de Respuestas

#### Antes (Keywords):
```
Usuario: "¿Qué experiencia tienes en CRM?"

Respuesta:
Experiencia en CRM:

**Consultor Senior CRM/ERP en Kernet, S.L.** (sept 2023 - actualidad)

Responsabilidades clave:
• Implementación y configuración de Odoo ERP/CRM
• Análisis de requerimientos comerciales
• Capacitación de usuarios finales
• Soporte técnico post-implementación

Además, cuento con 5 certificaciones Salesforce...
```

#### Después (Ollama):
```
Usuario: "¿Qué experiencia tienes en CRM?"

Respuesta:
Tengo experiencia práctica en sistemas CRM tanto desde la implementación 
técnica como desde la gestión estratégica. En mi rol actual como Consultor 
Senior CRM/ERP en Kernet, trabajo directamente con Odoo implementando 
soluciones personalizadas, analizando procesos de negocio y capacitando 
equipos.

Además, complemento esta experiencia práctica con 5 certificaciones 
Salesforce que incluyen Salesforce Administrator, Platform App Builder y 
Service Cloud Consultant, lo que me proporciona una comprensión profunda 
tanto de la parte técnica como de las mejores prácticas en gestión de 
relaciones con clientes.

Lo que diferencia mi enfoque es que entiendo el CRM no solo como una 
herramienta técnica, sino como un ecosistema que debe alinearse con los 
objetivos estratégicos del negocio, algo que aprendí coordinando proyectos 
complejos en USAID e INTEC donde la gestión de stakeholders era crítica.
```

**Diferencias clave**:
- Ollama conecta conceptos entre experiencias diferentes
- Tono más natural y conversacional
- Explicita el valor diferencial sin que sea preguntado
- Respuesta adaptada al nivel de detalle de la pregunta

---

## Containerización con Docker

### Motivación

**Problema**: "Este proyecto solo funciona en mi máquina"

**Síntomas**:
- Recruiters no pueden ejecutar el portfolio
- Despliegue a producción requiere horas de configuración
- Diferencias entre Windows/Mac/Linux causan bugs

**Solución**: Docker proporciona un entorno consistente e independiente del SO.

### Arquitectura Docker

#### Componente 1: Dockerfile (Imagen de la Aplicación)

```dockerfile
# Base: Python 3.11 slim (menos peso que full)
FROM python:3.11-slim

# Directorio de trabajo
WORKDIR /app

# Copiar solo requirements primero (layer caching)
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Variable de entorno para Ollama
ENV OLLAMA_HOST=http://ollama:11434
ENV PYTHONUNBUFFERED=1

# Exponer puerto
EXPOSE 8000

# Comando para iniciar
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Decisiones clave**:

1. **python:3.11-slim**: 
   - Tamaño: ~120MB vs ~900MB de python:3.11
   - Incluye solo lo esencial para ejecutar Python
   - Suficiente para FastAPI

2. **Layer caching con requirements**:
   ```dockerfile
   COPY requirements.txt .
   RUN pip install ...
   # Luego copiar el resto
   COPY . .
   ```
   - Si cambio código pero no requirements, no re-instala dependencias
   - Rebuilds mucho más rápidos

3. **ENV PYTHONUNBUFFERED=1**:
   - Fuerza salida inmediata de prints/logs
   - Esencial para ver logs en tiempo real con `docker-compose logs`

4. **--host 0.0.0.0**:
   - Permite conexiones desde fuera del container
   - `localhost` solo acepta conexiones internas

#### Componente 2: docker-compose.yml (Orquestación)

```yaml
version: '3.8'

services:
  # Servicio 1: Web (FastAPI)
  web:
    build: .
    container_name: mirel-portfolio
    ports:
      - "8000:8000"
    volumes:
      - .:/app           # Code mounting
      - /app/.venv       # Excluir venv (usar deps del container)
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - PYTHONUNBUFFERED=1
    depends_on:
      - ollama
    restart: unless-stopped
    networks:
      - portfolio-network

  # Servicio 2: Ollama (IA)
  ollama:
    image: ollama/ollama:latest
    container_name: mirel-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama  # Persistencia de modelos
    restart: unless-stopped
    networks:
      - portfolio-network

networks:
  portfolio-network:
    driver: bridge

volumes:
  ollama-data:
```

**Explicación detallada**:

##### Servicio `web`:

```yaml
volumes:
  - .:/app        # Monta el directorio actual en /app del container
  - /app/.venv    # Excluye .venv local (usa deps instaladas en container)
```

**¿Por qué este setup de volúmenes?**

- `.:/app` → Cualquier cambio en código se refleja inmediatamente (hot reload)
- `/app/.venv` → Evita conflictos entre dependencias de host y container
- Resultado: Edito en VSCode → Uvicorn detecta cambio → Recarga automática

##### Servicio `ollama`:

```yaml
volumes:
  - ollama-data:/root/.ollama
```

**¿Por qué volume nombrado?**

- Los modelos pesan ~2GB
- Sin volumen, se perdería al eliminar container
- Con volume: descarga una vez, persiste

##### Networking:

```yaml
networks:
  portfolio-network:
    driver: bridge
```

**¿Qué hace?**:
- Crea red privada entre containers
- `web` puede acceder a `ollama` por nombre: `http://ollama:11434`
- Docker maneja resolución DNS interna

##### depends_on:

```yaml
web:
  depends_on:
    - ollama
```

**Efecto**:
- Docker arranca `ollama` antes que `web`
- No garantiza que Ollama *esté listo*, solo que el container *inició*
- Por eso `web` tiene fallback si Ollama no responde

#### Componente 3: .dockerignore

```
__pycache__/
*.pyc
*.pyo
.venv/
.vscode/
.idea/
.git/
Dockerfile
docker-compose.yml
*.md
!README.md
*.log
.DS_Store
Thumbs.db
```

**Por qué es importante**:
- Reduce tamaño de imagen (no copia archivos innecesarios)
- Evita copiar `.venv` local al container
- Acelera builds (menos archivos = menos to copy)

### Flujo de Trabajo con Docker

#### Desarrollo Local

```bash
# 1. Construir e iniciar servicios
docker-compose up -d

# 2. Ver logs en tiempo real
docker-compose logs -f web

# 3. Descargar modelo de Ollama (primera vez)
docker-compose exec ollama ollama pull llama3.2:3b

# 4. Hacer cambios en código
# (Auto-reload detecta y recarga)

# 5. Ver estado de containers
docker-compose ps

# 6. Detener todo
docker-compose down
```

#### Troubleshooting

```bash
# Ver logs de servicio específico
docker-compose logs -f ollama

# Acceder a shell de container
docker-compose exec web bash

# Reiniciar un servicio
docker-compose restart web

# Rebuild completo (tras cambiar Dockerfile o requirements)
docker-compose build --no-cache
docker-compose up -d
```

#### Limpieza

```bash
# Detener y eliminar containers
docker-compose down

# + Eliminar volúmenes (modelos de Ollama)
docker-compose down -v

# Eliminar imágenes
docker rmi mirel-portfolio-web ollama/ollama:latest
```

### Scripts Helper

Para simplificar comandos, creamos scripts multiplataforma:

#### docker-helper.bat (Windows)

```batch
@echo off

if "%1"=="start" (
    docker-compose up -d
    echo Portfolio disponible en http://localhost:8000
)

if "%1"=="stop" (
    docker-compose down
)

if "%1"=="logs" (
    docker-compose logs -f %2
)

if "%1"=="setup-ollama" (
    docker-compose exec ollama ollama pull llama3.2:3b
)
```

#### docker-helper.sh (Linux/Mac)

```bash
#!/bin/bash

case "$1" in
    start)
        docker-compose up -d
        echo "Portfolio disponible en http://localhost:8000"
        ;;
    stop)
        docker-compose down
        ;;
    logs)
        docker-compose logs -f $2
        ;;
    setup-ollama)
        docker-compose exec ollama ollama pull llama3.2:3b
        ;;
esac
```

**Uso simplificado**:
```bash
# Windows
.\docker-helper.bat start
.\docker-helper.bat setup-ollama
.\docker-helper.bat logs web

# Linux/Mac
chmod +x docker-helper.sh
./docker-helper.sh start
./docker-helper.sh setup-ollama
./docker-helper.sh logs web
```

### Ventajas de la Implementación Docker

1. **Portabilidad Total**:
   - Un recruiter puede ejecutar: `docker-compose up -d`
   - Funciona igual en Windows, Mac, Linux

2. **Aislamiento**:
   - No contamina Python global del sistema
   - No hay conflictos con otros proyectos

3. **Reproducibilidad**:
   - Mismo entorno en dev, staging, producción
   - Elimina "funciona en mi máquina"

4. **Escalabilidad**:
   - Fácil añadir más servicios (PostgreSQL, Redis)
   - Base para Kubernetes si se necesita

5. **Documentación Viva**:
   - `docker-compose.yml` documenta arquitectura
   - `Dockerfile` documenta setup exacto

---

## Estructura de Datos

### Archivo Central: data/mirel_profile.json

Este JSON es la **única fuente de verdad** para todos los datos del portfolio.

```json
{
  "personal_info": {
    "full_name": "Mirel Marsoli Volcán Calderón",
    "email": "mirel.volcan@gmail.com",
    "location": "Barakaldo, Euskadi, España",
    "nationalities": ["Venezolana", "Española"],
    "languages": [
      {"language": "Español", "level": "Nativo"},
      {"language": "Inglés", "level": "Avanzado (C1)"}
    ],
    "links": [
      {"name": "LinkedIn", "url": "https://linkedin.com/in/mirelvolcan"},
      {"name": "GitHub", "url": "https://github.com/MirelSIG"},
      {"name": "Portfolio", "url": "https://mirelportfolio.com"}
    ]
  },
  
  "summary": {
    "es": "Profesional con 20+ años combinando tecnología...",
    "en": "Professional with 20+ years combining technology..."
  },
  
  "skills": {
    "technical": {
      "es": [
        "Python (FastAPI, Pydantic)",
        "JavaScript (ES6+, DOM manipulation)",
        "Salesforce (Administration, Development, Service Cloud)",
        "Odoo ERP/CRM",
        "Git & GitHub",
        "Docker & Docker Compose",
        "APIs RESTful",
        "MongoDB",
        "HTML5 & CSS3"
      ],
      "en": [...]
    },
    "skills": {
      "es": [
        "Liderazgo de equipos multidisciplinarios",
        "Comunicación técnica y no técnica",
        "Gestión de proyectos complejos",
        "Pensamiento analítico y sistémico",
        "Adaptabilidad a nuevos entornos",
        "Resolución de problemas creativos",
        "Trabajo remoto y colaborativo"
      ],
      "en": [...]
    }
  },
  
  "experience": [
    {
      "company": "Kernet, S.L.",
      "position": "Consultor Senior CRM/ERP",
      "period": "sept 2023 - actualidad",
      "location": "Híbrido, Bizkaia, España",
      "responsibilities_es": [
        "Implementación y configuración de Odoo ERP/CRM",
        "Análisis de requerimientos y diseño de soluciones",
        "Capacitación de usuarios finales",
        "Soporte técnico y mantenimiento post-implementación"
      ],
      "responsibilities_en": [...]
    },
    {
      "company": "USAID / USFS",
      "position": "Coordinadora de Seguimiento y Evaluación",
      "period": "oct 2019 - sept 2021",
      "location": "Managua, Nicaragua",
      "responsibilities_es": [
        "Diseño e implementación de sistemas de monitoreo de proyectos de conservación",
        "Coordinación de equipos técnicos multidisciplinarios",
        "Elaboración de informes técnicos para donantes internacionales",
        "Gestión de bases de datos y análisis cuantitativo/cualitativo"
      ],
      "responsibilities_en": [...]
    }
    // ... más experiencias
  ],
  
  "education": [
    {
      "degree": "ZIP Program - Software Development",
      "institution": "42 École Urduliz",
      "period": "2024 - 2026",
      "location": "Urduliz, Euskadi, España"
    }
  ],
  
  "certifications": [
    {
      "name": "Salesforce Certified Associate",
      "date": "nov 2024",
      "credential_id": "24-37186"
    },
    {
      "name": "Salesforce Certified Administrator",
      "date": "dic 2024",
      "credential_id": "24-48532"
    },
    {
      "name": "Salesforce Certified Platform App Builder",
      "date": "dic 2024",
      "credential_id": "24-51082"
    },
    {
      "name": "Salesforce Certified Service Cloud Consultant",
      "date": "ene 2025",
      "credential_id": "25-03043"
    },
    {
      "name": "Salesforce Certified AI Associate",
      "date": "ene 2025",
      "credential_id": "25-03971"
    }
  ],
  
  "publications": [
    {
      "title": "Análisis de la diversidad funcional de plantas...",
      "year": "2019",
      "description_es": "Investigación sobre restauración ecológica...",
      "description_en": "Research on ecological restoration..."
    }
  ],
  
  "meta": {
    "last_updated": "2025-01-15",
    "version": "2.0"
  }
}
```

### Modelo Pydantic: api/models/profile_model.py

```python
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional

class Language(BaseModel):
    language: str
    level: str

class Link(BaseModel):
    name: str
    url: str

class PersonalInfo(BaseModel):
    full_name: str
    email: EmailStr
    location: str
    nationalities: List[str]
    languages: List[Language]
    links: List[Link]

class Summary(BaseModel):
    es: str
    en: str

class SkillsCategory(BaseModel):
    es: List[str]
    en: List[str]

class Skills(BaseModel):
    technical: SkillsCategory
    skills: SkillsCategory  # Soft skills

class Experience(BaseModel):
    company: str
    position: str
    period: str
    location: str
    responsibilities_es: List[str]
    responsibilities_en: List[str]

class Education(BaseModel):
    degree: str
    institution: str
    period: str
    location: str

class Certification(BaseModel):
    name: str
    date: str
    credential_id: str

class Publication(BaseModel):
    title: str
    year: str
    description_es: str
    description_en: str

class Meta(BaseModel):
    last_updated: str
    version: str

class Profile(BaseModel):
    personal_info: PersonalInfo
    summary: Summary
    skills: Skills
    experience: List[Experience]
    education: List[Education]
    certifications: Optional[List[Certification]] = None
    publications: Optional[List[Publication]] = None
    meta: Optional[Meta] = None
```

**Ventajas de Pydantic**:

1. **Validación Automática**:
   ```python
   # Si el JSON tiene email inválido:
   {"email": "not-an-email"}
   # Pydantic lanza: ValidationError: value is not a valid email
   ```

2. **Documentación Auto-generada**:
   - FastAPI usa modelos Pydantic para generar OpenAPI spec
   - `/docs` muestra esquemas automáticamente

3. **Type Hints**:
   ```python
   def process_profile(profile: Profile):
       # IDE autocompleta profile.personal_info.email
       # Type checker verifica tipos
   ```

4. **Conversión de Tipos**:
   ```python
   # JSON tiene string, modelo esperaba int
   {"age": "30"}  # Pydantic convierte a int(30)
   ```

### Decisión: ¿Por qué JSON en lugar de MongoDB?

**Evaluación inicial**: El proyecto soporta MongoDB Atlas (ver `db_atlas.py`)

**Decisión final**: Usar JSON local para desarrollo y Docker

**Pros de JSON**:
- ✅ Zero setup (no requiere MongoDB instalado)
- ✅ Fácil de editar manualmente
- ✅ Control de versiones con Git
- ✅ Portabilidad total (funciona en cualquier máquina)
- ✅ Sin costos de cloud

**Contras de JSON**:
- ❌ No escala con múltiples usuarios
- ❌ No hay queries complejas
- ❌ Sin índices para búsqueda rápida
- ❌ Lectura de archivo completo cada vez

**¿Cuándo usar MongoDB?**:
- Portfolio con sistema de autenticación
- Múltiples portfolios en una misma instancia
- Analytics de preguntas frecuentes
- Rate limiting basado en IP
- HistHistorial de conversaciones chat

**Configuración actual**:
```python
# api/db_local.py (activo)
def load_profile_data():
    with open('data/mirel_profile.json', 'r', encoding='utf-8') as f:
        return json.load(f)

# api/db_atlas.py (disponible para futuro)
def get_profile_from_mongo():
    client = MongoClient(MONGODB_URI)
    db = client['portfolio']
    collection = db['profiles']
    return collection.find_one({'user_id': 'mirel'})
```

---

## Frontend: Interactividad y UX

### Arquitectura Frontend

```
templates/
├── portfolio.html       (Español)
└── portfolio_EN.html    (English)

static/
├── css/
│   └── portfolio.css    (Estilos globales)
├── js/
│   ├── portfolio.js     (Español)
│   └── portfolio_EN.js  (English)
└── img/
    └── (imágenes del portfolio)
```

### Sistema de Modales

Todos los datos del sidebar se muestran en modales dinámicos.

#### HTML Base (portfolio.html)

```html
<!-- Modal Container (oculto por defecto) -->
<div id="modal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <div id="modal-body"></div>
    </div>
</div>

<!-- Sidebar con data-endpoints -->
<aside id="sidebar">
    <ul>
        <li><a href="#" data-endpoint="profile">Perfil</a></li>
        <li><a href="#" data-endpoint="skills">Habilidades</a></li>
        <li><a href="#" data-endpoint="experience">Experiencia</a></li>
        <li><a href="#" data-endpoint="education">Educación</a></li>
        <li><a href="#" data-endpoint="publications">Publicaciones</a></li>
        <li><a href="#proyectos">Proyectos</a></li>
    </ul>
</aside>
```

#### JavaScript: Funciones Modal (portfolio.js)

```javascript
// Global modal elements
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// Event listener para cerrar modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Setup de data-endpoints
document.querySelectorAll('[data-endpoint]').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const endpoint = link.getAttribute('data-endpoint');
        
        try {
            const response = await fetch(`/api/${endpoint}`);
            if (!response.ok) throw new Error('Error fetching data');
            
            const data = await response.json();
            
            // Renderizar según tipo de endpoint
            switch(endpoint) {
                case 'profile':
                    renderProfile(data);
                    break;
                case 'skills':
                    renderSkills(data);
                    break;
                case 'experience':
                    renderExperience(data);
                    break;
                case 'education':
                    renderEducation(data);
                    break;
                case 'publications':
                    renderPublications(data);
                    break;
            }
            
            // Mostrar modal
            modal.style.display = 'flex';
            
        } catch (error) {
            console.error(`Error cargando ${endpoint}:`, error);
            modalBody.innerHTML = `<p>Error al cargar ${endpoint}</p>`;
            modal.style.display = 'flex';
        }
    });
});
```

#### Funciones de Renderizado

##### 1. Perfil

```javascript
function renderProfile(data) {
    const personalInfo = data.personal_info;
    
    let html = `
        <h2>Perfil Profesional</h2>
        <div class="profile-section">
            <h3>${personalInfo.full_name}</h3>
            <p><strong>Email:</strong> ${personalInfo.email}</p>
            <p><strong>Ubicación:</strong> ${personalInfo.location}</p>
            <p><strong>Nacionalidades:</strong> ${personalInfo.nationalities.join(', ')}</p>
            
            <h4>Idiomas</h4>
            <ul>
    `;
    
    personalInfo.languages.forEach(lang => {
        html += `<li>${lang.language}: ${lang.level}</li>`;
    });
    
    html += `
            </ul>
            <h4>Enlaces</h4>
            <ul>
    `;
    
    personalInfo.links.forEach(link => {
        html += `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    modalBody.innerHTML = html;
}
```

##### 2. Habilidades (con Técnicas y Blandas)

```javascript
function renderSkills(data) {
    const technical = data.technical.es;
    const soft = data.skills.es;  // ⚠️ Nota: data.skills, no data.soft
    
    let html = `
        <h2>Habilidades</h2>
        
        <div class="skills-section">
            <h3>Habilidades Técnicas</h3>
            <ul class="skills-list">
    `;
    
    technical.forEach(skill => {
        html += `<li>${skill}</li>`;
    });
    
    html += `
            </ul>
        </div>
        
        <div class="skills-section">
            <h3>Habilidades Blandas</h3>
            <ul class="skills-list">
    `;
    
    soft.forEach(skill => {
        html += `<li>${skill}</li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    modalBody.innerHTML = html;
}
```

##### 3. Experiencia (con detalles completos)

```javascript
function renderExperience(data) {
    let html = '<h2>Experiencia Profesional</h2>';
    
    data.forEach(exp => {
        html += `
            <div class="experience-item">
                <h3>${exp.position}</h3>
                <p class="company">${exp.company}</p>
                <p class="period">${exp.period} • ${exp.location}</p>
                
                <h4>Responsabilidades:</h4>
                <ul>
        `;
        
        exp.responsibilities_es.forEach(resp => {
            html += `<li>${resp}</li>`;
        });
        
        html += `
                </ul>
            </div>
            <hr>
        `;
    });
    
    modalBody.innerHTML = html;
}
```

### Sistema de Chat

#### HTML del Chat

```html
<!-- Chat Launcher (botón flotante) -->
<button id="chat-launcher" class="chat-launcher">
    💬
</button>

<!-- Chat Window (oculta por defecto) -->
<div id="chat-window" class="chat-window" style="display: none;">
    <div class="chat-header">
        <h3>Pregúntame</h3>
        <button id="chat-close">✖</button>
    </div>
    
    <div id="chat-messages" class="chat-messages">
        <div class="message bot">
            ¡Hola! Soy el asistente de Mirel. Pregúntame sobre experiencia, 
            certificaciones, habilidades o cualquier otra cosa del portfolio.
        </div>
    </div>
    
    <div class="chat-input-container">
        <input type="text" id="chat-input" placeholder="Escribe tu pregunta...">
        <button id="chat-send">Enviar</button>
    </div>
</div>
```

#### JavaScript del Chat

```javascript
// Chat setup
document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.getElementById('chat-launcher');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    // Abrir chat
    chatLauncher.addEventListener('click', () => {
        chatWindow.style.display = 'flex';
        chatInput.focus();
    });
    
    // Cerrar chat
    chatClose.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });
    
    // Enviar mensaje
    chatSend.addEventListener('click', sendMessage);
    
    // Enter para enviar
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});

async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const question = chatInput.value.trim();
    
    if (!question) return;
    
    // Mostrar pregunta del usuario
    appendMessage('user', question);
    chatInput.value = '';
    
    // Mostrar indicador de "escribiendo..."
    const typingIndicator = appendMessage('bot', '• • •');
    typingIndicator.classList.add('typing');
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });
        
        if (!response.ok) throw new Error('Error en la respuesta');
        
        const data = await response.json();
        
        // Remover indicador y mostrar respuesta
        typingIndicator.remove();
        appendMessage('bot', data.answer);
        
    } catch (error) {
        typingIndicator.remove();
        appendMessage('bot', 'Lo siento, hubo un error procesando tu pregunta.');
        console.error('Error:', error);
    }
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}
```

### CSS: Diseño Responsive

```css
/* Modal */
.modal {
    display: none; /* Oculto por defecto */
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.close {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 28px;
    cursor: pointer;
}

/* Chat Window */
.chat-window {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    z-index: 999;
}

.chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-messages {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message {
    padding: 10px 15px;
    border-radius: 15px;
    max-width: 80%;
    word-wrap: break-word;
}

.message.user {
    background: #667eea;
    color: white;
    align-self: flex-end;
    margin-left: auto;
}

.message.bot {
    background: #f0f0f0;
    color: #333;
    align-self: flex-start;
}

.message.typing {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Chat Input */
.chat-input-container {
    display: flex;
    padding: 15px;
    border-top: 1px solid #ddd;
}

#chat-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
}

#chat-send {
    margin-left: 10px;
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.3s;
}

#chat-send:hover {
    background: #764ba2;
}

/* Responsive */
@media (max-width: 768px) {
    .chat-window {
        width: calc(100% - 40px);
        height: 70vh;
        bottom: 10px;
        right: 20px;
    }
    
    .modal-content {
        width: 95%;
        padding: 20px;
    }
}
```

---

## Problemas Técnicos y Soluciones

### Problema 1: Virtual Environment no Activado

**Síntoma**: `pip install` instalaba dependencias en Python global

**Diagnóstico**:
```powershell
# Verificar Python en uso
Get-Command python

# Si devuelve C:\Python\python.exe en lugar de .venv\Scripts\python.exe
# El venv NO está activado
```

**Solución**:
```powershell
# PowerShell (Windows)
.venv\Scripts\Activate.ps1

# Verificar activación (debe mostrar (.venv) en prompt)
(.venv) PS C:\Users\Mirel\Mirel-portfolio>
```

**Prevención**: Añadir al VSCode settings.json:
```json
{
    "python.terminal.activateEnvironment": true,
    "python.defaultInterpreterPath": ".venv/Scripts/python.exe"
}
```

---

### Problema 2: Data Validation Error

**Error completo**:
```
pydantic.error_wrappers.ValidationError: 1 validation error for Profile
personal_info
  field required (type=value_error.missing)
```

**Causa**: Mismatch entre estructura JSON y modelo Pydantic

**JSON tenía**:
```json
{
  "profile": { ... }
}
```

**Modelo esperaba**:
```python
class Profile(BaseModel):
    personal_info: PersonalInfo
```

**Solución**: Renombrar `"profile"` a `"personal_info"` en JSON

**Lección**: Mantener sincronización estricta entre:
- JSON keys
- Pydantic field names
- Frontend property access

---

### Problema 3: SyntaxError en JavaScript

**Error**:
```
Uncaught SyntaxError: Unexpected token 'else'
```

**Ubicación**: portfolio.js líneas 430-435

**Código problemático**:
```javascript
try {
    // ... código
} catch (error) {
    console.error('Error:', error);
    content.innerHTML = '<p>Error</p>';
}
// ❌ Código duplicado
} else {  // <- SyntaxError: else sin if previo
    console.error('Error:', error);
    content.innerHTML = '<p>Error</p>';
}
```

**Causa**: Copy-paste error creó bloque duplicado

**Solución**: Eliminar completamente líneas 430-435

**Debugging technique**:
```javascript
// Para encontrar estos errores:
// 1. Abrir DevTools (F12)
// 2. Pestaña Console
// 3. Click en el error -> lleva a la línea exacta
```

---

### Problema 4: Sidebar y Chat No Responden

**Síntoma**: Clicks en hamburger o botón chat no hacen nada

**Diagnóstico**:
```javascript
console.log(document.getElementById('menu-toggle')); // null
```

**Causa**: Event listeners añadidos antes de que DOM estuviera listo

**Código incorrecto**:
```javascript
// ❌ Se ejecuta inmediatamente
const menuToggle = document.getElementById('menu-toggle');
menuToggle.addEventListener('click', ...); // menuToggle es null
```

**Solución**: Envolver en DOMContentLoaded:
```javascript
// ✅ Se ejecuta después de que DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {  // ← Verificar existencia
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
});
```

**Debugging**:
```javascript
// Añadir logs para verificar timing
console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    const element = document.getElementById('menu-toggle');
    console.log('Element found:', element);
});
```

---

### Problema 5: Soft Skills No Se Muestran

**Síntoma**: Modal de habilidades solo muestra técnicas

**Código incorrecto**:
```javascript
if (data.soft && data.soft.es) {
    data.soft.es.forEach(...);
}
```

**Estructura JSON real**:
```json
{
  "skills": {
    "technical": {...},
    "skills": {   // ← Aquí están las soft skills
      "es": [...],
      "en": [...]
    }
  }
}
```

**Solución**:
```javascript
if (data.skills && data.skills.es) {
    data.skills.es.forEach(...);
}
```

**Debugging technique**:
```javascript
// Inspeccionar estructura de data
console.log('Data structure:', JSON.stringify(data, null, 2));
console.log('Keys:', Object.keys(data));
```

---

### Problema 6: Ollama Timeout en Producción

**Síntoma**: Respuestas del agente tardan mucho o timeout

**Causa**: Modelo `llama3:8b` demasiado grande para hardware

**Diagnóstico**:
```python
import time
start = time.time()
response = ollama.chat(model='llama3:8b', messages=[...])
print(f"Tiempo: {time.time() - start}s")  # > 30s
```

**Solución**: Cambiar a modelo más ligero
```python
# ❌ Pesado (8 billion parameters)
model='llama3:8b'

# ✅ Ligero (3 billion parameters)
model='llama3.2:3b'
```

**Trade-off**:
- 8b: Mejor calidad, más lento (~10-15s)
- 3b: Buena calidad, rápido (~2-5s)

**Para producción**: Añadir timeout explícito
```python
options={'timeout': 30}  # Abort después de 30s
```

---

### Problema 7: Docker Volume Permissions (Linux)

**Síntoma**: Container no puede escribir en volúmenes montados

**Error**:
```
PermissionError: [Errno 13] Permission denied: '/app/.venv'
```

**Causa**: Usuario del container (generalmente root) difiere del usuario host

**Solución 1**: Excluir venv del volume mount
```yaml
volumes:
  - .:/app
  - /app/.venv  # ← Excluir (usar venv del container)
```

**Solución 2**: Añadir user ID en docker-compose
```yaml
user: "${UID}:${GID}"
```

**Solución 3**: Cambiar permisos en Dockerfile
```dockerfile
RUN adduser --disabled-password  --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser
```

---

## Decisiones de Diseño Clave

### 1. Bilingüe (ES/EN) pero No Multiidioma Avanzado

**Decisión**: Dos archivos separados (portfolio.html, portfolio_EN.html)

**Alternativas consideradas**:
- i18n library (react-i18n, vue-i18n)
- Backend language switching
- Browser localStorage para idioma preferido

**Por qué la decisión actual**:
- ✅ Simplicidad: No requiere estado ni cookies
- ✅ SEO: Dos URLs distintas indexables
- ✅ Performance: No overhead de traducción runtime
- ✅ Mantenibilidad: Fácil encontrar strings para editar

**Contras aceptados**:
- ❌ Duplicación de código HTML
- ❌ Sin cambio dinámico de idioma (requiere reload)

---

### 2. Vanilla JavaScript (Sin Frameworks)

**Decisión**: No usar React, Vue, Angular

**Razonamiento**:
1. **Demostración de Fundamentos**: Muestra conocimiento de DOM, eventos, async
2. **Performance**: Carga instantánea, sin bundle de 200KB+
3. **Complejidad Apropiada**: Portfolio estático no requiere state management
4. **Portabilidad**: Funciona en cualquier navegador sin build step

**Cuándo sería apropiado un framework**:
- Múltiples vistas con routing complejo
- Estado compartido entre muchos componentes
- Formularios extensos con validación
- Actualizaciones en tiempo real

---

### 3. MongoDB Opcional (No Obligatorio)

**Decisión**: Soportar MongoDB pero defaultear a JSON

**Razonamiento**:
- La mayoría de users no tienen MongoDB instalado
- Un portfolio personal no requiere DB
- JSON facilita versionado con Git

**Implementación**:
```python
# api/main.py
if USE_MONGODB:
    from api.db_atlas import get_profile_data
else:
    from api.db_local import load_profile_data
```

---

### 4. Ollama con Fallback (No API Cloud)

**Decisión**: Ollama local + fallback a keywords (no OpenAI/Claude)

**Pros**:
- ✅ Zero costos operativos
- ✅ Privacidad total
- ✅ Funciona offline
- ✅ Sin límites de API

**Cons**:
- ❌ Requiere instalación adicional
- ❌ Calidad inferior a GPT-4
- ❌ Requiere recursos computacionales

**Por qué es correcta**:
- Para un portfolio personal, privacidad > calidad máxima
- La estrategia de fallback garantiza funcionamiento
- Demuestra capacidad de arquitectura resiliente

---

### 5. Docker-First Development

**Decisión**: Docker como método primario de ejecución

**Tradicional**:
```
1. Instalar Python
2. Crear venv
3. Instalar dependencias
4. Instalar Ollama
5. Configurar puertos
6. Ejecutar
```

**Docker-First**:
```
1. docker-compose up -d
```

**Trade-offs**:
- Setup inicial: +10 minutos (descargar imágenes)
- Ejecución posterior: Instantánea
- Debugging: Más complejo (logs en container)
- Portabilidad: Máxima

---

## Guía de Mantenimiento y Extensión

### Añadir Nueva Certificación

**Archivo**: `data/mirel_profile.json`

```json
{
  "certifications": [
    // ... certificaciones existentes
    {
      "name": "Nueva Certificación",
      "date": "mar 2026",
      "credential_id": "XXXX-XXXXX"
    }
  ]
}
```

**Resultado**:
- Auto-aparece en endpoint `/api/certifications`
- El agente lo detecta automáticamente en preguntas sobre certificaciones
- Modal de certificaciones lo muestra

---

### Añadir Nueva Pregunta al Agente

**Archivo**: `api/services/qa_service.py`

```python
# Añadir nuevo patrón en función answer_question()

# ===== PATRÓN NUEVO: Testing/QA =====
if re.search(r'\b(testing|qa|quality assurance|pytest|unittest)\b', question_lower):
    response = "Experiencia en testing:\n\n"
    response += "• Implementación de tests unitarios con pytest\n"
    response += "• Tests de integración para APIs REST\n"
    response += "• TDD en proyectos de 42 École\n"
    
    return response
```

**Ollama automáticamente** detectará el nuevo contexto si se añade información relevante al JSON.

---

### Añadir Nuevo Endpoint API

**Archivo**: `api/main.py`

```python
@app.get("/api/projects")
async def get_projects():
    """Endpoint para proyectos"""
    profile_data = load_profile_data()
    return profile_data.get('projects', [])
```

**Frontend**: `static/js/portfolio.js`

```javascript
// Añadir caso en switch
case 'projects':
    renderProjects(data);
    break;

// Crear función de renderizado
function renderProjects(data) {
    let html = '<h2>Proyectos</h2>';
    data.forEach(project => {
        html += `
            <div class="project">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <a href="${project.url}">Ver proyecto</a>
            </div>
        `;
    });
    modalBody.innerHTML = html;
}
```

**JSON**: `data/mirel_profile.json`

```json
{
  "projects": [
    {
      "name": "Portfolio Interactivo",
      "description": "FastAPI + Ollama + Docker",
      "url": "https://github.com/MirelSIG/Mirel-portfolio"
    }
  ]
}
```

---

### Migrar a MongoDB

**1. Setup MongoDB Atlas**:
- Crear cuenta en mongodb.com/atlas
- Crear cluster free tier
- Obtener connection string

**2. Configurar**: `.env`

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
USE_MONGODB=true
```

**3. Modificar**: `api/main.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

USE_MONGODB = os.getenv('USE_MONGODB', 'false').lower() == 'true'

if USE_MONGODB:
    from api.db_atlas import get_profile_data
else:
    from api.db_local import load_profile_data
```

**4. Insertar datos**: Usar script `insert_profile.py`

```bash
python insert_profile.py
```

---

### Desplegar a Producción

#### Opción 1: Railway (Recomendado para inicio)

```bash
# 1. Instalar Railway CLI
npm install -g railway

# 2. Login
railway login

# 3. Inicializar proyecto
railway init

# 4. Añadir servicio Ollama no está disponible en Railway
# Usar strategy: Keyword-only en producción

# 5. Deploy
railway up
```

#### Opción 2: AWS EC2

```bash
# 1. Crear instancia EC2 (t3.medium mínimo para Ollama)
# 2. Instalar Docker
sudo yum install docker
sudo service docker start

# 3. Clonar repo
git clone https://github.com/MirelSIG/Mirel-portfolio
cd Mirel-portfolio

# 4. Ejecutar
docker-compose up -d

# 5. Configurar nginx como reverse proxy
# /etc/nginx/conf.d/portfolio.conf
server {
    listen 80;
    server_name tudominio.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

#### Opción 3: DigitalOcean App Platform

```yaml
# .do/app.yaml
name: mirel-portfolio
services:
- name: web
  github:
    repo: MirelSIG/Mirel-portfolio
    branch: main
  build_command: pip install -r requirements.txt
  run_command: uvicorn api.main:app --host 0.0.0.0 --port 8000
  envs:
  - key: USE_MONGODB
    value: "false"
```

---

### Añadir Analytics

**Opción Simple**: Google Analytics

```html
<!-- templates/portfolio.html, antes de </head> -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Opción Avanzada**: Custom analytics para chat

```python
# api/main.py
from datetime import datetime
import json

@app.post("/api/chat")
async def chat(request: ChatRequest):
    question = request.question
    
    # Log pregunta
    log_chat_interaction(question)
    
    # ... resto del código

def log_chat_interaction(question: str):
    timestamp = datetime.now().isoformat()
    with open('logs/chat_history.jsonl', 'a') as f:
        f.write(json.dumps({
            'timestamp': timestamp,
            'question': question
        }) + '\n')
```

Análisis posterior:
```python
# scripts/analyze_questions.py
import json
from collections import Counter

questions = []
with open('logs/chat_history.jsonl') as f:
    for line in f:
        data = json.parse(line)
        questions.append(data['question'])

# Preguntas más comunes
common = Counter(questions).most_common(10)
print("Top 10 preguntas:")
for q, count in common:
    print(f"{count}x: {q}")
```

---

## Conclusión

Este portfolio no es solo una presentación de información, sino una **demostración técnica viva** de capacidades en:

1. **Backend Development**: FastAPI, APIs RESTful, validación de datos
2. **Frontend Development**: JavaScript moderno, DOM manipulation, async/await
3. **AI Integration**: Ollama, prompt engineering, fallback strategies
4. **DevOps**: Docker, docker-compose, multi-service orchestration
5. **Architecture**: Separation of concerns, modular design, error handling
6. **Documentation**: Este documento y todos los .md asociados

El proyecto está diseñado para ser:
- **Portable**: Funciona en cualquier OS con Docker
- **Maintainable**: Código limpio, comentado, estructurado
- **Extensible**: Fácil añadir features sin reescribir
- **Resilient**: Fallbacks garantizan funcionamiento siempre
- **Professional**: Nivel de calidad enterprise

---

**Última actualización**: 8 de marzo de 2026
**Versión**: 2.0
**Autor**: Mirel Marsoli Volcán Calderón
**Repositorio**: [github.com/MirelSIG/Mirel-portfolio](https://github.com/MirelSIG/Mirel-portfolio)
