import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kalie Social Network API',
      version,
      description: 'API completa para a rede social Kalie',
      contact: {
        name: 'Kalie Team',
        email: 'suporte@kalie.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.kalie.com',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID do usuário'
            },
            firstName: {
              type: 'string',
              description: 'Primeiro nome'
            },
            lastName: {
              type: 'string',
              description: 'Sobrenome'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            avatar: {
              type: 'string',
              description: 'URL da foto de perfil'
            },
            coverPhoto: {
              type: 'string',
              description: 'URL da foto de capa'
            },
            bio: {
              type: 'string',
              description: 'Biografia do usuário'
            },
            isOnline: {
              type: 'boolean',
              description: 'Status online'
            },
            lastSeen: {
              type: 'string',
              format: 'date-time',
              description: 'Última vez online'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        },
        Post: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID do post'
            },
            content: {
              type: 'string',
              description: 'Conteúdo do post'
            },
            image: {
              type: 'string',
              description: 'URL da imagem'
            },
            video: {
              type: 'string',
              description: 'URL do vídeo'
            },
            privacy: {
              type: 'string',
              enum: ['public', 'friends', 'private'],
              description: 'Privacidade do post'
            },
            authorId: {
              type: 'string',
              description: 'ID do autor'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Erros de validação'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados da resposta'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso ausente ou inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Token de autenticação não fornecido'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Recurso não encontrado'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // Caminhos para os arquivos com anotações
};

export const swaggerSpec = swaggerJSDoc(options);