import { PoolClient } from 'pg';
export type ImportEntity = 'sports' | 'associations' | 'clubs' | 'teams' | 'players' | 'venues' | 'competitions' | 'fixtures';
type CsvRow = Record<string, string>;
export interface ImportSummary {
    entity: ImportEntity;
    apply: boolean;
    totalRows: number;
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{
        row: number;
        message: string;
        data: CsvRow;
    }>;
    warnings: Array<{
        row: number;
        message: string;
        data: CsvRow;
    }>;
    actions: Array<{
        row: number;
        action: 'create' | 'update' | 'skip';
        entity: ImportEntity;
        name: string;
        id?: string;
    }>;
}
export declare function getImportEntities(): ImportEntity[];
export declare function getTemplate(entity: ImportEntity): string;
export declare function isImportEntity(value: string): value is ImportEntity;
export declare function parseCsv(text: string): CsvRow[];
export declare function toCsv(rows: Record<string, any>[]): string;
export declare function exportReference(client: PoolClient, entity: ImportEntity): Promise<string>;
export declare function importRows(client: PoolClient, entity: ImportEntity, rows: CsvRow[], apply: boolean): Promise<ImportSummary>;
export {};
//# sourceMappingURL=bulk-import.service.d.ts.map