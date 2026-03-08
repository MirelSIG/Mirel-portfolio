#!/bin/bash
# Script helper para gestionar el portfolio con Docker

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo_error "Docker no está instalado"
        echo "Instala Docker desde: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo_error "Docker Compose no está instalado"
        exit 1
    fi
    
    echo_info "Docker y Docker Compose detectados"
}

# Función para iniciar servicios
start() {
    echo_info "Iniciando servicios..."
    docker-compose up -d
    echo_info "Servicios iniciados"
    echo_info "Portfolio disponible en: http://localhost:8000"
    echo_info "Ollama API en: http://localhost:11434"
}

# Función para detener servicios
stop() {
    echo_info "Deteniendo servicios..."
    docker-compose down
    echo_info "Servicios detenidos"
}

# Función para reiniciar
restart() {
    echo_info "Reiniciando servicios..."
    docker-compose restart
    echo_info "Servicios reiniciados"
}

# Función para ver logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Función para ver estado
status() {
    docker-compose ps
}

# Función para descargar modelo de Ollama
setup_ollama() {
    echo_info "Descargando modelo llama3.2:3b..."
    docker-compose exec ollama ollama pull llama3.2:3b
    echo_info "Modelo descargado correctamente"
}

# Función para reconstruir
rebuild() {
    echo_info "Reconstruyendo imagen..."
    docker-compose build
    docker-compose up -d
    echo_info "Imagen reconstruida e iniciada"
}

# Función para limpiar
clean() {
    echo_warn "Esto eliminará contenedores, redes y volúmenes"
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        echo_info "Limpieza completada"
    else
        echo_info "Limpieza cancelada"
    fi
}

# Menú de ayuda
show_help() {
    echo "Portfolio Docker Helper"
    echo
    echo "Uso: ./docker-helper.sh [comando]"
    echo
    echo "Comandos:"
    echo "  start         Iniciar todos los servicios"
    echo "  stop          Detener todos los servicios"
    echo "  restart       Reiniciar servicios"
    echo "  status        Ver estado de contenedores"
    echo "  logs [servicio]  Ver logs (web u ollama)"
    echo "  setup-ollama  Descargar modelo de Ollama"
    echo "  rebuild       Reconstruir imagen y reiniciar"
    echo "  clean         Eliminar todo (incluye volúmenes)"
    echo "  help          Mostrar esta ayuda"
    echo
    echo "Ejemplos:"
    echo "  ./docker-helper.sh start"
    echo "  ./docker-helper.sh logs web"
    echo "  ./docker-helper.sh setup-ollama"
}

# Main
check_docker

case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    setup-ollama)
        setup_ollama
        ;;
    rebuild)
        rebuild
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac
