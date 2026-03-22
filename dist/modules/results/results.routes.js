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
const resultsController = __importStar(require("./results.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const types_1 = require("../../types");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Match results and score management endpoints
 */
/**
 * @swagger
 * /api/v1/results:
 *   get:
 *     summary: Get all match results
 *     tags: [Results]
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
 *         name: competition_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, CONFIRMED, PUBLISHED]
 *     responses:
 *       200:
 *         description: List of results
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
 *                     $ref: '#/components/schemas/Result'
 */
router.get('/', resultsController.getResults);
/**
 * @swagger
 * /api/v1/results/fixture/{fixtureId}:
 *   get:
 *     summary: Get result by fixture ID
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Result details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Result'
 *       404:
 *         description: Result not found
 */
router.get('/fixture/:fixtureId', (0, validation_middleware_1.validateUUID)('fixtureId'), resultsController.getResultByFixtureId);
/**
 * @swagger
 * /api/v1/results:
 *   post:
 *     summary: Submit a match result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fixture_id
 *               - home_score
 *               - away_score
 *             properties:
 *               fixture_id:
 *                 type: string
 *                 format: uuid
 *               home_score:
 *                 type: integer
 *                 minimum: 0
 *               away_score:
 *                 type: integer
 *                 minimum: 0
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Result submitted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER, types_1.UserRole.CLUB_ADMIN, types_1.UserRole.TEAM_MANAGER), resultsController.submitResult);
/**
 * @swagger
 * /api/v1/results/{id}/confirm:
 *   put:
 *     summary: Confirm a submitted result
 *     tags: [Results]
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
 *         description: Result confirmed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Result not found
 */
router.put('/:id/confirm', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), (0, validation_middleware_1.validateUUID)('id'), resultsController.confirmResult);
/**
 * @swagger
 * /api/v1/results/{id}/publish:
 *   put:
 *     summary: Publish a confirmed result (public)
 *     tags: [Results]
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
 *         description: Result published
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Result not found
 */
router.put('/:id/publish', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ASSOCIATION_ADMIN, types_1.UserRole.COMPETITION_MANAGER), (0, validation_middleware_1.validateUUID)('id'), resultsController.publishResult);
exports.default = router;
//# sourceMappingURL=results.routes.js.map