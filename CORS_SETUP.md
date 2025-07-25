# Configuración de CORS - Quiz Tester Backend

## Descripción

Este documento describe la configuración de CORS (Cross-Origin Resource Sharing) implementada en el backend para permitir las peticiones desde el frontend.

## Configuración Actual

### Orígenes Permitidos

```javascript
const corsOptions = {
  origin: '*', // Permitir TODOS los orígenes
  credentials: false, // Deshabilitado cuando origin es '*'
  // ... otros configs
};
```

**Nota:** Esta configuración permite peticiones desde cualquier dominio, lo cual es útil para desarrollo pero debe ser más restrictiva en producción.

### Headers Permitidos

```javascript
allowedHeaders: [
  'Origin',
  'X-Requested-With', 
  'Content-Type',
  'Accept',
  'Authorization',
  'Cache-Control',
  'Pragma'
]
```

### Métodos HTTP Permitidos

```javascript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
```

## Endpoints de Prueba

### Health Check
```bash
curl http://localhost:3000/health
```

### Test CORS
```bash
curl http://localhost:3000/cors-test
```

## Solución de Problemas

### Error: "Access to fetch at 'http://localhost:3000/api/topics' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Causa:** El frontend está intentando hacer una petición desde un origen no permitido.

**Solución:**
1. Verificar que el puerto del frontend esté en la lista de `allowedOrigins`
2. Reiniciar el servidor backend después de cambios en CORS
3. Limpiar el cache del navegador

### Error: "Request header field authorization is not allowed by Access-Control-Allow-Headers"

**Causa:** El header `Authorization` no está en la lista de headers permitidos.

**Solución:** Ya está incluido en la configuración actual.

### Error: "Method PUT is not allowed by Access-Control-Allow-Methods"

**Causa:** El método HTTP no está permitido.

**Solución:** Ya están incluidos todos los métodos necesarios.

## Configuración para Producción

Para producción, actualiza la lista de orígenes permitidos en `src/config/app.ts`:

```javascript
const allowedOrigins = [
  'https://tu-dominio-frontend.com',
  'https://www.tu-dominio-frontend.com',
  // Agregar aquí los dominios de producción
];
```

## Variables de Entorno

```bash
# .env
CORS_ORIGIN=*  # Para desarrollo (permite todos los orígenes)
# CORS_ORIGIN=https://tu-dominio.com  # Para producción
```

## Verificación

Para verificar que CORS está funcionando correctamente:

1. **Desde el navegador:**
   ```javascript
   fetch('http://localhost:3000/api/topics')
     .then(response => response.json())
     .then(data => console.log(data))
     .catch(error => console.error('CORS Error:', error));
   ```

2. **Desde curl:**
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://localhost:3000/api/topics
   ```

## Logs de CORS

El servidor registra automáticamente cuando se bloquea una petición por CORS:

```
CORS bloqueado para origen: http://localhost:9999
```

## Notas Importantes

- **Credentials:** Deshabilitado (no compatible con `origin: '*'`)
- **Preflight:** Cacheado por 24 horas para mejorar el rendimiento
- **Security:** Helmet configurado para permitir recursos cross-origin necesarios
- **File Upload:** Límite de 10MB para JSON y form data
- **Development:** Configuración permisiva para facilitar el desarrollo 