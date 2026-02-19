"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizedUrl = exports.deleteFromCloudinary = exports.uploadVideoToCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
// Configuração do Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
/**
 * Upload de imagem para o Cloudinary
 * @param file - Buffer ou caminho do arquivo
 * @param folder - Pasta no Cloudinary (posts, stories, messages, avatars)
 * @param options - Opções adicionais de upload
 */
const uploadToCloudinary = async (file, folder, options = {}) => {
    try {
        const uploadOptions = {
            folder: `kalie/${folder}`,
            resource_type: 'auto',
            ...options
        };
        // Se for um buffer, converter para base64
        let fileToUpload = file;
        if (Buffer.isBuffer(file)) {
            fileToUpload = `data:image/jpeg;base64,${file.toString('base64')}`;
        }
        const result = await cloudinary_1.v2.uploader.upload(fileToUpload, uploadOptions);
        return {
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format
        };
    }
    catch (error) {
        console.error('Erro ao fazer upload para Cloudinary:', error);
        throw new Error('Falha no upload da imagem');
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Upload de vídeo para o Cloudinary
 */
const uploadVideoToCloudinary = async (file, folder, options = {}) => {
    try {
        const uploadOptions = {
            folder: `kalie/${folder}`,
            resource_type: 'video',
            ...options
        };
        let fileToUpload = file;
        if (Buffer.isBuffer(file)) {
            fileToUpload = `data:video/mp4;base64,${file.toString('base64')}`;
        }
        const result = await cloudinary_1.v2.uploader.upload(fileToUpload, uploadOptions);
        return {
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            duration: result.duration,
            format: result.format
        };
    }
    catch (error) {
        console.error('Erro ao fazer upload de vídeo para Cloudinary:', error);
        throw new Error('Falha no upload do vídeo');
    }
};
exports.uploadVideoToCloudinary = uploadVideoToCloudinary;
/**
 * Deletar arquivo do Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: resourceType });
    }
    catch (error) {
        console.error('Erro ao deletar do Cloudinary:', error);
        throw new Error('Falha ao deletar arquivo');
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
/**
 * Gerar URL otimizada
 */
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary_1.v2.url(publicId, {
        ...options,
        secure: true
    });
};
exports.getOptimizedUrl = getOptimizedUrl;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map