import { Response } from 'express';
import path from 'path';
import zlib from 'zlib';
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
const months: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const sportKeywords: Array<[string, string[]]> = [
  ['Cricket', ['cricket', 'bca', 'cpl', 'test', 'wicket', 'tridents', 'knight riders', 'falcons', 'amazon warriors']],
  ['Football', ['football', 'bfa', 'premier league', 'fc', 'rangers']],
  ['Netball', ['netball']],
  ['Cycling', ['cycling', 'mountain bike']],
  ['Horse Racing', ['garrison savannah', 'horse', 'btc racing']],
  ['Motorsport', ['grand prix', 'motor', 'racing calendar', 'bushy park', 'brc']],
  ['Chess', ['chess']],
  ['Hockey', ['hockey']],
  ['Athletics', ['diamond league', 'marathon', 'athletics']],
  ['Tennis', ['tennis', 'u.s open', 'us open']],
  ['Rowing', ['rowing']],
  ['Gymnastics', ['gymnastics']],
  ['Squash', ['squash']],
  ['Basketball', ['fiba', 'basketball']],
  ['Bodybuilding', ['bodybuilding']],
  ['Multi-Sport', ['multi-sports', 'mediterranean games']],
];

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
    const userRole = String(req.user?.role || '').toUpperCase();
    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN].includes(userRole as UserRole);
    const selectedStatus = isAdmin ? status : 'PUBLISHED';

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
    const userRole = String(req.user?.role || '').toUpperCase();
    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN].includes(userRole as UserRole);
    const result = await query(
      `SELECT * FROM latest_updates WHERE id = $1 AND deleted_at IS NULL ${isAdmin ? '' : "AND status = 'PUBLISHED'"}`,
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

  try {
    const extracted = extractUpdatesFromUpload(req.file.buffer, req.file.originalname);
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
    const statusCode = error?.code === 'UNSUPPORTED_FILE_TYPE' ? 400 : 500;
    errorResponse(res, error?.message || 'Failed to import latest updates', statusCode, 'LATEST_UPDATES_IMPORT_FAILED');
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

function extractUpdatesFromUpload(buffer: Buffer, originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const text = extractUploadText(buffer, ext);
  return {
    text_length: text.length,
    updates: parseDatedUpdates(text),
  };
}

function extractUploadText(buffer: Buffer, ext: string): string {
  if (ext === '.docx') return extractDocxText(buffer);
  if (ext === '.txt' || ext === '.csv') return cleanText(buffer.toString('utf8'));
  if (ext === '.pdf') {
    const error: any = new Error('PDF import needs server PDF parsing support. Please upload DOCX, TXT, or CSV for now.');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    throw error;
  }
  const error: any = new Error('Only .docx, .pdf, .txt, and .csv files are supported');
  error.code = 'UNSUPPORTED_FILE_TYPE';
  throw error;
}

function extractDocxText(buffer: Buffer): string {
  const documentXml = readZipEntry(buffer, 'word/document.xml');
  if (!documentXml) {
    throw new Error('Could not read the DOCX document body.');
  }

  const xml = documentXml
    .replace(/<\/w:p>|<\/w:tr>/g, '\n')
    .replace(/<[^>]+>/g, ' ');

  return cleanText(decodeXmlEntities(xml));
}

function readZipEntry(zip: Buffer, targetName: string): string | null {
  const eocdOffset = findEndOfCentralDirectory(zip);
  if (eocdOffset < 0) return null;

  const centralDirectorySize = zip.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = zip.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;
  const endOffset = centralDirectoryOffset + centralDirectorySize;

  while (offset + 46 <= endOffset && offset + 46 <= zip.length) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) break;

    const compressionMethod = zip.readUInt16LE(offset + 10);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const fileNameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localHeaderOffset = zip.readUInt32LE(offset + 42);
    const fileName = zip.toString('utf8', offset + 46, offset + 46 + fileNameLength);

    if (fileName === targetName) {
      const localNameLength = zip.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = zip.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const data = zip.subarray(dataStart, dataStart + compressedSize);
      if (compressionMethod === 0) return data.toString('utf8');
      if (compressionMethod === 8) return zlib.inflateRawSync(data).toString('utf8');
      throw new Error('Unsupported DOCX compression method.');
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  return null;
}

function findEndOfCentralDirectory(zip: Buffer): number {
  const signature = 0x06054b50;
  const minOffset = Math.max(0, zip.length - 0xffff - 22);
  for (let offset = zip.length - 22; offset >= minOffset; offset -= 1) {
    if (zip.readUInt32LE(offset) === signature) return offset;
  }
  return -1;
}

function parseDatedUpdates(text: string): ExtractedUpdate[] {
  const year = inferYear(text);
  const headingPattern = /\b((?:Sat(?:urday)?|Sun(?:day)?|Mon(?:day)?|Tue(?:s|sday)?|Tues(?:day)?|Wed(?:nesday)?|Thu(?:rs|rsday)?|Thursday|Fri(?:day)?))\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\.?/gi;
  const matches = Array.from(text.matchAll(headingPattern));
  const updates: ExtractedUpdate[] = [];

  matches.forEach((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index || text.length : text.length;
    const eventDate = formatDate(year, match[2], match[3]);
    const segment = text.slice(start, end);

    splitItems(segment).forEach((item) => {
      const title = cleanText(item.replace(/^\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*/i, ''));
      if (!title || /^,?\s*20\d{2}$/.test(title)) return;
      const [homeTeam, awayTeam] = extractTeams(title);
      const venue = extractVenue(title);

      updates.push({
        title: title.slice(0, 255),
        description: item,
        sport: inferSport(title),
        event_type: inferType(title),
        start_date: eventDate,
        end_date: eventDate,
        time: extractTime(item),
        venue,
        location: venue,
        home_team: homeTeam,
        away_team: awayTeam,
        confidence_score: homeTeam || extractTime(item) || venue ? 0.86 : 0.72,
      });
    });
  });

  return updates;
}

function splitItems(segment: string): string[] {
  const normalized = segment.replace(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*[.]+\s*/gi, '$1 ');
  return normalized
    .split(/\s*(?:\.{2,}|\.\s+|;\s+|\n+)\s*/)
    .map(cleanText)
    .filter((item) => item.length > 3);
}

function cleanText(value: string): string {
  return decodeXmlEntities(value || '')
    .replace(/\u2026/g, '...')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim()
    .replace(/^[.\s]+|[.\s]+$/g, '');
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function inferYear(text: string): number {
  const match = text.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function formatDate(year: number, monthRaw: string, dayRaw: string): string {
  const month = months[monthRaw.toLowerCase().replace(/\.$/, '')];
  return `${year}-${String(month).padStart(2, '0')}-${String(Number(dayRaw)).padStart(2, '0')}`;
}

function inferSport(item: string): string {
  const lower = item.toLowerCase();
  const match = sportKeywords.find(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)));
  return match ? match[0] : 'General Sports';
}

function inferType(item: string): string {
  const lower = item.toLowerCase();
  if (/[\w'& .-]+\s+v(?:s|\.)?\s+[\w'& .-]+/i.test(item)) return 'FIXTURE';
  if (['championship', 'tournament', 'cup', 'league', 'final', 'semi-final', 'qualifier'].some((word) => lower.includes(word))) return 'COMPETITION';
  if (['camp', 'festival'].some((word) => lower.includes(word))) return 'EVENT';
  if (['grand prix', 'racing', 'race meet'].some((word) => lower.includes(word))) return 'RACING';
  return 'UPDATE';
}

function extractTime(item: string): string {
  const match = item.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
  return match ? match[1].replace(/\s+/g, '').toLowerCase() : '';
}

function extractVenue(item: string): string {
  const match = item.match(/\bat\s+([^.;]+)$/i) || item.match(/\bat\s+([^.;,]+)/i);
  return match ? cleanText(match[1]) : '';
}

function extractTeams(item: string): [string, string] {
  const match = item.match(/(.+?)\s+v(?:s|\.)?\s+(.+?)(?:\s+at\s+|$)/i);
  return match ? [cleanText(match[1]), cleanText(match[2])] : ['', ''];
}
