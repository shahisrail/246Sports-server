"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getCompetitionStatus = exports.getEntityDistribution = exports.getMonthlyActivity = exports.getGrowthTrends = void 0;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
/**
 * @swagger
 * /stats/growth:
 *   get:
 *     summary: Get growth trends over time
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Growth trends retrieved successfully
 */
const getGrowthTrends = async (_req, res) => {
    try {
        // Get monthly growth data for the last 6 months
        const result = await (0, database_1.query)(`
      WITH months AS (
        SELECT DATE_TRUNC('month', generated_at) AS month
        FROM generate_series(
          CURRENT_DATE - INTERVAL '5 months',
          CURRENT_DATE,
          INTERVAL '1 month'
        ) AS generated_at
      ),
      associations AS (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS count
        FROM associations
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', created_at)
      ),
      clubs AS (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS count
        FROM clubs
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', created_at)
      ),
      teams AS (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS count
        FROM teams
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', created_at)
      )
      SELECT
        TO_CHAR(m.month, 'Mon') AS month,
        COALESCE(a.count, 0) AS associations,
        COALESCE(c.count, 0) AS clubs,
        COALESCE(t.count, 0) AS teams
      FROM months m
      LEFT JOIN associations a ON m.month = a.month
      LEFT JOIN clubs c ON m.month = c.month
      LEFT JOIN teams t ON m.month = t.month
      ORDER BY m.month
    `);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Growth trends retrieved successfully');
    }
    catch (error) {
        console.error('Get growth trends error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get growth trends', 500, 'GET_GROWTH_TRENDS_FAILED');
    }
};
exports.getGrowthTrends = getGrowthTrends;
/**
 * @swagger
 * /stats/monthly-activity:
 *   get:
 *     summary: Get monthly activity data
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Monthly activity retrieved successfully
 */
const getMonthlyActivity = async (_req, res) => {
    try {
        const result = await (0, database_1.query)(`
      WITH months AS (
        SELECT DATE_TRUNC('month', generated_at) AS month
        FROM generate_series(
          CURRENT_DATE - INTERVAL '5 months',
          CURRENT_DATE,
          INTERVAL '1 month'
        ) AS generated_at
      ),
      fixtures AS (
        SELECT
          DATE_TRUNC('month', scheduled_date) AS month,
          COUNT(*) AS count
        FROM fixtures
        WHERE scheduled_date >= CURRENT_DATE - INTERVAL '6 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', scheduled_date)
      ),
      news AS (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS count
        FROM news
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', created_at)
      ),
      users AS (
        SELECT
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', created_at)
      )
      SELECT
        TO_CHAR(m.month, 'Mon') AS month,
        COALESCE(f.count, 0) AS fixtures,
        COALESCE(n.count, 0) AS news,
        COALESCE(u.count, 0) AS users
      FROM months m
      LEFT JOIN fixtures f ON m.month = f.month
      LEFT JOIN news n ON m.month = n.month
      LEFT JOIN users u ON m.month = u.month
      ORDER BY m.month
    `);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Monthly activity retrieved successfully');
    }
    catch (error) {
        console.error('Get monthly activity error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get monthly activity', 500, 'GET_MONTHLY_ACTIVITY_FAILED');
    }
};
exports.getMonthlyActivity = getMonthlyActivity;
/**
 * @swagger
 * /stats/entity-distribution:
 *   get:
 *     summary: Get entity distribution
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Entity distribution retrieved successfully
 */
