# 🐳 Configuración Docker para Mirel Portfolio

## ¿Por qué Docker?

Docker permite ejecutar tu portfolio en cualquier sistema operativo (Windows, Mac, Linux) sin preocuparte por dependencias o configuraciones del sistema.

## 📋 Requisitos Previos

### Instalar Docker Desktop

#### Windows:
1. Descarga Docker Desktop: https://www.docker.com/products/docker-desktop
2. Instala siguiendo el wizard
3. Reinicia tu computadora
4. Abre Docker Desktop y espera a que inicie

#### Mac:
```bash
brew install --cask docker
```
O descarga desde: https://www.docker.com/products/docker-desktop

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Fedora
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Verificar instalación:
```bash
docker --version
docker-compose --version
```

## 🚀 Uso Rápido

### 1. Iniciar todos los servicios (Portfolio + Ollama)

```bash
docker-compose up -d
```

Esto:
- ✅ Construye la imagen de tu aplicación
- ✅ Inicia el contenedor FastAPI en puerto 8000
- ✅ Inicia Ollama en puerto 11434
- ✅ Configura la red entre servicios

### 2. Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo portfolio
docker-compose logs -f web

# Solo Ollama
docker-compose logs -f ollama
```

### 3. Acceder a la aplicación

Abre tu navegador en: http://localhost:8000

### 4. Descargar modelo de Ollama (primera vez)

```bash
docker-compose exec ollama ollama pull llama3.2:3b
```

### 5. Detener servicios

```bash
docker-compose down
```

Para también eliminar volúmenes (datos de Ollama):
```bash
docker-compose down -v
```

## 📦 Comandos Útiles

### Reconstruir imagen después de cambios
```bash
docker-compose build
docker-compose up -d
```

### Reiniciar un servicio específico
```bash
docker-compose restart web
docker-compose restart ollama
```

### Ver estado de contenedores
```bash
docker-compose ps
```

### Ejecutar comandos dentro del contenedor
```bash
# Shell interactivo
docker-compose exec web bash

# Comando específico
docker-compose exec web python test_ollama.py
```

### Ver uso de recursos
```bash
docker stats
```

### Limpiar todo (incluye imágenes no usadas)
```bash
docker system prune -a
```

## 🔧 Configuración Avanzada

### Solo ejecutar Portfolio (sin Ollama)

Edita `docker-compose.yml` y comenta la sección de Ollama:

```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    # depends_on:
    #   - ollama
    
  # ollama:
  #   ...comentar todo
```

Luego:
```bash
docker-compose up -d
```

### Usar GPU para Ollama (NVIDIA)

Descomentar en `docker-compose.yml`:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

### Variables de entorno personalizadas

Crea archivo `.env` en la raíz:

```env
PYTHONUNBUFFERED=1
OLLAMA_HOST=http://ollama:11434
LOG_LEVEL=info
```

### Cambiar puertos

Edita `docker-compose.yml`:

```yaml
web:
  ports:
    - "3000:8000"  # Acceder en localhost:3000

ollama:
  ports:
    - "11435:11434"  # Otra puerto para Ollama
```

## 🌐 Despliegue en Producción

### Usando Docker Compose en servidor

1. **Clonar repositorio en servidor:**
```bash
git clone https://github.com/MirelSIG/Mirel-portfolio.git
cd Mirel-portfolio
```

2. **Iniciar servicios:**
```bash
docker-compose up -d
```

3. **Configurar nginx como proxy reverso** (opcional):

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Usando Docker Hub

1. **Build y push:**
```bash
docker build -t tu-usuario/mirel-portfolio:latest .
docker push tu-usuario/mirel-portfolio:latest
```

2. **Pull y run en otro servidor:**
```bash
docker pull tu-usuario/mirel-portfolio:latest
docker run -d -p 8000:8000 tu-usuario/mirel-portfolio:latest
```

## 🐛 Troubleshooting

### Puerto 8000 ya en uso
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <número> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

O cambia el puerto en `docker-compose.yml`.

### Ollama no conecta
```bash
# Verificar que el contenedor esté corriendo
docker-compose ps

# Ver logs
docker-compose logs ollama

# Reiniciar servicio
docker-compose restart ollama
```

### Cambios en código no se reflejan
```bash
# Reconstruir imagen
docker-compose build web
docker-compose up -d
```

O asegúrate de que el volumen esté montado correctamente (ya está configurado).

### Error de permisos en Linux
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Contenedor se detiene inmediatamente
```bash
# Ver logs de error
docker-compose logs web

# Verificar que requirements.txt esté completo
docker-compose exec web pip list
```

## 📊 Ventajas de Docker

✅ **Portabilidad**: Funciona igual en Windows, Mac, Linux
✅ **Aislamiento**: No interfiere con otras instalaciones de Python
✅ **Reproducibilidad**: Mismo entorno en desarrollo y producción
✅ **Fácil deploy**: Un comando para iniciar todo
✅ **Escalabilidad**: Fácil agregar más servicios (DB, cache, etc.)

## 🔄 Workflow Recomendado

### Desarrollo local:
```bash
# 1. Primera vez
docker-compose up -d
docker-compose exec ollama ollama pull llama3.2:3b

# 2. Desarrollo
# Edita archivos normalmente, los cambios se reflejan automáticamente

# 3. Ver logs
docker-compose logs -f web

# 4. Al terminar
docker-compose down
```

### Deploy a producción:
```bash
# 1. En servidor
git clone repo
cd Mirel-portfolio

# 2. Variables de entorno (si es necesario)
nano .env

# 3. Iniciar
docker-compose up -d

# 4. Descargar modelo (opcional)
docker-compose exec ollama ollama pull llama3.2:3b
```

## 📚 Recursos Adicionales

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Ollama Docker: https://hub.docker.com/r/ollama/ollama
- FastAPI Docker: https://fastapi.tiangolo.com/deployment/docker/

## 💡 Tips

1. **Desarrollo rápido**: Los cambios en código se reflejan automáticamente sin reconstruir (gracias al volume mount)
2. **Datos persistentes**: Los modelos de Ollama se guardan en un volume, no se pierden al reiniciar
3. **Múltiples entornos**: Puedes tener diferentes `docker-compose.yml` para dev/staging/prod
4. **Logs estructurados**: Usa `docker-compose logs` para debugging
5. **Health checks**: Docker reinicia automáticamente si un servicio falla
