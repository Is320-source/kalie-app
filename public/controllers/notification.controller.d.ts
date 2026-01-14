import { Response } from 'express';
export declare const getNotifications: (req: any, res: Response) => Promise<void>;
export declare const markAsRead: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAllAsRead: (req: any, res: Response) => Promise<void>;
export declare const deleteNotification: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAllNotifications: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=notification.controller.d.ts.map