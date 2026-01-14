import { Response } from 'express';
export declare const createPost: (req: any, res: Response) => Promise<void>;
export declare const getFeed: (req: any, res: Response) => Promise<void>;
export declare const getUserPosts: (req: any, res: Response) => Promise<void>;
export declare const likePost: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createComment: (req: any, res: Response) => Promise<void>;
export declare const getPostComments: (req: any, res: Response) => Promise<void>;
export declare const likeComment: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sharePost: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPoll: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const voteOnPoll: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePost: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=post.controller.d.ts.map