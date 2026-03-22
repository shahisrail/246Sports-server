import { Pool } from "pg";
export declare function checkTablesExist(pool: Pool): Promise<boolean>;
export declare function checkDefaultUserExists(pool: Pool): Promise<boolean>;
export declare function createDefaultAdminUser(pool: Pool): Promise<void>;
export declare function initializeDatabase(pool: Pool): Promise<void>;
export declare function ensureDatabaseSetup(pool: Pool): Promise<boolean>;
//# sourceMappingURL=database-init.d.ts.map