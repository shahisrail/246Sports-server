import { Response } from 'express';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool, query } from '../../config/database';
import { AuthRequest, UserRole } from '../../types';
import { errorResponse, paginatedResponse, successResponse } from '../../utils/responseHandler';

type ExtractedUpdate = {
  title: string;
  description?: string;
  sport?: string;
  event_type?: string;
  start_date: string;
  end_date?: string;
  time?: string;
  venue?: string;
  location?: string;
  home_team?: string;
  away_team?: string;
  source_file?: string;
  confidence_score?: number;
};

const allowedStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export const getLatestUpdates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      sport,
      event_type,
      period,
      date_from,
      date_to,
      search,
    } = req.query;
    const params: any[] = [];
    const isAdmin = Boolean(req.user && [UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN].includes(req.user.role));
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
    } else if (period === 'week') {
      sql += ` AND start_date >= CURRENT_DATE AND start_date < CURRENT_DATE + INTERVAL '7 days'`;
    } else if (period === 'month') {
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

    const result = await query(sql, params);
    const total = result.rows.length ? Number(result.rows[0].total_count) : 0;
    const rows = result.rows.map(({ total_count, ...row }) => row);
    paginatedResponse(res, rows, pageNumber, pageSize, total, 'Latest updates retrieved successfully');
  } catch (error) {
    console.error('Get latest updates error:', error);
    errorResponse(res, 'Failed to get latest updates', 500, 'GET_LATEST_UPDATES_FAILED');
  }
};

export const getLatestUpdateById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT * FROM latest_updates WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      errorResponse(res, 'Latest update not found', 404, 'LATEST_UPDATE_NOT_FOUND');
      return;
    }
    successResponse(res, result.rows[0], 'Latest update retrieved successfully');
  } catch (error) {
    console.error('Get latest update error:', error);
    errorResponse(res, 'Failed to get latest update', 500, 'GET_LATEST_UPDATE_FAILED');
  }
};

export const importLatestUpdates = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    errorResponse(res, 'Document file is required', 400, 'DOCUMENT_REQUIRED');
    return;
  }

  const publish = req.query.publish === 'true' || req.body?.publish === 'true' || req.body?.publish === true;
  const sourceType = fileSourceType(req.file.originalname);
  if (!sourceType) {
    errorResponse(res, 'Only .docx, .pdf, .txt, and .csv files are supported', 400, 'INVALID_DOCUMENT_TYPE');
    return;
  }

  const tempPath = path.join(os.tmpdir(), `${uuidv4()}-${safeFileName(req.file.originalname)}`);

  try {
    await fs.writeFile(tempPath, req.file.buffer);
    const extracted = await runExtractor(tempPath, req.file.originalname);
    const updates = Array.isArray(extracted.updates) ? extracted.updates as ExtractedUpdate[] : [];

    if (updates.length === 0) {
      successResponse(res, { imported: 0, updates: [], warnings: ['No dated updates were detected in this document.'] }, 'No updates detected');
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];
      for (const item of updates) {
        const insertedRow = await client.query(
          `INSERT INTO latest_updates (
             id, title, description, sport, event_type, start_date, end_date, time, venue, location,
             home_team, away_team, source_file, source_type, confidence_score, status, published_at, created_by
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           RETURNING *`,
          [
            uuidv4(),
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
          ]
        );
        inserted.push(insertedRow.rows[0]);
      }
      await client.query('COMMIT');
      successResponse(
        res,
        { imported: inserted.length, updates: inserted, textLength: extracted.text_length || 0 },
        publish ? 'Document imported and published successfully' : 'Document imported as draft successfully',
        201
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Import latest updates error:', error);
    errorResponse(res, error?.message || 'Failed to import latest updates', 500, 'LATEST_UPDATES_IMPORT_FAILED');
  } finally {
    await fs.unlink(tempPath).catch(() => undefined);
  }
};

export const updateLatestUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['title', 'description', 'sport', 'event_type', 'start_date', 'end_date', 'time', 'venue', 'location', 'home_team', 'away_team'];
    const updates: string[] = [];
    const params: any[] = [];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${params.length + 1}`);
        params.push(field === 'event_type' ? normalizeType(req.body[field]) : req.body[field]);
      }
    }

    if (req.body.status !== undefined) {
      const nextStatus = String(req.body.status).toUpperCase();
      if (!allowedStatuses.includes(nextStatus)) {
        errorResponse(res, 'Invalid status', 400, 'INVALID_STATUS');
        return;
      }
      updates.push(`status = $${params.length + 1}`);
      params.push(nextStatus);
      updates.push(`published_at = ${nextStatus === 'PUBLISHED' ? 'COALESCE(published_at, CURRENT_TIMESTAMP)' : 'NULL'}`);
    }

    if (updates.length === 0) {
      errorResponse(res, 'No update fields provided', 400, 'NO_UPDATE_FIELDS');
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);
    const result = await query(
      `UPDATE latest_updates SET ${updates.join(', ')} WHERE id = $${params.length} AND deleted_at IS NULL RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      errorResponse(res, 'Latest update not found', 404, 'LATEST_UPDATE_NOT_FOUND');
      return;
    }
    successResponse(res, result.rows[0], 'Latest update updated successfully');
  } catch (error) {
    console.error('Update latest update error:', error);
    errorResponse(res, 'Failed to update latest update', 500, 'UPDATE_LATEST_UPDATE_FAILED');
  }
};

export const deleteLatestUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `UPDATE latest_updates SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      errorResponse(res, 'Latest update not found', 404, 'LATEST_UPDATE_NOT_FOUND');
      return;
    }
    successResponse(res, null, 'Latest update deleted successfully');
  } catch (error) {
    console.error('Delete latest update error:', error);
    errorResponse(res, 'Failed to delete latest update', 500, 'DELETE_LATEST_UPDATE_FAILED');
  }
};

function runExtractor(filePath: string, originalName: string): Promise<any> {
  const scriptPath = path.resolve(__dirname, '../../../scripts/extract-latest-updates.py');
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [scriptPath, filePath, originalName], { cwd: path.resolve(__dirname, '../../..') });
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Document extraction timed out. Please try a smaller file.'));
    }, 60000);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error: any) => {
      clearTimeout(timeout);
      reject(new Error(error?.code === 'ENOENT'
        ? 'Document extraction requires Python 3 on the server.'
        : error?.message || 'Document extraction failed to start'));
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      try {
        const parsed = JSON.parse(stdout || '{}');
        if (code !== 0 || parsed.error) reject(new Error(parsed.error || stderr || 'Document extraction failed'));
        else resolve(parsed);
      } catch {
        reject(new Error(stderr || 'Document extraction failed'));
      }
    });
  });
}

function safeFileName(name: string) {
  return String(name || 'upload').replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function fileSourceType(name: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext === '.docx') return 'DOCX';
  if (ext === '.pdf') return 'PDF';
  if (ext === '.txt') return 'TXT';
  if (ext === '.csv') return 'CSV';
  return '';
}

function normalizeType(value: any) {
  const normalized = String(value || 'UPDATE').toUpperCase().replace(/[\s-]+/g, '_');
  return normalized.slice(0, 50);
}
