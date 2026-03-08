@echo off
REM Script helper para gestionar el portfolio con Docker en Windows

setlocal enabledelayedexpansion

REM Verificar que Docker esté instalado
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado
    echo Instala Docker desde: https://www.docker.com/products/docker-desktop
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose no esta instalado
    exit /b 1
)

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="setup-ollama" goto setup_ollama
if "%1"=="rebuild" goto rebuild
if "%1"=="clean" goto clean

echo [ERROR] Comando desconocido: %1
goto help

:start
echo [INFO] Iniciando servicios...
docker-compose up -d
echo [INFO] Servicios iniciados
echo [INFO] Portfolio disponible en: http://localhost:8000
echo [INFO] Ollama API en: http://localhost:11434
goto end

:stop
echo [INFO] Deteniendo servicios...
docker-compose down
echo [INFO] Servicios detenidos
goto end

:restart
echo [INFO] Reiniciando servicios...
docker-compose restart
echo [INFO] Servicios reiniciados
goto end

:status
docker-compose ps
goto end

:logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:setup_ollama
echo [INFO] Descargando modelo llama3.2:3b...
docker-compose exec ollama ollama pull llama3.2:3b
echo [INFO] Modelo descargado correctamente
goto end

:rebuild
echo [INFO] Reconstruyendo imagen...
docker-compose build
docker-compose up -d
echo [INFO] Imagen reconstruida e iniciada
goto end

:clean
echo [WARN] Esto eliminara contenedores, redes y volumenes
set /p confirm="¿Continuar? (y/N): "
if /i "%confirm%"=="y" (
    docker-compose down -v
    echo [INFO] Limpieza completada
) else (
    echo [INFO] Limpieza cancelada
)
goto end

:help
echo Portfolio Docker Helper
echo.
echo Uso: docker-helper.bat [comando]
echo.
echo Comandos:
echo   start         Iniciar todos los servicios
echo   stop          Detener todos los servicios
echo   restart       Reiniciar servicios
echo   status        Ver estado de contenedores
echo   logs [servicio]  Ver logs (web u ollama)
echo   setup-ollama  Descargar modelo de Ollama
echo   rebuild       Reconstruir imagen y reiniciar
echo   clean         Eliminar todo (incluye volumenes)
echo   help          Mostrar esta ayuda
echo.
echo Ejemplos:
echo   docker-helper.bat start
echo   docker-helper.bat logs web
echo   docker-helper.bat setup-ollama
goto end

:end
endlocal
