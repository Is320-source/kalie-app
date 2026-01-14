import { Response } from 'express';
export declare const createStory: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStories: (req: any, res: Response) => Promise<void>;
export declare const viewStory: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteStory: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStoryViewers: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=story.controller.d.ts.map