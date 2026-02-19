import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    gender: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const postSchema: z.ZodObject<{
    content: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    feeling: z.ZodOptional<z.ZodString>;
    privacy: z.ZodDefault<z.ZodEnum<{
        public: "public";
        friends: "friends";
        private: "private";
    }>>;
    hashtags: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<any, string | undefined>>;
}, z.core.$strip>;
export declare const commentSchema: z.ZodObject<{
    content: z.ZodString;
    postId: z.ZodString;
}, z.core.$strip>;
export declare const messageSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    receiverId: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=validation.d.ts.map