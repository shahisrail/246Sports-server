"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const associationsController = __importStar(require("./associations.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const upload_1 = require("../../middleware/upload");
const types_1 = require("../../types");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Associations
 *   description: Sports association management endpoints
 */
/**
 * @swagger
 * /api/v1/associations:
 *   get:
 *     summary: Get all associations
 *     tags: [Associations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sport
 *         schema:
 *           type: string
 *         description: Filter by sport type
 *     responses:
 *       200:
 *         description: List of associations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Association'
 */
router.get('/', associationsController.getAssociations);
/**
 * @swagger
 * /api/v1/associations/{id}:
 *   get:
 *     summary: Get association by ID
 *     tags: [Associations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Association details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Association'
 *       404:
 *         description: Association not found
 */
router.get('/:id', (0, validation_middleware_1.validateUUID)('id'), associationsController.getAssociationById);
/**
 * @swagger
 * /api/v1/associations:
 *   post:
 *     summary: Create a new association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Barbados Football Association"
 *               abbreviation:
 *                 type: string
 *                 example: "BFA"
 *               logo:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               address:
 *                 type: string
 *               founded_year:
 *                 type: integer
 *                 example: 1900
 *               president_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Association created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), associationsController.createAssociation);
/**
 * @swagger
 * /api/v1/associations/{id}:
 *   put:
 *     summary: Update an association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               abbreviation:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               president_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Association updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Association not found
 */
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN), (0, validation_middleware_1.validateUUID)('id'), associationsController.updateAssociation);
/**
 * @swagger
 * /api/v1/associations/{id}:
 *   delete:
 *     summary: Delete an association
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Association deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 *       404:
 *         description: Association not found
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), (0, validation_middleware_1.validateUUID)('id'), associationsController.deleteAssociation);
/**
 * @swagger
 * /api/v1/associations/{id}/logo:
 *   post:
 *     summary: Upload association logo
 *     tags: [Associations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/:id/logo', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN), (0, validation_middleware_1.validateUUID)('id'), upload_1.uploadImage.single('logo'), associationsController.uploadLogo);
exports.default = router;
//# sourceMappingURL=associations.routes.js.map