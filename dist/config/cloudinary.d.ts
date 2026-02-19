import { v2 as cloudinary } from 'cloudinary';
/**
 * Upload de imagem para o Cloudinary
 * @param file - Buffer ou caminho do arquivo
 * @param folder - Pasta no Cloudinary (posts, stories, messages, avatars)
 * @param options - Opções adicionais de upload
 */
export declare const uploadToCloudinary: (file: string | Buffer, folder: "posts" | "stories" | "messages" | "avatars" | "covers", options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
}) => Promise<{
    url: string;
    publicId: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
}>;
/**
 * Upload de vídeo para o Cloudinary
 */
export declare const uploadVideoToCloudinary: (file: string | Buffer, folder: "posts" | "stories", options?: {
    quality?: string;
    format?: string;
}) => Promise<{
    url: string;
    publicId: string;
    secureUrl: string;
    duration: number;
    format: string;
}>;
/**
 * Deletar arquivo do Cloudinary
 */
export declare const deleteFromCloudinary: (publicId: string, resourceType?: "image" | "video") => Promise<void>;
/**
 * Gerar URL otimizada
 */
export declare const getOptimizedUrl: (publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
}) => string;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map