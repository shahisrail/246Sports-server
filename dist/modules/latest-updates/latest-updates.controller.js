"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLatestUpdate = exports.updateLatestUpdate = exports.importLatestUpdates = exports.getLatestUpdateById = exports.getLatestUpdates = void 0;
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const database_1 = require("../../config/database");
const types_1 = require("../../types");
const responseHandler_1 = require("../../utils/responseHandler");
const allowedStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const getLatestUpdates = async (req, res) => {
    try {
        const { page = 1, limit = 12, status, sport, event_type, period, date_from, date_to, search, } = req.query;
        const params = [];
        const isAdmin = Boolean(req.user && [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN].includes(req.user.role));
        const selectedStatus = status || (isAdmin ? undefined : 'PUBLISHED');
        let sql = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM latest_updates
      WHERE deleted_at IS NULL
    `;
        if (selectedStatus) {
            sql += ` AND status = $${params.length + 1}`;
            params.push(selectedStatus);
        }
        if (sport) {
            sql += ` AND lower(sport) = lower($${params.length + 1})`;
            params.push(sport);
        }
        if (event_type) {
            sql += ` AND event_type = $${params.length + 1}`;
            params.push(String(event_type).toUpperCase());
        }
        if (search) {
            sql += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1} OR venue ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }
        const today = new Date().toISOString().slice(0, 10);
        if (period === 'today') {
            sql += ` AND start_date = $${params.length + 1}`;
            params.push(today);
        }
        else if (period === 'week') {
            sql += ` AND start_date >= CURRENT_DATE AND start_date < CURRENT_DATE + INTERVAL '7 days'`;
        }
        else if (period === 'month') {
            sql += ` AND start_date >= date_trunc('month', CURRENT_DATE)::date AND start_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date`;
        }
        if (date_from) {
            sql += ` AND start_date >= $${params.length + 1}`;
            params.push(date_from);
        }
        if (date_to) {
            sql += ` AND start_date <= $${params.length + 1}`;
            params.push(date_to);
        }
        const pageNumber = Number(page);
        const pageSize = Number(limit);
        sql += ` ORDER BY start_date ASC, time ASC NULLS LAST, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageSize, (pageNumber - 1) * pageSize);
        const result = await (0, database_1.query)(sql, params);
        const total = result.rows.length ? Number(result.rows[0].total_count) : 0;
        const rows = result.rows.map(({ total_count, ...row }) => row);
        (0, responseHandler_1.paginatedResponse)(res, rows, pageNumber, pageSize, total, 'Latest updates retrieved successfully');
    }
    catch (error) {
        console.error('Get latest updates error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get latest updates', 500, 'GET_LATEST_UPDATES_FAILED');
    }
};
exports.getLatestUpdates = getLatestUpdates;
const getLatestUpdateById = async (req, res) => {
    try {
        const result = await (0, database_1.query)(`SELECT * FROM latest_updates WHERE id = $1 AND deleted_at IS NULL`, [req.params.id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Latest update not found', 404, 'LATEST_UPDATE_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Latest update retrieved successfully');
    }
    catch (error) {
        console.error('Get latest update error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get latest update', 500, 'GET_LATEST_UPDATE_FAILED');
    }
};
exports.getLatestUpdateById = getLatestUpdateById;
const importLatestUpdates = async (req, res) => {
    if (!req.file) {
        (0, responseHandler_1.errorResponse)(res, 'Document file is required', 400, 'DOCUMENT_REQUIRED');
        return;
    }
    const publish = req.query.publish === 'true' || req.body?.publish === 'true' || req.body?.publish === true;
    const sourceType = fileSourceType(req.file.originalname);
    if (!sourceType) {
        (0, responseHandler_1.errorResponse)(res, 'Only .docx, .pdf, .txt, and .csv files are supported', 400, 'INVALID_DOCUMENT_TYPE');
        return;
    }
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `${(0, uuid_1.v4)()}-${safeFileName(req.file.originalname)}`);
    try {
        await promises_1.default.writeFile(tempPath, req.file.buffer);
        const extracted = await runExtractor(tempPath, req.file.originalname);
        const updates = Array.isArray(extracted.updates) ? extracted.updates : [];
        if (updates.length === 0) {
            (0, responseHandler_1.successResponse)(res, { imported: 0, updates: [], warnings: ['No dated updates were detected in this document.'] }, 'No updates detected');
            return;
        }
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            const inserted = [];
            for (const item of updates) {
                const insertedRow = await client.query(`INSERT INTO latest_updates (
             id, title, description, sport, event_type, start_date, end_date, time, venue, location,
             home_team, away_team, source_file, source_type, confidence_score, status, published_at, created_by
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           RETURNING *`, [
                    (0, uuid_1.v4)(),
                    item.title,
                    item.description || item.title,
                    item.sport || 'General Sports',
                    normalizeType(item.event_type),
                    item.start_date,
                    item.end_date || item.start_date,
                    item.time || null,
                    item.venue || null,
                    item.location || null,
                    item.home_team || null,
                    item.away_team || null,
                    req.file.originalname,
                    sourceType,
                    item.confidence_score || 0,
                    publish ? 'PUBLISHED' : 'DRAFT',
                    publish ? new Date() : null,
                    req.user?.userId || null,
                ]);
                inserted.push(insertedRow.rows[0]);
            }
            await client.query('COMMIT');
            (0, responseHandler_1.successResponse)(res, { imported: inserted.length, updates: inserted, textLength: extracted.text_length || 0 }, publish ? 'Document imported and published successfully' : 'Document imported as draft successfully', 201);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Import latest updates error:', error);
        (0, responseHandler_1.errorResponse)(res, error?.message || 'Failed to import latest updates', 500, 'LATEST_UPDATES_IMPORT_FAILED');
    }
    finally {
        await promises_1.default.unlink(tempPath).catch(() => undefined);
    }
};
exports.importLatestUpdates = importLatestUpdates;
const updateLatestUpdate = async (req, res) => {
    try {
        const allowed = ['title', 'description', 'sport', 'event_type', 'start_date', 'end_date', 'time', 'venue', 'location', 'home_team', 'away_team'];
        const updates = [];
        const params = [];
        for (const field of allowed) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${params.length + 1}`);
                params.push(field === 'event_type' ? normalizeType(req.body[field]) : req.body[field]);
            }
        }
        if (req.body.status !== undefined) {
            const nextStatus = String(req.body.status).toUpperCase();
            if (!allowedStatuses.includes(nextStatus)) {
                (0, responseHandler_1.errorResponse)(res, 'Invalid status', 400, 'INVALID_STATUS');
                return;
            }
            updates.push(`status = $${params.length + 1}`);
            params.push(nextStatus);
            updates.push(`published_at = ${nextStatus === 'PUBLISHED' ? 'COALESCE(published_at, CURRENT_TIMESTAMP)' : 'NULL'}`);
        }
        if (updates.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'No update fields provided', 400, 'NO_UPDATE_FIELDS');
            return;
        }
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(req.params.id);
        const result = await (0, database_1.query)(`UPDATE latest_updates SET ${updates.join(', ')} WHERE id = $${params.length} AND deleted_at IS NULL RETURNING *`, params);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Latest update not found', 404, 'LATEST_UPDATE_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, result.rows[0], 'Latest update updated successfully');
    }
    catch (error) {
        console.error('Update latest update error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to update latest update', 500, 'UPDATE_LATEST_UPDATE_FAILED');
    }
};
exports.updateLatestUpdate = updateLatestUpdate;
const deleteLatestUpdate = async (req, res) => {
    try {
        const result = await (0, database_1.query)(`UPDATE latest_updates SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id`, [req.params.id]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'Latest update not found', 404, 'LATEST_UPDATE_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, null, 'Latest update deleted successfully');
    }
    catch (error) {
        console.error('Delete latest update error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to delete latest update', 500, 'DELETE_LATEST_UPDATE_FAILED');
    }
};
exports.deleteLatestUpdate = deleteLatestUpdate;
function runExtractor(filePath, originalName) {
    const scriptPath = path_1.default.resolve(__dirname, '../../../scripts/extract-latest-updates.py');
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)('python3', [scriptPath, filePath, originalName], { cwd: path_1.default.resolve(__dirname, '../../..') });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
        child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
        child.on('close', (code) => {
            try {
                const parsed = JSON.parse(stdout || '{}');
                if (code !== 0 || parsed.error)
                    reject(new Error(parsed.error || stderr || 'Document extraction failed'));
                else
                    resolve(parsed);
            }
            catch {
                reject(new Error(stderr || 'Document extraction failed'));
            }
        });
    });
}
function safeFileName(name) {
    return String(name || 'upload').replace(/[^a-zA-Z0-9._-]+/g, '-');
}
function fileSourceType(name) {
    const ext = path_1.default.extname(name).toLowerCase();
    if (ext === '.docx')
        return 'DOCX';
    if (ext === '.pdf')
        return 'PDF';
    if (ext === '.txt')
        return 'TXT';
    if (ext === '.csv')
        return 'CSV';
    return '';
}
function normalizeType(value) {
    const normalized = String(value || 'UPDATE').toUpperCase().replace(/[\s-]+/g, '_');
    return normalized.slice(0, 50);
}
//# sourceMappingURL=latest-updates.controller.js.map