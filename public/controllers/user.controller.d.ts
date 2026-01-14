import { Response } from 'express';
export declare const getProfile: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchUsers: (req: any, res: Response) => Promise<void>;
export declare const sendFriendRequest: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const acceptFriendRequest: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectFriendRequest: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeFriend: (req: any, res: Response) => Promise<void>;
export declare const getFriends: (req: any, res: Response) => Promise<void>;
export declare const getFriendRequests: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map