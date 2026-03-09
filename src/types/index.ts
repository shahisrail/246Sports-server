import { Request } from 'express';

// User Roles
export enum UserRole {
  PUBLIC = 'PUBLIC',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ASSOCIATION_ADMIN = 'ASSOCIATION_ADMIN',
  COMPETITION_MANAGER = 'COMPETITION_MANAGER',
  CLUB_ADMIN = 'CLUB_ADMIN',
  TEAM_MANAGER = 'TEAM_MANAGER',
}

// Competition Category
export enum CompetitionCategory {
  LEAGUE = 'LEAGUE',
  CUP = 'CUP',
  TOURNAMENT = 'TOURNAMENT',
}

// Competition Status
export enum CompetitionStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

// Fixture Status
export enum FixtureStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

// Result Status
export enum ResultStatus {
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  PUBLISHED = 'PUBLISHED',
}

// Team Category
export enum TeamCategory {
  SENIOR = 'SENIOR',
  U23 = 'U23',
  U20 = 'U20',
  U18 = 'U18',
  U15 = 'U15',
  U13 = 'U13',
}

// Gender
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED',
}

// Venue Surface
export enum VenueSurface {
  GRASS = 'GRASS',
  ARTIFICIAL = 'ARTIFICIAL',
  HYBRID = 'HYBRID',
  INDOOR = 'INDOOR',
}

// Sport Types
export enum SportType {
  FOOTBALL = 'FOOTBALL',
  CRICKET = 'CRICKET',
  BASKETBALL = 'BASKETBALL',
  NETBALL = 'NETBALL',
  HOCKEY = 'HOCKEY',
  RUGBY = 'RUGBY',
  VOLLEYBALL = 'VOLLEYBALL',
  TENNIS = 'TENNIS',
  ATHLETICS = 'ATHLETICS',
  SWIMMING = 'SWIMMING',
  BOXING = 'BOXING',
  OTHER = 'OTHER',
}

// Audit Action Types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PUBLISH = 'PUBLISH',
}

// Pagination Params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'ASC' | 'DESC';
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Auth Payload
export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  associationId?: string;
  clubId?: string;
}

// Request with User - extends Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Type alias for use in controllers
export type AuthRequest = Request;
