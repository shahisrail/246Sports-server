"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("./stats.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All stats routes require authentication
router.use(auth_middleware_1.authenticate);
router.get('/growth', stats_controller_1.getGrowthTrends);
router.get('/monthly-activity', stats_controller_1.getMonthlyActivity);
router.get('/entity-distribution', stats_controller_1.getEntityDistribution);
router.get('/competition-status', stats_controller_1.getCompetitionStatus);
router.get('/dashboard', stats_controller_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=stats.routes.js.map