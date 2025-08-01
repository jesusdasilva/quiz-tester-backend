# Configuración de PM2 para Quiz Tester Backend

## Instalación

1. **Instalar PM2 globalmente:**
```bash
npm install -g pm2
```

2. **Crear directorio de logs:**
```bash
mkdir -p logs
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Configuración del servidor
NODE_ENV=production
PORT=3000

# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/firebase-service-account.json

# Configuración de CORS (opcional)
CORS_ORIGIN=http://localhost:3000

# Configuración de logs (opcional)
LOG_LEVEL=info
```

## Comandos de PM2

### Iniciar la aplicación
```bash
# Desarrollo
npm run pm2:start

# Producción
npm run pm2:start:prod
```

**Nota:** La aplicación compila TypeScript a JavaScript antes de ejecutarse con PM2. Si tienes problemas, asegúrate de que:
- El archivo `ecosystem.config.js` existe
- Las variables de entorno están configuradas correctamente
- Las credenciales de Firebase están disponibles
- El directorio `dist/` se genera correctamente con `npm run build`

### Gestión de la aplicación
```bash
npm run pm2:status      # Ver estado de la aplicación
npm run pm2:logs        # Ver logs en tiempo real
npm run pm2:monit       # Monitor en tiempo real
npm run pm2:restart     # Reiniciar la aplicación
npm run pm2:reload      # Recargar sin reiniciar
npm run pm2:stop        # Detener la aplicación
npm run pm2:delete      # Eliminar completamente
```

### Comandos directos de PM2
```bash
pm2 list                    # Ver todas las aplicaciones
pm2 show quiz-tester-backend # Información detallada
pm2 flush                   # Limpiar logs
pm2 startup                 # Configurar inicio automático
pm2 save                    # Guardar configuración actual
```

## Configuración Optimizada

La configuración está optimizada para un servidor con:
- **1GB RAM**
- **2 vCPU**

### Optimizaciones aplicadas:
- **Límite de memoria:** 512MB máximo por proceso
- **Una sola instancia:** Evita sobrecarga
- **Modo fork:** Menor uso de memoria
- **Logs separados:** Mejor gestión de logs
- **Reinicio automático:** Si se queda sin memoria

## Monitoreo

### Ver uso de recursos:
```bash
pm2 monit
```

### Ver logs específicos:
```bash
# Logs de error
tail -f logs/err.log

# Logs de salida
tail -f logs/out.log

# Logs combinados
tail -f logs/combined.log
```

## Troubleshooting

### Si la aplicación no inicia:
1. Verificar variables de entorno
2. Verificar credenciales de Firebase
3. Revisar logs: `npm run pm2:logs`

### Si se queda sin memoria:
1. La aplicación se reiniciará automáticamente
2. Revisar logs para identificar el problema
3. Considerar optimizar el código si es necesario

### Para desarrollo local:
```bash
npm run dev  # Usar nodemon en lugar de PM2
``` 