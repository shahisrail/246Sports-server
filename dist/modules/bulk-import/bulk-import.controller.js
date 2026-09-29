"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCsv = exports.downloadReference = exports.downloadTemplate = exports.getImportOptions = void 0;
const database_1 = require("../../config/database");
const types_1 = require("../../types");
const responseHandler_1 = require("../../utils/responseHandler");
const bulk_import_service_1 = require("./bulk-import.service");
const getImportOptions = async (_req, res) => {
    (0, responseHandler_1.successResponse)(res, { entities: (0, bulk_import_service_1.getImportEntities)() }, 'Bulk import options retrieved');
};
exports.getImportOptions = getImportOptions;
const downloadTemplate = async (req, res) => {
    const entity = String(req.params.entity || '');
    if (!(0, bulk_import_service_1.isImportEntity)(entity)) {
        (0, responseHandler_1.errorResponse)(res, 'Invalid import entity', 400, 'INVALID_IMPORT_ENTITY');
        return;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}-template.csv"`);
    res.status(200).send((0, bulk_import_service_1.getTemplate)(entity));
};
exports.downloadTemplate = downloadTemplate;
const downloadReference = async (req, res) => {
    const entity = String(req.params.entity || '');
    if (!(0, bulk_import_service_1.isImportEntity)(entity)) {
        (0, responseHandler_1.errorResponse)(res, 'Invalid import entity', 400, 'INVALID_IMPORT_ENTITY');
        return;
    }
    const client = await database_1.pool.connect();
    try {
        const csv = await (0, bulk_import_service_1.exportReference)(client, entity);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${entity}-ids-reference.csv"`);
        res.status(200).send(csv);
    }
    catch (error) {
        console.error('Download reference error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to export reference IDs', 500, 'REFERENCE_EXPORT_FAILED');
    }
    finally {
        client.release();
    }
};
exports.downloadReference = downloadReference;
const uploadCsv = async (req, res) => {
    const entity = String(req.params.entity || '');
    const apply = req.query.apply === 'true' || req.body?.apply === 'true' || req.body?.apply === true;
    if (!(0, bulk_import_service_1.isImportEntity)(entity)) {
        (0, responseHandler_1.errorResponse)(res, 'Invalid import entity', 400, 'INVALID_IMPORT_ENTITY');
        return;
    }
    if (!req.file) {
        (0, responseHandler_1.errorResponse)(res, 'CSV file is required', 400, 'CSV_FILE_REQUIRED');
        return;
    }
    const originalName = req.file.originalname || '';
    if (!originalName.toLowerCase().endsWith('.csv') && req.file.mimetype !== 'text/csv') {
        (0, responseHandler_1.errorResponse)(res, 'Only CSV files are supported', 400, 'INVALID_FILE_TYPE');
        return;
    }
    const selectedSport = String(req.body?.sport || '').trim();
    if (entity === 'fixtures' && !selectedSport) {
        (0, responseHandler_1.errorResponse)(res, 'Select a sport for this fixture document', 400, 'SPORT_REQUIRED');
        return;
    }
    if (entity === 'fixtures' && req.user?.role === types_1.UserRole.ASSOCIATION_ADMIN && !req.user.associationId) {
        (0, responseHandler_1.errorResponse)(res, 'An association is required to import fixtures', 403, 'ASSOCIATION_REQUIRED');
        return;
    }
    const rows = (0, bulk_import_service_1.parseCsv)(req.file.buffer.toString('utf8'));
    if (rows.length === 0) {
        (0, responseHandler_1.errorResponse)(res, 'CSV file has no data rows', 400, 'EMPTY_CSV');
        return;
    }
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        const summary = await (0, bulk_import_service_1.importRows)(client, entity, rows, apply, {
            sport: entity === 'fixtures' ? selectedSport : undefined,
            associationId: entity === 'fixtures' && req.user?.role === types_1.UserRole.ASSOCIATION_ADMIN ? req.user.associationId : undefined,
        });
        if (apply && summary.errors.length === 0) {
            await client.query('COMMIT');
        }
        else {
            await client.query('ROLLBACK');
        }
        (0, responseHandler_1.successResponse)(res, summary, apply
            ? summary.errors.length > 0
                ? 'Import validation failed. No records were changed.'
                : 'CSV imported successfully'
            : 'CSV dry-run completed');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('CSV import error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to process CSV import', 500, 'CSV_IMPORT_FAILED');
    }
    finally {
        client.release();
    }
};
exports.uploadCsv = uploadCsv;
//# sourceMappingURL=bulk-import.controller.js.map