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
exports.recalculateStandings = exports.getStandingsByCompetition = void 0;
const database_1 = require("../../config/database");
const responseHandler_1 = require("../../utils/responseHandler");
/**
 * @swagger
 * /standings/competition/{competitionId}:
 *   get:
 *     summary: Get standings for a competition
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Standings retrieved successfully
 */
const getStandingsByCompetition = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const result = await (0, database_1.query)(`SELECT
        s.id,
        s.competition_id,
        s.team_id,
        ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC) as position,
        s.played,
        s.won,
        s.drawn,
        s.lost,
        s.goals_for as "goalsFor",
        s.goals_against as "goalsAgainst",
        s.goal_difference as "goalDifference",
        s.points,
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        t.name as team_name,
        t.logo as team_logo,
        c.name as club_name
       FROM standings s
       LEFT JOIN teams t ON s.team_id = t.id
       LEFT JOIN clubs c ON t.club_id = c.id
       WHERE s.competition_id = $1
       ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC`, [competitionId]);
        (0, responseHandler_1.successResponse)(res, result.rows, 'Standings retrieved successfully');
    }
    catch (error) {
        console.error('Get standings error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to get standings', 500, 'GET_STANDINGS_FAILED');
    }
};
exports.getStandingsByCompetition = getStandingsByCompetition;
/**
 * @swagger
 * /standings/recalculate/{competitionId}:
 *   post:
 *     summary: Recalculate standings for a competition (admin only)
 *     tags: [Standings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Standings recalculated successfully
 */
const recalculateStandings = async (req, res) => {
    const client = await (await Promise.resolve().then(() => __importStar(require('../../config/database')))).pool.connect();
    try {
        if (!req.user) {
            (0, responseHandler_1.errorResponse)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        const { competitionId } = req.params;
        await client.query('BEGIN');
        // Get competition info
        const competitionResult = await client.query('SELECT points_win, points_draw, points_loss FROM competitions WHERE id = $1', [competitionId]);
        if (competitionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            (0, responseHandler_1.errorResponse)(res, 'Competition not found', 404, 'COMPETITION_NOT_FOUND');
            return;
        }
        const competition = competitionResult.rows[0];
        // Get all published results for this competition
        const resultsResult = await client.query(`SELECT r.*, f.home_team_id, f.away_team_id
       FROM results r
       LEFT JOIN fixtures f ON r.fixture_id = f.id
       WHERE f.competition_id = $1 AND r.status = 'PUBLISHED'`, [competitionId]);
        // Delete existing standings
        await client.query('DELETE FROM standings WHERE competition_id = $1', [competitionId]);
        // Get all teams in competition
        const teamsResult = await client.query(`SELECT DISTINCT t.id
       FROM teams t
       WHERE t.competition_id = $1`, [competitionId]);
        // Initialize standings for all teams
        for (const team of teamsResult.rows) {
            await client.query(`INSERT INTO standings (id, competition_id, team_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
         VALUES ($1, $2, $3, 0, 0, 0, 0, 0, 0, 0, 0)`, [require('uuid').v4(), String(competitionId), team.id]);
        }
        // Process each result
        for (const result of resultsResult.rows) {
            await updateTeamStandings(client, result.home_team_id, String(competitionId), result, competition.points_win, competition.points_draw, competition.points_loss);
            await updateTeamStandings(client, result.away_team_id, String(competitionId), result, competition.points_win, competition.points_draw, competition.points_loss);
        }
        await client.query('COMMIT');
        // Get updated standings
        const standingsResult = await (0, database_1.query)(`SELECT
        s.id,
        s.competition_id,
        s.team_id,
        ROW_NUMBER() OVER (ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC) as position,
        s.played,
        s.won,
        s.drawn,
        s.lost,
        s.goals_for as "goalsFor",
        s.goals_against as "goalsAgainst",
        s.goal_difference as "goalDifference",
        s.points,
        t.name as team_name,
        t.logo as team_logo
       FROM standings s
       LEFT JOIN teams t ON s.team_id = t.id
       WHERE s.competition_id = $1
       ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC`, [String(competitionId)]);
        (0, responseHandler_1.successResponse)(res, standingsResult.rows, 'Standings recalculated successfully');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Recalculate standings error:', error);
        (0, responseHandler_1.errorResponse)(res, 'Failed to recalculate standings', 500, 'RECALCULATE_STANDINGS_FAILED');
    }
    finally {
        client.release();
    }
};
exports.recalculateStandings = recalculateStandings;
const updateTeamStandings = async (client, teamId, competitionId, result, pointsWin, pointsDraw, pointsLoss) => {
    const isHomeTeam = result.home_team_id === teamId;
    const teamScore = isHomeTeam ? result.home_score : result.away_score;
    const opponentScore = isHomeTeam ? result.away_score : result.home_score;
    let points = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    if (teamScore > opponentScore) {
        points = pointsWin;
        won = 1;
    }
    else if (teamScore === opponentScore) {
        points = pointsDraw;
        drawn = 1;
    }
    else {
        points = pointsLoss;
        lost = 1;
    }
    await client.query(`UPDATE standings
     SET
       played = played + 1,
       won = won + $1,
       drawn = drawn + $2,
       lost = lost + $3,
       goals_for = goals_for + $4,
       goals_against = goals_against + $5,
       goal_difference = (goals_for + $4) - (goals_against + $5),
       points = points + $6,
       updated_at = CURRENT_TIMESTAMP
     WHERE competition_id = $7 AND team_id = $8`, [won, drawn, lost, teamScore, opponentScore, points, String(competitionId), String(teamId)]);
};
//# sourceMappingURL=standings.controller.js.map