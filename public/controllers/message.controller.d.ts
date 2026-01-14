import { Response } from 'express';
export declare const getConversations: (req: any, res: Response) => Promise<void>;
export declare const getMessages: (req: any, res: Response) => Promise<void>;
export declare const sendMessage: (req: any, res: Response) => Promise<void>;
export declare const deleteMessage: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAsRead: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAllAsRead: (req: any, res: Response) => Promise<void>;
export declare const getUnreadCount: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=message.controller.d.ts.map