import { Response } from 'express';
export declare const successResponse: (res: Response, data: any, message?: string, statusCode?: number) => Response<any, Record<string, any>>;
export declare const errorResponse: (res: Response, message?: string, statusCode?: number, error?: string) => Response<any, Record<string, any>>;
export declare const paginatedResponse: <T>(res: Response, data: T[], page: number, limit: number, total: number, message?: string) => Response<any, Record<string, any>>;
//# sourceMappingURL=responseHandler.d.ts.map