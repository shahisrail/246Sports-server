"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.SportType = exports.SportCategory = exports.VenueSurface = exports.Gender = exports.TeamCategory = exports.ResultStatus = exports.FixtureStatus = exports.CompetitionStatus = exports.CompetitionCategory = exports.UserRole = void 0;
// User Roles
var UserRole;
(function (UserRole) {
    UserRole["PUBLIC"] = "PUBLIC";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ASSOCIATION_ADMIN"] = "ASSOCIATION_ADMIN";
    UserRole["COMPETITION_MANAGER"] = "COMPETITION_MANAGER";
    UserRole["CLUB_ADMIN"] = "CLUB_ADMIN";
    UserRole["TEAM_MANAGER"] = "TEAM_MANAGER";
})(UserRole || (exports.UserRole = UserRole = {}));
// Competition Category
var CompetitionCategory;
(function (CompetitionCategory) {
    CompetitionCategory["LEAGUE"] = "LEAGUE";
    CompetitionCategory["CUP"] = "CUP";
    CompetitionCategory["TOURNAMENT"] = "TOURNAMENT";
})(CompetitionCategory || (exports.CompetitionCategory = CompetitionCategory = {}));
// Competition Status
var CompetitionStatus;
(function (CompetitionStatus) {
    CompetitionStatus["UPCOMING"] = "UPCOMING";
    CompetitionStatus["ONGOING"] = "ONGOING";
    CompetitionStatus["COMPLETED"] = "COMPLETED";
})(CompetitionStatus || (exports.CompetitionStatus = CompetitionStatus = {}));
// Fixture Status
var FixtureStatus;
(function (FixtureStatus) {
    FixtureStatus["SCHEDULED"] = "SCHEDULED";
    FixtureStatus["LIVE"] = "LIVE";
    FixtureStatus["FINISHED"] = "FINISHED";
    FixtureStatus["POSTPONED"] = "POSTPONED";
    FixtureStatus["CANCELLED"] = "CANCELLED";
})(FixtureStatus || (exports.FixtureStatus = FixtureStatus = {}));
// Result Status
var ResultStatus;
(function (ResultStatus) {
    ResultStatus["SUBMITTED"] = "SUBMITTED";
    ResultStatus["CONFIRMED"] = "CONFIRMED";
    ResultStatus["PUBLISHED"] = "PUBLISHED";
})(ResultStatus || (exports.ResultStatus = ResultStatus = {}));
// Team Category
var TeamCategory;
(function (TeamCategory) {
    TeamCategory["SENIOR"] = "SENIOR";
    TeamCategory["U23"] = "U23";
    TeamCategory["U20"] = "U20";
    TeamCategory["U18"] = "U18";
    TeamCategory["U15"] = "U15";
    TeamCategory["U13"] = "U13";
})(TeamCategory || (exports.TeamCategory = TeamCategory = {}));
// Gender
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["MIXED"] = "MIXED";
})(Gender || (exports.Gender = Gender = {}));
// Venue Surface
var VenueSurface;
(function (VenueSurface) {
    VenueSurface["GRASS"] = "GRASS";
    VenueSurface["ARTIFICIAL"] = "ARTIFICIAL";
    VenueSurface["HYBRID"] = "HYBRID";
    VenueSurface["INDOOR"] = "INDOOR";
})(VenueSurface || (exports.VenueSurface = VenueSurface = {}));
// ============================================================
// SPORTS SYSTEM TYPES (NEW)
// ============================================================
// Sport Categories
var SportCategory;
(function (SportCategory) {
    SportCategory["TEAM_SPORTS"] = "TEAM_SPORTS";
    SportCategory["RACKET_SPORTS"] = "RACKET_SPORTS";
    SportCategory["AQUATICS"] = "AQUATICS";
    SportCategory["ATHLETICS"] = "ATHLETICS";
    SportCategory["COMBAT_SPORTS"] = "COMBAT_SPORTS";
    SportCategory["INDIVIDUAL"] = "INDIVIDUAL";
    SportCategory["MIND_GAMES"] = "MIND_GAMES";
    SportCategory["MOTOR_SPORTS"] = "MOTOR_SPORTS";
    SportCategory["OTHER"] = "OTHER";
})(SportCategory || (exports.SportCategory = SportCategory = {}));
// ============================================================
// LEGACY SPORT TYPE (DEPRECATED)
// ============================================================
/** @deprecated Use sport_id foreign key instead */
var SportType;
(function (SportType) {
    SportType["FOOTBALL"] = "FOOTBALL";
    SportType["CRICKET"] = "CRICKET";
    SportType["BASKETBALL"] = "BASKETBALL";
    SportType["NETBALL"] = "NETBALL";
    SportType["HOCKEY"] = "HOCKEY";
    SportType["RUGBY"] = "RUGBY";
    SportType["VOLLEYBALL"] = "VOLLEYBALL";
    SportType["TENNIS"] = "TENNIS";
    SportType["ATHLETICS"] = "ATHLETICS";
    SportType["SWIMMING"] = "SWIMMING";
    SportType["BOXING"] = "BOXING";
    SportType["OTHER"] = "OTHER";
})(SportType || (exports.SportType = SportType = {}));
// Audit Action Types
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["PUBLISH"] = "PUBLISH";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=index.js.map