import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial da API
 *     description: Retorna informações sobre a API Kalie
 *     tags:
 *       - Início
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bem-vindo à API da rede social Kalie
 *                 data:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                       example: Kalie Social Network API
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     description:
 *                       type: string
 *                       example: API completa para a rede social Kalie
 *                     endpoints:
 *                       type: object
 *                       properties:
 *                         auth:
 *                           type: string
 *                           example: /api/auth
 *                         users:
 *                           type: string
 *                           example: /api/users
 *                         posts:
 *                           type: string
 *                           example: /api/posts
 *                         messages:
 *                           type: string
 *                           example: /api/messages
 *                         notifications:
 *                           type: string
 *                           example: /api/notifications
 *                         stories:
 *                           type: string
 *                           example: /api/stories
 *                     documentation:
 *                       type: string
 *                       example: /api-docs
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API da rede social Kalie',
    data: {
      api: 'Kalie Social Network API',
      version: '1.0.0',
      description: 'API completa para a rede social Kalie',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        posts: '/api/posts',
        messages: '/api/messages',
        notifications: '/api/notifications',
        stories: '/api/stories',
        documentation: '/api-docs'
      },
      status: 'operacional',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica saúde da API
 *     description: Retorna o status de saúde da API
 *     tags:
 *       - Saúde
 *     responses:
 *       200:
 *         description: API saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 database:
 *                   type: string
 *                   example: connected
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    memory: process.memoryUsage(),
    node: process.version
  });
});

/**
 * @swagger
 * /api-info:
 *   get:
 *     summary: Informações técnicas da API
 *     description: Retorna informações técnicas sobre a API
 *     tags:
 *       - Informações
 *     responses:
 *       200:
 *         description: Informações técnicas
 */
router.get('/api-info', (req, res) => {
  res.json({
    success: true,
    data: {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      },
      dependencies: {
        express: '^4.18.2',
        prisma: '^5.5.2',
        socketio: '^4.7.2',
        mongodb: 'via Prisma',
        jwt: '^9.0.2'
      }
    }
  });
});

// Rota da documentação Swagger
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;