import { Request } from 'express';
export declare enum UserRole {
    PUBLIC = "PUBLIC",
    SUPER_ADMIN = "SUPER_ADMIN",
    ASSOCIATION_ADMIN = "ASSOCIATION_ADMIN",
    COMPETITION_MANAGER = "COMPETITION_MANAGER",
    CLUB_ADMIN = "CLUB_ADMIN",
    TEAM_MANAGER = "TEAM_MANAGER"
}
export declare enum CompetitionCategory {
    LEAGUE = "LEAGUE",
    CUP = "CUP",
    TOURNAMENT = "TOURNAMENT"
}
export declare enum CompetitionStatus {
    UPCOMING = "UPCOMING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED"
}
export declare enum FixtureStatus {
    SCHEDULED = "SCHEDULED",
    LIVE = "LIVE",
    FINISHED = "FINISHED",
    POSTPONED = "POSTPONED",
    CANCELLED = "CANCELLED"
}
export declare enum ResultStatus {
    SUBMITTED = "SUBMITTED",
    CONFIRMED = "CONFIRMED",
    PUBLISHED = "PUBLISHED"
}
export declare enum TeamCategory {
    SENIOR = "SENIOR",
    U23 = "U23",
    U20 = "U20",
    U18 = "U18",
    U15 = "U15",
    U13 = "U13"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    MIXED = "MIXED"
}
export declare enum VenueSurface {
    GRASS = "GRASS",
    ARTIFICIAL = "ARTIFICIAL",
    HYBRID = "HYBRID",
    INDOOR = "INDOOR"
}
export declare enum SportCategory {
    TEAM_SPORTS = "TEAM_SPORTS",
    RACKET_SPORTS = "RACKET_SPORTS",
    AQUATICS = "AQUATICS",
    ATHLETICS = "ATHLETICS",
    COMBAT_SPORTS = "COMBAT_SPORTS",
    INDIVIDUAL = "INDIVIDUAL",
    MIND_GAMES = "MIND_GAMES",
    MOTOR_SPORTS = "MOTOR_SPORTS",
    OTHER = "OTHER"
}
export interface Sport {
    id: string;
    name: string;
    slug: string;
    category: SportCategory;
    description?: string;
    icon?: string;
    is_popular: boolean;
    is_active: boolean;
    display_order: number;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
export interface SportPosition {
    id: string;
    sport_id: string;
    name: string;
    abbreviation?: string;
    description?: string;
    display_order: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
export interface PlayerSport {
    id: string;
    player_id: string;
    sport_id: string;
    position_id?: string;
    is_primary: boolean;
    jersey_number?: number;
    created_at: Date;
    updated_at: Date;
}
/** @deprecated Use sport_id foreign key instead */
export declare enum SportType {
    FOOTBALL = "FOOTBALL",
    CRICKET = "CRICKET",
    BASKETBALL = "BASKETBALL",
    NETBALL = "NETBALL",
    HOCKEY = "HOCKEY",
    RUGBY = "RUGBY",
    VOLLEYBALL = "VOLLEYBALL",
    TENNIS = "TENNIS",
    ATHLETICS = "ATHLETICS",
    SWIMMING = "SWIMMING",
    BOXING = "BOXING",
    OTHER = "OTHER"
}
export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PUBLISH = "PUBLISH"
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    order?: 'ASC' | 'DESC';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
export interface AuthPayload {
    userId: string;
    email: string;
    role: UserRole;
    associationId?: string;
    clubId?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export type AuthRequest = Request;
export interface CreateSportDto {
    name: string;
    slug?: string;
    category: SportCategory;
    description?: string;
    icon?: string;
    is_popular?: boolean;
    is_active?: boolean;
    display_order?: number;
    metadata?: Record<string, any>;
}
export interface UpdateSportDto {
    name?: string;
    slug?: string;
    category?: SportCategory;
    description?: string;
    icon?: string;
    is_popular?: boolean;
    is_active?: boolean;
    display_order?: number;
    metadata?: Record<string, any>;
}
export interface CreateSportPositionDto {
    sport_id: string;
    name: string;
    abbreviation?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
}
export interface UpdateSportPositionDto {
    name?: string;
    abbreviation?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
}
//# sourceMappingURL=index.d.ts.map