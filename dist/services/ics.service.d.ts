/**
 * ICS Calendar Service
 * Generates ICS (iCalendar) files for fixture exports
 *
 * This service creates ICS files that users can download to add
 * fixtures to their calendar applications (Google Calendar, Outlook, Apple Calendar, etc.)
 */
export interface ICSEvent {
    startDate: Date;
    endDate: Date;
    title: string;
    description: string;
    location: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    url?: string;
    uid: string;
}
export declare class ICSService {
    /**
     * Format date to ICS format: YYYYMMDDTHHmmssZ
     * Uses UTC timezone to ensure compatibility
     */
    private formatICSDate;
    /**
     * Escape special characters for ICS format
     * Handles backslashes, semicolons, commas, and newlines
     */
    private escapeText;
    /**
     * Generate ICS file content from event data
     * Follows RFC 5545 iCalendar standard
     */
    generateICS(event: ICSEvent): string;
    /**
     * Create ICS event from fixture database record
     */
    createFixtureEvent(fixture: any): ICSEvent;
    /**
     * Validate ICS event before generation
     */
    validateEvent(event: ICSEvent): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=ics.service.d.ts.map