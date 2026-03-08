# Configuración de Ollama para el Agente de Chat

## ¿Qué es Ollama?
Ollama permite ejecutar modelos de lenguaje (LLMs) localmente en tu computadora, mejorando significativamente las respuestas del agente de chat con inteligencia artificial real.

## Instalación de Ollama en Windows

### Paso 1: Descargar Ollama
1. Ve a: https://ollama.com/download/windows
2. Descarga el instalador para Windows
3. Ejecuta el archivo descargado y sigue las instrucciones

### Paso 2: Verificar instalación
Abre PowerShell o CMD y ejecuta:
```powershell
ollama --version
```

Si ves la versión, está instalado correctamente.

### Paso 3: Descargar el modelo
El agente está configurado para usar `llama3.2:3b` (modelo ligero de 3GB):

```powershell
ollama pull llama3.2:3b
```

**Alternativas si necesitas un modelo más pequeño:**
- `llama3.2:1b` - 1GB (más rápido pero menos preciso)
- `qwen:0.5b` - 500MB (muy rápido, básico)

**Alternativas si quieres mejor calidad:**
- `llama3.2` - 7GB (más preciso pero más lento)
- `mistral` - 4GB (buen balance)

### Paso 4: Iniciar Ollama
Ollama se ejecuta automáticamente como servicio en Windows. Si necesitas iniciarlo manualmente:

```powershell
ollama serve
```

### Paso 5: Probar el modelo
```powershell
ollama run llama3.2:3b "Hola, ¿cómo estás?"
```

## Uso en el Portfolio

Una vez que Ollama esté instalado y el modelo descargado:

1. El agente automáticamente usará Ollama para respuestas más naturales
2. Si Ollama no está disponible, seguirá funcionando con el sistema de keywords (fallback)
3. No necesitas cambiar nada en el código

## Cambiar el modelo usado

Si quieres usar otro modelo, edita `api/services/qa_service.py` línea ~66:

```python
response = ollama.chat(
    model='llama3.2:3b',  # Cambia esto por otro modelo
    messages=[...]
)
```

## Comandos útiles de Ollama

```powershell
# Ver modelos descargados
ollama list

# Descargar un modelo
ollama pull <nombre-modelo>

# Eliminar un modelo
ollama rm <nombre-modelo>

# Ver uso de recursos
ollama ps

# Detener todos los modelos
ollama stop --all
```

## Ventajas de usar Ollama

✅ **Respuestas naturales**: El agente responderá de forma más conversacional
✅ **Comprensión contextual**: Entiende mejor la intención de las preguntas
✅ **Seguimiento de conversación**: Puede mantener contexto entre preguntas
✅ **Privacidad**: Todo se ejecuta localmente, no envía datos a internet
✅ **Gratis**: Sin costos de API

## Requisitos del sistema

- **RAM**: Mínimo 8GB (recomendado 16GB para modelos >3B)
- **Espacio**: 5-10GB para el modelo
- **CPU/GPU**: Funciona en CPU, pero GPU acelera significativamente

## Troubleshooting

**Problema**: "Ollama not found"
- Asegúrate de haber instalado Ollama desde ollama.com
- Reinicia PowerShell después de instalar

**Problema**: "Model not found"
- Ejecuta `ollama pull llama3.2:3b` antes de usar el agente

**Problema**: Respuestas muy lentas
- Usa un modelo más pequeño (`llama3.2:1b`)
- Cierra otros programas que usen mucha RAM
- Considera usar GPU si está disponible

**Problema**: El agente no usa Ollama
- Verifica que el servidor esté corriendo: `ollama ps`
- Revisa la consola del servidor FastAPI para ver errores
- El agente usará keywords automáticamente si Ollama falla
