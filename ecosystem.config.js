module.exports = {
  apps: [{
    name: 'quiz-tester-backend',
    script: 'dist/index.js',
    
    // Configuración optimizada para 1GB RAM y 2 vCPU
    instances: 1,                    // Solo 1 instancia para evitar sobrecarga
    exec_mode: 'fork',               // Modo fork para menor uso de memoria
    max_memory_restart: '512M',      // Reiniciar si usa más de 512MB (deja 512MB para el sistema)
    
    // Configuración de logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Configuración de reinicio
    autorestart: true,
    watch: false,                    // Desactivar watch para ahorrar recursos
    ignore_watch: ['node_modules', 'logs'],
    
    // Variables de entorno
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Configuración adicional para optimización
    node_args: '--max-old-space-size=512',  // Limitar heap de Node.js a 512MB
    kill_timeout: 5000,                     // Tiempo de espera para cerrar proceso
    listen_timeout: 3000,                   // Tiempo de espera para iniciar
    max_restarts: 10,                       // Máximo número de reinicios
    min_uptime: '10s'                       // Tiempo mínimo antes de considerar estable
  }]
}; 