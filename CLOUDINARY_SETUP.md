# 🌥️ Configuração do Cloudinary - Kalie Social Media

## 📋 Pré-requisitos

1. Conta no Cloudinary (gratuita)
2. Node.js instalado
3. Projeto Kalie configurado

---

## 🚀 Passo a Passo

### 1. Criar Conta no Cloudinary

1. Acesse: https://cloudinary.com/users/register/free
2. Crie sua conta gratuita
3. Confirme seu email

### 2. Obter Credenciais

1. Faça login no Cloudinary
2. Acesse o Dashboard: https://console.cloudinary.com/
3. Você verá suas credenciais:
   - **Cloud Name**: `your_cloud_name`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123`

### 3. Instalar Dependência

```bash
cd api/v1
npm install cloudinary
```

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `api/v1/.env` e adicione suas credenciais:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
CLOUDINARY_API_KEY=sua_api_key_aqui
CLOUDINARY_API_SECRET=seu_api_secret_aqui
```

**⚠️ IMPORTANTE**: Nunca compartilhe suas credenciais ou faça commit delas no Git!

### 5. Verificar Instalação

Execute o servidor:

```bash
npm run dev
```

Se tudo estiver correto, você verá a mensagem de servidor iniciado sem erros.

---

## 📁 Estrutura de Pastas no Cloudinary

O sistema criará automaticamente as seguintes pastas:

```
kalie/
├── posts/          # Imagens e vídeos de posts
├── stories/        # Stories temporários
├── messages/       # Imagens de mensagens
├── avatars/        # Fotos de perfil
└── covers/         # Fotos de capa
```

---

## ✨ Funcionalidades Implementadas

### 1. Upload de Posts
- **Imagens**: Otimizadas para 1200px de largura
- **Vídeos**: Formato MP4, qualidade automática
- **Localização**: `kalie/posts/`

### 2. Upload de Stories
- **Imagens**: 1080x1920 (formato stories)
- **Vídeos**: Formato MP4
- **Expiração**: 24 horas
- **Localização**: `kalie/stories/`

### 3. Upload de Mensagens
- **Imagens**: Otimizadas para 800px
- **Formato**: JPG com qualidade automática
- **Localização**: `kalie/messages/`

### 4. Upload de Avatares
- **Dimensões**: 400x400px (quadrado)
- **Crop**: Fill (preenche todo o espaço)
- **Formato**: JPG otimizado
- **Localização**: `kalie/avatars/`

### 5. Upload de Fotos de Capa
- **Dimensões**: 1500x500px
- **Crop**: Fill
- **Formato**: JPG otimizado
- **Localização**: `kalie/covers/`

---

## 🔧 Configurações de Otimização

### Imagens
- **Qualidade**: Automática (Cloudinary escolhe a melhor)
- **Formato**: JPG (melhor compressão)
- **Compressão**: Ativada automaticamente
- **Responsivo**: URLs otimizadas para diferentes dispositivos

### Vídeos
- **Formato**: MP4 (compatibilidade universal)
- **Qualidade**: Automática
- **Streaming**: Adaptativo

---

## 📊 Limites do Plano Gratuito

- **Armazenamento**: 25 GB
- **Bandwidth**: 25 GB/mês
- **Transformações**: 25.000/mês
- **Uploads**: Ilimitados

**💡 Dica**: O plano gratuito é suficiente para desenvolvimento e testes!

---

## 🛠️ Funções Disponíveis

### `uploadToCloudinary(file, folder, options)`
Upload de imagens com otimização automática.

```typescript
const result = await uploadToCloudinary(
  filePath,
  'posts',
  {
    width: 1200,
    quality: 'auto',
    format: 'jpg'
  }
);
// Retorna: { url, publicId, secureUrl, width, height, format }
```

### `uploadVideoToCloudinary(file, folder, options)`
Upload de vídeos.

```typescript
const result = await uploadVideoToCloudinary(
  filePath,
  'stories',
  {
    quality: 'auto',
    format: 'mp4'
  }
);
// Retorna: { url, publicId, secureUrl, duration, format }
```

### `deleteFromCloudinary(publicId, resourceType)`
Deletar arquivo do Cloudinary.

```typescript
await deleteFromCloudinary('kalie/posts/abc123', 'image');
```

### `getOptimizedUrl(publicId, options)`
Gerar URL otimizada para um arquivo existente.

```typescript
const url = getOptimizedUrl('kalie/avatars/user123', {
  width: 200,
  height: 200,
  crop: 'fill'
});
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha suas credenciais**
   - Use variáveis de ambiente
   - Adicione `.env` ao `.gitignore`

2. **Validação de arquivos**
   - Verifique tipo de arquivo
   - Limite tamanho de upload
   - Sanitize nomes de arquivo

3. **Controle de acesso**
   - Use autenticação JWT
   - Valide permissões do usuário
   - Implemente rate limiting

---

## 🐛 Troubleshooting

### Erro: "Must supply cloud_name"
**Solução**: Verifique se as variáveis de ambiente estão configuradas corretamente no `.env`

### Erro: "Invalid API Key"
**Solução**: Confirme que copiou a API Key corretamente do dashboard do Cloudinary

### Erro: "Upload failed"
**Solução**: 
- Verifique sua conexão com internet
- Confirme que o arquivo existe
- Verifique os limites do seu plano

### Imagens não aparecem
**Solução**:
- Verifique se a URL retornada está correta
- Confirme que o arquivo foi enviado (verifique no dashboard do Cloudinary)
- Teste a URL diretamente no navegador

---

## 📚 Recursos Adicionais

- **Documentação Oficial**: https://cloudinary.com/documentation
- **Node.js SDK**: https://cloudinary.com/documentation/node_integration
- **Dashboard**: https://console.cloudinary.com/
- **Suporte**: https://support.cloudinary.com/

---

## ✅ Checklist de Configuração

- [ ] Conta criada no Cloudinary
- [ ] Credenciais copiadas
- [ ] Pacote `cloudinary` instalado
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Servidor reiniciado
- [ ] Teste de upload realizado

---

## 🎉 Pronto!

Agora sua aplicação Kalie está usando o Cloudinary para gerenciar todas as imagens e vídeos de forma profissional e escalável!

**Benefícios**:
- ✅ Upload mais rápido
- ✅ Otimização automática
- ✅ CDN global
- ✅ Transformações on-the-fly
- ✅ Backup automático
- ✅ Escalabilidade
