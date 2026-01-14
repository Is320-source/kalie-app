import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
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
export const uploadToCloudinary = async (
  file: string | Buffer,
  folder: 'posts' | 'stories' | 'messages' | 'avatars' | 'covers',
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): Promise<{
  url: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}> => {
  try {
    const uploadOptions: any = {
      folder: `kalie/${folder}`,
      resource_type: 'auto',
      ...options
    };

    // Se for um buffer, converter para base64
    let fileToUpload = file;
    if (Buffer.isBuffer(file)) {
      fileToUpload = `data:image/jpeg;base64,${file.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(fileToUpload as string, uploadOptions);

    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    throw new Error('Falha no upload da imagem');
  }
};

/**
 * Upload de vídeo para o Cloudinary
 */
export const uploadVideoToCloudinary = async (
  file: string | Buffer,
  folder: 'posts' | 'stories',
  options: {
    quality?: string;
    format?: string;
  } = {}
): Promise<{
  url: string;
  publicId: string;
  secureUrl: string;
  duration: number;
  format: string;
}> => {
  try {
    const uploadOptions: any = {
      folder: `kalie/${folder}`,
      resource_type: 'video',
      ...options
    };

    let fileToUpload = file;
    if (Buffer.isBuffer(file)) {
      fileToUpload = `data:video/mp4;base64,${file.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(fileToUpload as string, uploadOptions);

    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      duration: result.duration,
      format: result.format
    };
  } catch (error) {
    console.error('Erro ao fazer upload de vídeo para Cloudinary:', error);
    throw new Error('Falha no upload do vídeo');
  }
};

/**
 * Deletar arquivo do Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Erro ao deletar do Cloudinary:', error);
    throw new Error('Falha ao deletar arquivo');
  }
};

/**
 * Gerar URL otimizada
 */
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string => {
  return cloudinary.url(publicId, {
    ...options,
    secure: true
  });
};

export default cloudinary;
