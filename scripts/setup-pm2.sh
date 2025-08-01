#!/bin/bash

# Script de configuración de PM2 para Quiz Tester Backend
echo "🚀 Configurando PM2 para Quiz Tester Backend..."

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
else
    echo "✅ PM2 ya está instalado"
fi

# Crear directorio de logs
echo "📁 Creando directorio de logs..."
mkdir -p logs

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "📝 Crea un archivo .env con las siguientes variables:"
    echo ""
    echo "NODE_ENV=production"
    echo "PORT=3000"
    echo "GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/firebase-service-account.json"
    echo ""
else
    echo "✅ Archivo .env encontrado"
fi

# Verificar si existe ecosystem.config.js
if [ -f ecosystem.config.js ]; then
    echo "✅ Archivo ecosystem.config.js encontrado"
else
    echo "❌ Archivo ecosystem.config.js no encontrado"
    exit 1
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📋 Comandos útiles:"
echo "  npm run pm2:start      # Iniciar en desarrollo"
echo "  npm run pm2:start:prod # Iniciar en producción"
echo "  npm run pm2:status     # Ver estado"
echo "  npm run pm2:logs       # Ver logs"
echo "  npm run pm2:monit      # Monitor en tiempo real"
echo "  npm run pm2:stop       # Detener"
echo "  npm run pm2:delete     # Eliminar"
echo ""
echo "🔧 Para configurar inicio automático:"
echo "  pm2 startup"
echo "  pm2 save"
echo "" 