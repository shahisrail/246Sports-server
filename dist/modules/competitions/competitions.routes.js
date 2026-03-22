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
const competitionsController = __importStar(require("./competitions.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const types_1 = require("../../types");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Competitions
 *   description: Competition and tournament management endpoints
 */
/**
 * @swagger
 * /api/v1/competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
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
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by association
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [LEAGUE, CUP, TOURNAMENT]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ONGOING, COMPLETED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of competitions
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
 *                     $ref: '#/components/schemas/Competition'
 *                 pagination:
 *                   type: object
 */
router.get('/', competitionsController.getCompetitions);
/**
 * @swagger
 * /api/v1/competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Competition details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Competition'
 *       404:
 *         description: Competition not found
 */
router.get('/:id', (0, validation_middleware_1.validateUUID)('id'), competitionsController.getCompetitionById);
/**
 * @swagger
 * /api/v1/competitions:
 *   post:
 *     summary: Create a new competition
 *     tags: [Competitions]
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
 *               - sport
 *               - association_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premier League"
 *               sport:
 *                 type: string
 *                 example: "Football"
 *               association_id:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [LEAGUE, CUP, TOURNAMENT]
 *                 default: LEAGUE
 *               season_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *                 default: UPCOMING
 *               rules:
 *                 type: string
 *               points_win:
 *                 type: integer
 *                 default: 3
 *               points_draw:
 *                 type: integer
 *                 default: 1
 *               points_loss:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Competition created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), competitionsController.createCompetition);
/**
 * @swagger
 * /api/v1/competitions/{id}:
 *   put:
 *     summary: Update a competition
 *     tags: [Competitions]
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
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED]
 *               rules:
 *                 type: string
 *               points_win:
 *                 type: integer
 *               points_draw:
 *                 type: integer
 *               points_loss:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Competition updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), (0, validation_middleware_1.validateUUID)('id'), competitionsController.updateCompetition);
/**
 * @swagger
 * /api/v1/competitions/{id}:
 *   delete:
 *     summary: Delete a competition
 *     tags: [Competitions]
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
 *         description: Competition deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN), (0, validation_middleware_1.validateUUID)('id'), competitionsController.deleteCompetition);
/**
 * @swagger
 * /api/v1/competitions/{id}/generate-fixtures:
 *   post:
 *     summary: Generate fixtures for a competition
 *     tags: [Competitions]
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
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               match_type:
 *                 type: string
 *                 enum: [HOME_AND_AWAY, SINGLE_ROUND_ROBIN]
 *                 default: HOME_AND_AWAY
 *     responses:
 *       200:
 *         description: Fixtures generated successfully
 *       400:
 *         description: Invalid request or no teams in competition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Competition not found
 */
router.post('/:id/generate-fixtures', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN), (0, validation_middleware_1.validateUUID)('id'), competitionsController.generateFixtures);
exports.default = router;
//# sourceMappingURL=competitions.routes.js.map