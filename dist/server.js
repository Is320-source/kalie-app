"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = process.env.PORT || 3001;
app_1.httpServer.listen(PORT, () => {
    console.log(`
  🚀 Servidor Kalie iniciado!
  🔗 API: http://localhost:${PORT}
  📡 Socket.IO: http://localhost:${PORT}
  📚 Documentação: http://localhost:${PORT}/api-docs
  📁 Uploads: http://localhost:${PORT}/uploads
  
  📊 Endpoints disponíveis:
    • GET  /          - Página inicial
    • GET  /health    - Status da API
    • GET  /api-info  - Informações técnicas
    • GET  /api-docs  - Documentação Swagger
  
  🔐 Rotas da API:
    • POST   /api/auth/register     - Registrar
    • POST   /api/auth/login        - Login
    • GET    /api/auth/profile      - Perfil (requer auth)
    • GET    /api/users/me          - Meu perfil
    • GET    /api/posts/feed        - Feed de posts
    • GET    /api/messages          - Conversas
    • GET    /api/notifications     - Notificações
    • POST   /api/stories           - Criar story
  
  📅 ${new Date().toLocaleString()}
  `);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    app_1.httpServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    app_1.httpServer.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map