const getEntityDistribution = async (_req, res) => {
    try {
        const result = await (0, database_1.query)(`
      SELECT
        'Associations' AS name,
        COUNT(*) AS value
      FROM associations
      WHERE deleted_at IS NULL
      UNION ALL
      SELECT
        'Clubs' AS name,
        COUNT(*) AS value
      FROM clubs
      WHERE deleted_at IS NULL
      UNION ALL
      SELECT
        'Teams' AS name,
        COUNT(*) AS value
      FROM teams
      WHERE deleted_at IS NULL
      UNION ALL
      SELECT
        'Competitions' AS name,
        COUNT(*) AS value
      FROM competitions
      WHERE deleted_at IS NULL
    `);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Entity distribution retrieved successfully');
    }
    catch (error) {
        console.error('Get entity distribution error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get entity distribution', 500, 'GET_ENTITY_DISTRIBUTION_FAILED');
    }
};
exports.getEntityDistribution = getEntityDistribution;
/**
 * @swagger
 * /stats/competition-status:
 *   get:
 *     summary: Get competition status breakdown
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Competition status retrieved successfully
 */
const getCompetitionStatus = async (_req, res) => {
    try {
        const result = await (0, database_1.query)(`
      SELECT
        CASE
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'Active'
          WHEN start_date > CURRENT_DATE THEN 'Scheduled'
          WHEN end_date < CURRENT_DATE THEN 'Completed'
          ELSE 'Unknown'
        END AS name,
        COUNT(*) AS value
      FROM competitions
      WHERE deleted_at IS NULL
      GROUP BY
        CASE
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'Active'
          WHEN start_date > CURRENT_DATE THEN 'Scheduled'
          WHEN end_date < CURRENT_DATE THEN 'Completed'
          ELSE 'Unknown'
        END
    `);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Competition status retrieved successfully');
    }
    catch (error) {
        console.error('Get competition status error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get competition status', 500, 'GET_COMPETITION_STATUS_FAILED');
    }
};
exports.getCompetitionStatus = getCompetitionStatus;
/**
 * @swagger
 * /stats/dashboard:
 *   get:
 *     summary: Get dashboard stats (filtered by user role)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getDashboardStats = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userAssociationId = req.user?.associationId;
        const userClubId = req.user?.clubId;
        let stats = {
            associations: 0,
            clubs: 0,
            teams: 0,
            competitions: 0,
            fixtures: 0,
            news: 0,
            liveFixtures: 0,
            upcomingFixtures: 0,
        };
        if (userRole === 'SUPER_ADMIN') {
            // Super admin sees everything
            const [associations, clubs, teams, competitions, fixtures, news] = await Promise.all([
                (0, database_1.query)('SELECT COUNT(*) FROM associations WHERE deleted_at IS NULL'),
                (0, database_1.query)('SELECT COUNT(*) FROM clubs WHERE deleted_at IS NULL'),
                (0, database_1.query)('SELECT COUNT(*) FROM teams WHERE deleted_at IS NULL'),
                (0, database_1.query)('SELECT COUNT(*) FROM competitions WHERE deleted_at IS NULL'),
                (0, database_1.query)('SELECT COUNT(*) FROM fixtures WHERE deleted_at IS NULL'),
                (0, database_1.query)('SELECT COUNT(*) FROM news WHERE deleted_at IS NULL'),
            ]);
            const fixturesByStatus = await (0, database_1.query)(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'LIVE') as live,
          COUNT(*) FILTER (WHERE date_time > CURRENT_TIMESTAMP AND status != 'FINISHED') as upcoming
        FROM fixtures
        WHERE deleted_at IS NULL
      `);
            stats = {
                associations: parseInt(associations.rows[0].count),
                clubs: parseInt(clubs.rows[0].count),
                teams: parseInt(teams.rows[0].count),
                competitions: parseInt(competitions.rows[0].count),
                fixtures: parseInt(fixtures.rows[0].count),
                news: parseInt(news.rows[0].count),
                liveFixtures: parseInt(fixturesByStatus.rows[0].live || 0),
                upcomingFixtures: parseInt(fixturesByStatus.rows[0].upcoming || 0),
            };
        }
        else if (userRole === 'ASSOCIATION_ADMIN' && userAssociationId) {
            // Association admin sees only their association's data
            const [clubs, teams, competitions, fixtures, news] = await Promise.all([
                (0, database_1.query)('SELECT COUNT(*) FROM clubs WHERE association_id = $1 AND deleted_at IS NULL', [userAssociationId]),
                (0, database_1.query)('SELECT COUNT(*) FROM teams t JOIN clubs c ON t.club_id = c.id WHERE c.association_id = $1 AND t.deleted_at IS NULL', [userAssociationId]),
                (0, database_1.query)('SELECT COUNT(*) FROM competitions WHERE association_id = $1 AND deleted_at IS NULL', [userAssociationId]),
                (0, database_1.query)('SELECT COUNT(*) FROM fixtures f JOIN competitions c ON f.competition_id = c.id WHERE c.association_id = $1 AND f.deleted_at IS NULL', [userAssociationId]),
                (0, database_1.query)('SELECT COUNT(*) FROM news WHERE association_id = $1 AND deleted_at IS NULL', [userAssociationId]),
            ]);
            const fixturesByStatus = await (0, database_1.query)(`
        SELECT
          COUNT(*) FILTER (WHERE f.status = 'LIVE') as live,
          COUNT(*) FILTER (WHERE f.date_time > CURRENT_TIMESTAMP AND f.status != 'FINISHED') as upcoming
        FROM fixtures f
        JOIN competitions c ON f.competition_id = c.id
        WHERE c.association_id = $1 AND f.deleted_at IS NULL
      `, [userAssociationId]);
            stats = {
                associations: 1, // Their own association
                clubs: parseInt(clubs.rows[0].count),
                teams: parseInt(teams.rows[0].count),
                competitions: parseInt(competitions.rows[0].count),
                fixtures: parseInt(fixtures.rows[0].count),
                news: parseInt(news.rows[0].count),
                liveFixtures: parseInt(fixturesByStatus.rows[0].live || 0),
                upcomingFixtures: parseInt(fixturesByStatus.rows[0].upcoming || 0),
            };
        }
        else if (userRole === 'CLUB_ADMIN' && userClubId) {
            // Club admin sees only their club's data
            const [teams, fixtures] = await Promise.all([
                (0, database_1.query)('SELECT COUNT(*) FROM teams WHERE club_id = $1 AND deleted_at IS NULL', [userClubId]),
                (0, database_1.query)('SELECT COUNT(*) FROM fixtures WHERE home_team_id IN (SELECT id FROM teams WHERE club_id = $1) OR away_team_id IN (SELECT id FROM teams WHERE club_id = $1) AND deleted_at IS NULL', [userClubId]),
            ]);
            const fixturesByStatus = await (0, database_1.query)(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'LIVE') as live,
          COUNT(*) FILTER (WHERE date_time > CURRENT_TIMESTAMP AND status != 'FINISHED') as upcoming
        FROM fixtures
        WHERE (home_team_id IN (SELECT id FROM teams WHERE club_id = $1)
           OR away_team_id IN (SELECT id FROM teams WHERE club_id = $1))
          AND deleted_at IS NULL
      `, [userClubId]);
            stats = {
                associations: 0,
                clubs: 1, // Their own club
                teams: parseInt(teams.rows[0].count),
                competitions: 0,
                fixtures: parseInt(fixtures.rows[0].count),
                news: 0,
                liveFixtures: parseInt(fixturesByStatus.rows[0].live || 0),
                upcomingFixtures: parseInt(fixturesByStatus.rows[0].upcoming || 0),
            };
        }
        else {
            // Other roles see minimal data
            stats = {
                associations: 0,
                clubs: 0,
                teams: 0,
                competitions: 0,
                fixtures: 0,
                news: 0,
                liveFixtures: 0,
                upcomingFixtures: 0,
            };
        }
        (0, responseHandler_1.successResponse)(res, stats, 'Dashboard stats retrieved successfully');
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get dashboard stats', 500, 'GET_DASHBOARD_STATS_FAILED');
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=stats.controller.js.map