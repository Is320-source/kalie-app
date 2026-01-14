export interface TokenPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const decodeToken: (token: string) => TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map