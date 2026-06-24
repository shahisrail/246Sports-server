"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archivePage = exports.updatePage = exports.createPage = exports.getPageByKey = exports.getPages = exports.getPublicPage = void 0;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
const logger_1 = require("../../utils/logger");
const cms_defaults_1 = require("./cms.defaults");
const PAGE_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,80}$/;
const mapPageRow = (row) => ({
    id: row.id,
    pageKey: row.page_key,
    routePath: row.route_path,
    title: row.title,
    status: row.status,
    content: (0, cms_defaults_1.mergeCmsContentWithTemplate)(row.page_key, row.content || {}),
    seo: row.seo || {},
    publishedAt: row.published_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});
const normalizeContent = (pageKey, content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
        return (0, cms_defaults_1.mergeCmsContentWithTemplate)(pageKey, {});
    }
    return (0, cms_defaults_1.mergeCmsContentWithTemplate)(pageKey, content);
};
const normalizeSeo = (seo) => {
    if (!seo || typeof seo !== 'object' || Array.isArray(seo)) {
        return {};
    }
    return {
        title: seo.title || '',
        description: seo.description || '',
        keywords: seo.keywords || '',
        canonicalUrl: seo.canonicalUrl || '',
        ogTitle: seo.ogTitle || '',
        ogDescription: seo.ogDescription || '',
        ogImage: seo.ogImage || '',
        noIndex: Boolean(seo.noIndex),
    };
};
/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Public page content and SEO management
 */
/**
 * @swagger
 * /api/v1/cms/pages/public/{pageKey}:
 *   get:
 *     summary: Get a published CMS page by key
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page retrieved successfully
 *       404:
 *         description: CMS page not found
 */
const getPublicPage = async (req, res) => {
    try {
        const pageKey = String(req.params.pageKey);
        const result = await (0, database_1.query)(`SELECT *
       FROM cms_pages
       WHERE page_key = $1 AND status = 'PUBLISHED' AND deleted_at IS NULL
       LIMIT 1`, [pageKey]);
        if (result.rows.length === 0) {
            const defaultPage = (0, cms_defaults_1.getDefaultCmsPage)(pageKey, 'PUBLISHED');
            if (defaultPage) {
                (0, responseHandler_1.successResponse)(res, defaultPage, 'Default CMS page retrieved successfully');
                return;
            }
            (0, responseHandler_1.errorResponse)(res, 'CMS page not found', 404, 'CMS_PAGE_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, mapPageRow(result.rows[0]), 'CMS page retrieved successfully');
    }
    catch (error) {
        logger_1.logger.error('Get public CMS page error', { error, pageKey: req.params.pageKey });
        (0, responseHandler_1.errorResponse)(res, 'Failed to get CMS page', 500, 'GET_CMS_PAGE_FAILED');
    }
};
exports.getPublicPage = getPublicPage;
/**
 * @swagger
 * /api/v1/cms/pages:
 *   get:
 *     summary: List CMS pages
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: CMS pages retrieved successfully
 */
const getPages = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const params = [];
        let queryText = `
      SELECT *, COUNT(*) OVER() AS total_count
      FROM cms_pages
      WHERE deleted_at IS NULL
    `;
        if (status) {
            params.push(status);
            queryText += ` AND status = $${params.length}`;
        }
        if (search) {
            params.push(`%${String(search).toLowerCase()}%`);
            queryText += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(page_key) LIKE $${params.length})`;
        }
        params.push(Number(limit), offset);
        queryText += ` ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
        const result = await (0, database_1.query)(queryText, params);
        const total = result.rows.length > 0 ? Number(result.rows[0].total_count) : 0;
        const pages = result.rows.map(({ total_count, ...row }) => mapPageRow(row));
        (0, responseHandler_1.paginatedResponse)(res, pages, Number(page), Number(limit), total, 'CMS pages retrieved successfully');
    }
    catch (error) {
        logger_1.logger.error('Get CMS pages error', { error });
        (0, responseHandler_1.errorResponse)(res, 'Failed to get CMS pages', 500, 'GET_CMS_PAGES_FAILED');
    }
};
exports.getPages = getPages;
/**
 * @swagger
 * /api/v1/cms/pages/{pageKey}:
 *   get:
 *     summary: Get a CMS page by key for admin editing
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page retrieved successfully
 *       404:
 *         description: CMS page not found
 */
