# 🚀 Guía de Despliegue en Render.com

## Características de Render

- ✅ **Gratis**: Plan free tier generoso
- ✅ **Python/FastAPI**: Soporte nativo
- ✅ **Auto-deploy**: Se actualiza automáticamente con cada push a GitHub
- ✅ **HTTPS**: Certificado SSL incluido
- ⚠️ **Ollama**: No disponible en free tier (usa fallback de keywords)

---

## 📋 Pasos para Desplegar

### 1. Crear Cuenta en Render

Ve a [render.com](https://render.com) y regístrate con tu cuenta de GitHub.

### 2. Crear Nuevo Web Service

1. Desde el Dashboard, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio: **MirelSIG/Mirel-portfolio**
3. Si no aparece, haz click en **"Configure account"** y dale permisos

### 3. Configurar el Servicio

**Configuración básica**:
- **Name**: `mirel-portfolio` (o el que prefieras)
- **Region**: `Frankfurt (EU Central)` (más cercano a España)
- **Branch**: `main`
- **Runtime**: `Python 3`

**Build & Deploy**:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

**Plan**:
- Selecciona: **Free** (0$/mes)

### 4. Variables de Entorno

En la sección **Environment**:

```
PYTHON_VERSION = 3.11.0
USE_MONGODB = false
```

### 5. Desplegar

Click en **"Create Web Service"** y espera ~5 minutos.

Render automáticamente:
1. Clona tu repositorio
2. Instala dependencias
3. Inicia el servidor
4. Genera una URL pública: `https://mirel-portfolio.onrender.com`

---

## 🔍 Verificar Despliegue

Una vez desplegado, visita:
- **Portfolio ES**: `https://tu-app.onrender.com/`
- **Portfolio EN**: `https://tu-app.onrender.com/en`
- **API Docs**: `https://tu-app.onrender.com/docs`
- **Health Check**: `https://tu-app.onrender.com/health`

### Probar el Chat

El chat funcionará con el sistema de keywords (Ollama no disponible en free tier), pero responderá a:
- Certificaciones Salesforce
- Experiencia en CRM/Odoo
- Habilidades técnicas y blandas
- Experiencia ambiental/internacional
- Educación (42 École, Peñascal)
- Transición a tech
- Y más...

---

## ⚙️ Configuración Automática (Opcional)

Si has creado el archivo `render.yaml` en la raíz del proyecto, puedes usar **Blueprint**:

1. En Render Dashboard, click **"New +"** → **"Blueprint"**
2. Conecta el repositorio `MirelSIG/Mirel-portfolio`
3. Render detectará automáticamente `render.yaml`
4. Click **"Apply"**

Esto crea el servicio con toda la configuración automáticamente.

---

## 🔄 Auto-Deploy

Cada vez que hagas `git push` a la rama `main`, Render automáticamente:
1. Detecta los cambios
2. Reconstruye la aplicación
3. Redespliega (~3-5 minutos)

No necesitas hacer nada manualmente.

---

## 📊 Monitoreo

Desde el Dashboard de Render puedes:
- Ver logs en tiempo real
- Métricas de uso (CPU, memoria)
- Historial de deploys
- Configurar alertas

---

## 🐛 Troubleshooting

### Error: "Application failed to respond"

**Causa**: El servidor no está escuchando en el puerto correcto.

**Solución**: Verifica que `start command` incluya `--port $PORT`:
```bash
uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

### Error: "Build failed"

**Causa**: Dependencias no se instalaron correctamente.

**Solución**: 
1. Revisa `requirements.txt`
2. Verifica los logs de build en Render
3. Asegúrate de que `PYTHON_VERSION=3.11.0`

### Chat no responde o da error

**Causa**: Ollama no está disponible (esperado en free tier).

**Solución**: El chat usa automáticamente el fallback de keywords. Si necesitas Ollama:
- Upgrade a plan pagado de Render (~$7/mes)
- Usa un servidor externo de Ollama (configurar `OLLAMA_HOST` env var)

### Aplicación lenta al primer acceso

**Causa**: Render pone las apps free en "sleep" después de 15 minutos de inactividad.

**Solución**: 
- Primera carga puede tardar 30-60 segundos (wake-up)
- Consultas subsiguientes serán rápidas
- Para evitar sleep: upgrade a plan pagado

---

## 🌟 Mejoras Post-Despliegue

### 1. Dominio Personalizado

En Render → Settings → Custom Domain:
```
mirelvolcan.com
```

Luego configura DNS en tu proveedor de dominio:
```
CNAME @ mirel-portfolio.onrender.com
```

### 2. Agregar Ollama (Plan Pagado)

Si upgradeas a plan pagado ($7/mes), puedes:
1. Usar Docker deploy
2. Incluir servicio Ollama en `docker-compose.yml`
3. Configurar `OLLAMA_HOST` env variable

### 3. Analytics

Agregar Google Analytics o Plausible:
- Edita `templates/portfolio.html`
- Añade script de tracking antes de `</head>`

---

## 💰 Costos

**Free Tier** (Actual):
- 750 horas/mes de compute
- Después de 15 min inactividad → sleep
- HTTPS incluido
- Build time limitado

**Starter Plan** ($7/mes):
- Sin sleep
- Más recursos (512MB RAM → 2GB)
- Soporte para Docker/Ollama
- Priority builds

---

## 📝 Resumen de URLs

Después del despliegue, tendrás:

- **Portfolio Live**: `https://mirel-portfolio.onrender.com`
- **Código GitHub**: `https://github.com/MirelSIG/Mirel-portfolio`
- **GitHub Pages**: `https://mirelsig.github.io/Mirel-portfolio/` (deprecated, usar Render)

**Para recruiters, comparte**: `https://mirel-portfolio.onrender.com` ✨

---

## ✅ Checklist de Despliegue

- [ ] Cuenta en Render.com creada
- [ ] Repositorio GitHub conectado
- [ ] Web Service configurado (Python 3.11, free tier)
- [ ] Variables de entorno añadidas
- [ ] Build command correcto
- [ ] Start command con `--port $PORT`
- [ ] Despliegue completado (estado: "Live")
- [ ] Verificado portfolio en la URL de Render
- [ ] Chat probado (funcionando con keywords)
- [ ] URL compartida con recruiters

---

## 🆘 Soporte

- **Documentación Render**: [render.com/docs](https://render.com/docs)
- **Community Forum**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

---

**Última actualización**: 8 de marzo de 2026
**Autor**: Mirel Marsoli Volcán Calderón
