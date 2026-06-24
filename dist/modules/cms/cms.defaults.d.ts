export declare const defaultCmsPages: Record<string, any>;
export declare const mergeCmsContentWithTemplate: (pageKey: string, content?: any) => any;
export declare const getDefaultCmsPage: (pageKey: string, status?: string) => {
    id: string;
    pageKey: string;
    routePath: any;
    title: any;
    status: string;
    content: any;
    seo: any;
    publishedAt: string | null;
    createdBy: null;
    updatedBy: null;
    createdAt: string;
    updatedAt: string;
    isDefault: boolean;
} | null;
//# sourceMappingURL=cms.defaults.d.ts.map