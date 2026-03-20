export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPassword: (password: string) => boolean;
export declare const isValidUUID: (uuid: string) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const isValidDate: (dateString: string) => boolean;
export declare const isValidCoordinates: (lat: number, lng: number) => boolean;
export declare const sanitizeInput: (input: string) => string;
export declare const validatePagination: (page: any, limit: any) => {
    page: number;
    limit: number;
};
//# sourceMappingURL=validator.d.ts.map