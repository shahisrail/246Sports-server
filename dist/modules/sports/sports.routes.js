"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sports_controller_1 = require("./sports.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes - Get sports
router.get('/', sports_controller_1.getSports);
router.get('/categories', sports_controller_1.getSportsByCategory);
router.get('/stats', sports_controller_1.getSportsStats);
router.get('/:id', sports_controller_1.getSportById);
router.get('/:id/positions', sports_controller_1.getSportPositions);
// Protected routes - Create/Update/Delete (Super Admin only)
router.post('/', auth_middleware_1.authenticate, sports_controller_1.createSport);
router.put('/:id', auth_middleware_1.authenticate, sports_controller_1.updateSport);
router.delete('/:id', auth_middleware_1.authenticate, sports_controller_1.deleteSport);
// Sport Positions routes
router.post('/positions', auth_middleware_1.authenticate, sports_controller_1.createSportPosition);
router.put('/positions/:id', auth_middleware_1.authenticate, sports_controller_1.updateSportPosition);
router.delete('/positions/:id', auth_middleware_1.authenticate, sports_controller_1.deleteSportPosition);
exports.default = router;
//# sourceMappingURL=sports.routes.js.map