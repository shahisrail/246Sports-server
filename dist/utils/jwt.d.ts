import { AuthPayload } from '../types';
export declare const generateToken: (payload: AuthPayload) => string;
export declare const verifyToken: (token: string) => AuthPayload;
export declare const decodeToken: (token: string) => AuthPayload | null;
//# sourceMappingURL=jwt.d.ts.map