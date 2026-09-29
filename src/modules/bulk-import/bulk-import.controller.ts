import { Response } from 'express';
import { pool } from '../../config/database';
import { AuthRequest, UserRole } from '../../types';
import { errorResponse, successResponse } from '../../utils/responseHandler';
import {
  exportReference,
  getImportEntities,
  getTemplate,
  importRows,
  isImportEntity,
  parseCsv,
} from './bulk-import.service';

export const getImportOptions = async (_req: AuthRequest, res: Response): Promise<void> => {
  successResponse(res, { entities: getImportEntities() }, 'Bulk import options retrieved');
};

export const downloadTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  const entity = String(req.params.entity || '');
  if (!isImportEntity(entity)) {
    errorResponse(res, 'Invalid import entity', 400, 'INVALID_IMPORT_ENTITY');
    return;
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${entity}-template.csv"`);
  res.status(200).send(getTemplate(entity));
};

export const downloadReference = async (req: AuthRequest, res: Response): Promise<void> => {
  const entity = String(req.params.entity || '');
  if (!isImportEntity(entity)) {
    errorResponse(res, 'Invalid import entity', 400, 'INVALID_IMPORT_ENTITY');
    return;
  }

  const client = await pool.connect();
  try {
    const csv = await exportReference(client, entity);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}-ids-reference.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Download reference error:', error);
    errorResponse(res, 'Failed to export reference IDs', 500, 'REFERENCE_EXPORT_FAILED');
  } finally {
    client.release();
  }
};

export const uploadCsv = async (req: AuthRequest, res: Response): Promise<void> => {
  const entity = String(req.params.entity || '');
  const apply = req.query.apply === 'true' || req.body?.apply === 'true' || req.body?.apply === true;

  if (!isImportEntity(entity)) {
    errorResponse(res, 'Invalid import entity', 400, 'INVALID_IMPORT_ENTITY');
    return;
  }

  if (!req.file) {
    errorResponse(res, 'CSV file is required', 400, 'CSV_FILE_REQUIRED');
    return;
  }

  const originalName = req.file.originalname || '';
  if (!originalName.toLowerCase().endsWith('.csv') && req.file.mimetype !== 'text/csv') {
    errorResponse(res, 'Only CSV files are supported', 400, 'INVALID_FILE_TYPE');
    return;
  }

  const selectedSport = String(req.body?.sport || '').trim();
  if (entity === 'fixtures' && !selectedSport) {
    errorResponse(res, 'Select a sport for this fixture document', 400, 'SPORT_REQUIRED');
    return;
  }
  if (entity === 'fixtures' && req.user?.role === UserRole.ASSOCIATION_ADMIN && !req.user.associationId) {
    errorResponse(res, 'An association is required to import fixtures', 403, 'ASSOCIATION_REQUIRED');
    return;
  }
  const rows = parseCsv(req.file.buffer.toString('utf8'));
  if (rows.length === 0) {
    errorResponse(res, 'CSV file has no data rows', 400, 'EMPTY_CSV');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const summary = await importRows(client, entity, rows, apply, {
      sport: entity === 'fixtures' ? selectedSport : undefined,
      associationId: entity === 'fixtures' && req.user?.role === UserRole.ASSOCIATION_ADMIN ? req.user.associationId : undefined,
    });

    if (apply && summary.errors.length === 0) {
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }

    successResponse(
      res,
      summary,
      apply
        ? summary.errors.length > 0
          ? 'Import validation failed. No records were changed.'
          : 'CSV imported successfully'
        : 'CSV dry-run completed'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('CSV import error:', error);
    errorResponse(res, 'Failed to process CSV import', 500, 'CSV_IMPORT_FAILED');
  } finally {
    client.release();
  }
};
