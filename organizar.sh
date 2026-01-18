#!/bin/bash

echo "📁 Organizando estructura dentro de PORTFOLIOMIREL..."

# Crear subcarpetas necesarias
mkdir -p api
mkdir -p img

# Mover archivos principales a la raíz correcta
mv index.html .
mv index_en.html .
mv portfolio.css .
mv portfolio.js .
mv render.yaml .

# Mover API
mv api/main.py api/
mv api/perfil_ES.json api/
mv api/perfil_EN.json api/
mv api/requirements.txt api/

# Mover imagen
mv "Perfil Telegram.jpg" img/

echo "✨ Estructura organizada correctamente:"
echo "
PORTFOLIOMIREL/
│
├── index.html
├── index_en.html
├── portfolio.css
├── portfolio.js
├── render.yaml
│
├── api/
│     ├── main.py
│     ├── perfil_ES.json
│     ├── perfil_EN.json
│     ├── requirements.txt
│
└── img/
      └── Perfil Telegram.jpg
"

echo "🚀 Listo. Tu repositorio está limpio y profesional."
