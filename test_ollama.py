# Script para probar la configuración de Ollama
# Ejecutar: python test_ollama.py

import sys

print("🔍 Verificando instalación de Ollama...\n")

# 1. Verificar biblioteca Python
try:
    import ollama
    print("✅ Biblioteca Python 'ollama' instalada correctamente")
except ImportError:
    print("❌ Biblioteca 'ollama' no encontrada")
    print("   Instalar con: pip install ollama")
    sys.exit(1)

# 2. Verificar conexión al servidor Ollama
try:
    models = ollama.list()
    print(f"✅ Servidor Ollama funcionando")
    print(f"   Modelos disponibles: {len(models.get('models', []))}")
    
    if models.get('models'):
        print("\n📦 Modelos descargados:")
        for model in models['models']:
            name = model.get('name', 'Unknown')
            size_gb = model.get('size', 0) / (1024**3)
            print(f"   • {name} ({size_gb:.1f} GB)")
    else:
        print("\n⚠️  No hay modelos descargados")
        print("   Descargar con: ollama pull llama3.2:3b")
        
except Exception as e:
    print(f"❌ No se puede conectar al servidor Ollama")
    print(f"   Error: {e}")
    print("\n   Pasos para solucionar:")
    print("   1. Instala Ollama desde: https://ollama.com/download")
    print("   2. Reinicia tu terminal")
    print("   3. Ejecuta: ollama serve")
    sys.exit(1)

# 3. Probar modelo recomendado
print("\n🧪 Probando modelo 'llama3.2:3b'...")
try:
    response = ollama.chat(
        model='llama3.2:3b',
        messages=[
            {'role': 'user', 'content': '¿Quién es Mirel Volcán Calderón?'}
        ]
    )
    print("✅ Modelo 'llama3.2:3b' funciona correctamente")
    print(f"\n   Respuesta de prueba:\n   {response['message']['content'][:200]}...")
    
except Exception as e:
    print(f"⚠️  Modelo 'llama3.2:3b' no disponible")
    print(f"   Error: {e}")
    print("\n   Descargar con: ollama pull llama3.2:3b")
    print("   O usar otro modelo editando qa_service.py")

# 4. Resumen
print("\n" + "="*60)
print("📊 RESUMEN DE CONFIGURACIÓN")
print("="*60)
print("""
Tu agente de chat ahora puede usar Ollama para respuestas mejoradas:

✨ VENTAJAS:
  • Respuestas más naturales y conversacionales
  • Mejor comprensión del contexto
  • Funciona offline sin costos de API

⚙️  FALLBACK:
  • Si Ollama no está disponible, el agente usa keywords
  • No hay problema si no instalas Ollama inmediatamente

🚀 SIGUIENTE PASO:
  • Reinicia el servidor FastAPI
  • Prueba el agente en tu portfolio
  
📖 MÁS INFORMACIÓN:
  • Lee OLLAMA_SETUP.md para detalles
""")