const getPageByKey = async (req, res) => {
    try {
        const pageKey = String(req.params.pageKey);
        const result = await (0, database_1.query)(`SELECT * FROM cms_pages WHERE page_key = $1 AND deleted_at IS NULL LIMIT 1`, [pageKey]);
        if (result.rows.length === 0) {
            const defaultPage = (0, cms_defaults_1.getDefaultCmsPage)(pageKey, 'PUBLISHED');
            if (defaultPage) {
                (0, responseHandler_1.successResponse)(res, defaultPage, 'Default CMS page template retrieved successfully');
                return;
            }
            (0, responseHandler_1.errorResponse)(res, 'CMS page not found', 404, 'CMS_PAGE_NOT_FOUND');
            return;
        }
        (0, responseHandler_1.successResponse)(res, mapPageRow(result.rows[0]), 'CMS page retrieved successfully');
    }
    catch (error) {
        logger_1.logger.error('Get CMS page by key error', { error, pageKey: req.params.pageKey });
        (0, responseHandler_1.errorResponse)(res, 'Failed to get CMS page', 500, 'GET_CMS_PAGE_FAILED');
    }
};
exports.getPageByKey = getPageByKey;
/**
 * @swagger
 * /api/v1/cms/pages:
 *   post:
 *     summary: Create a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pageKey, title]
 *             properties:
 *               pageKey:
 *                 type: string
 *               routePath:
 *                 type: string
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               content:
 *                 type: object
 *               seo:
 *                 type: object
 *     responses:
 *       201:
 *         description: CMS page created successfully
 */
const createPage = async (req, res) => {
    try {
        const { pageKey, routePath = null, title, status = 'PUBLISHED', content = {}, seo = {} } = req.body;
        if (!pageKey || !PAGE_KEY_PATTERN.test(pageKey)) {
            (0, responseHandler_1.errorResponse)(res, 'Page key must be lowercase letters, numbers, and hyphens only', 400, 'INVALID_PAGE_KEY');
            return;
        }
        if (!title || String(title).trim().length < 2) {
            (0, responseHandler_1.errorResponse)(res, 'Title is required', 400, 'TITLE_REQUIRED');
            return;
        }
        const publishedAt = status === 'PUBLISHED' ? new Date() : null;
        const result = await (0, database_1.query)(`INSERT INTO cms_pages (page_key, route_path, title, status, content, seo, published_at, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       RETURNING *`, [
            pageKey,
            routePath,
            String(title).trim(),
            status,
            JSON.stringify(normalizeContent(pageKey, content)),
            JSON.stringify(normalizeSeo(seo)),
            publishedAt,
            req.user?.userId,
        ]);
        (0, logger_1.auditLogger)('CMS_PAGE_CREATED', 'cms_pages', req.user?.userId || 'unknown', { pageKey });
        (0, responseHandler_1.successResponse)(res, mapPageRow(result.rows[0]), 'CMS page created successfully', 201);
    }
    catch (error) {
        logger_1.logger.error('Create CMS page error', { error });
        if (error.code === '23505') {
            (0, responseHandler_1.errorResponse)(res, 'A CMS page with this key already exists', 409, 'CMS_PAGE_EXISTS');
            return;
        }
        (0, responseHandler_1.errorResponse)(res, 'Failed to create CMS page', 500, 'CREATE_CMS_PAGE_FAILED');
    }
};
exports.createPage = createPage;
/**
 * @swagger
 * /api/v1/cms/pages/{pageKey}:
 *   put:
 *     summary: Update a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page updated successfully
 */
const updatePage = async (req, res) => {
    try {
        const pageKey = String(req.params.pageKey);
        const { routePath, title, status, content, seo } = req.body;
        const existing = await (0, database_1.query)(`SELECT * FROM cms_pages WHERE page_key = $1 AND deleted_at IS NULL LIMIT 1`, [pageKey]);
        if (existing.rows.length === 0) {
            const defaultPage = (0, cms_defaults_1.getDefaultCmsPage)(pageKey, 'PUBLISHED');
            if (!defaultPage) {
                (0, responseHandler_1.errorResponse)(res, 'CMS page not found', 404, 'CMS_PAGE_NOT_FOUND');
                return;
            }
            const nextStatus = status || 'PUBLISHED';
            const insertResult = await (0, database_1.query)(`INSERT INTO cms_pages (page_key, route_path, title, status, content, seo, published_at, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
         RETURNING *`, [
                pageKey,
                routePath !== undefined ? routePath : defaultPage.routePath,
                title !== undefined ? String(title).trim() : defaultPage.title,
                nextStatus,
                JSON.stringify(content !== undefined ? normalizeContent(pageKey, content) : defaultPage.content),
                JSON.stringify(seo !== undefined ? normalizeSeo(seo) : defaultPage.seo),
                nextStatus === 'PUBLISHED' ? new Date() : null,
                req.user?.userId,
            ]);
            (0, logger_1.auditLogger)('CMS_PAGE_CREATED_FROM_DEFAULT', 'cms_pages', req.user?.userId || 'unknown', { pageKey });
            (0, responseHandler_1.successResponse)(res, mapPageRow(insertResult.rows[0]), 'CMS page created successfully');
            return;
        }
        const current = existing.rows[0];
        const nextStatus = status || current.status;
        const publishedAt = nextStatus === 'PUBLISHED' && current.status !== 'PUBLISHED'
            ? new Date()
            : current.published_at;
        const result = await (0, database_1.query)(`UPDATE cms_pages
       SET route_path = $1,
           title = $2,
           status = $3,
           content = $4,
           seo = $5,
           published_at = $6,
           updated_by = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE page_key = $8 AND deleted_at IS NULL
       RETURNING *`, [
            routePath !== undefined ? routePath : current.route_path,
            title !== undefined ? String(title).trim() : current.title,
            nextStatus,
            JSON.stringify(content !== undefined ? normalizeContent(pageKey, content) : current.content),
            JSON.stringify(seo !== undefined ? normalizeSeo(seo) : current.seo),
            publishedAt,
            req.user?.userId,
            pageKey,
        ]);
        (0, logger_1.auditLogger)('CMS_PAGE_UPDATED', 'cms_pages', req.user?.userId || 'unknown', { pageKey });
        (0, responseHandler_1.successResponse)(res, mapPageRow(result.rows[0]), 'CMS page updated successfully');
    }
    catch (error) {
        logger_1.logger.error('Update CMS page error', { error, pageKey: req.params.pageKey });
        (0, responseHandler_1.errorResponse)(res, 'Failed to update CMS page', 500, 'UPDATE_CMS_PAGE_FAILED');
    }
};
exports.updatePage = updatePage;
/**
 * @swagger
 * /api/v1/cms/pages/{pageKey}:
 *   delete:
 *     summary: Archive a CMS page
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pageKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS page archived successfully
 */
const archivePage = async (req, res) => {
    try {
        const { pageKey } = req.params;
        const result = await (0, database_1.query)(`UPDATE cms_pages
       SET status = 'ARCHIVED', updated_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE page_key = $2 AND deleted_at IS NULL
       RETURNING *`, [req.user?.userId, pageKey]);
        if (result.rows.length === 0) {
            (0, responseHandler_1.errorResponse)(res, 'CMS page not found', 404, 'CMS_PAGE_NOT_FOUND');
            return;
        }
        (0, logger_1.auditLogger)('CMS_PAGE_ARCHIVED', 'cms_pages', req.user?.userId || 'unknown', { pageKey });
        (0, responseHandler_1.successResponse)(res, mapPageRow(result.rows[0]), 'CMS page archived successfully');
    }
    catch (error) {
        logger_1.logger.error('Archive CMS page error', { error, pageKey: req.params.pageKey });
        (0, responseHandler_1.errorResponse)(res, 'Failed to archive CMS page', 500, 'ARCHIVE_CMS_PAGE_FAILED');
    }
};
exports.archivePage = archivePage;
//# sourceMappingURL=cms.controller.js.map