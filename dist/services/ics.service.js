"use strict";
/**
 * ICS Calendar Service
 * Generates ICS (iCalendar) files for fixture exports
 *
 * This service creates ICS files that users can download to add
 * fixtures to their calendar applications (Google Calendar, Outlook, Apple Calendar, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICSService = void 0;
class ICSService {
    /**
     * Format date to ICS format: YYYYMMDDTHHmmssZ
     * Uses UTC timezone to ensure compatibility
     */
    formatICSDate(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }
    /**
     * Escape special characters for ICS format
     * Handles backslashes, semicolons, commas, and newlines
     */
    escapeText(text) {
        return text
            .replace(/\\/g, '\\\\') // Escape backslashes first
            .replace(/;/g, '\\;') // Escape semicolons
            .replace(/,/g, '\\,') // Escape commas
            .replace(/\n/g, '\\n') // Escape newlines
            .replace(/\r/g, ''); // Remove carriage returns
    }
    /**
     * Generate ICS file content from event data
     * Follows RFC 5545 iCalendar standard
     */
    generateICS(event) {
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//246Sports//Barbados Sports Platform//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:246Sports Fixtures',
            'X-WR-TIMEZONE:America/Barbados',
            'BEGIN:VEVENT',
            `UID:${event.uid}`,
            `DTSTAMP:${this.formatICSDate(new Date())}`,
            `DTSTART:${this.formatICSDate(event.startDate)}`,
            `DTEND:${this.formatICSDate(event.endDate)}`,
            `SUMMARY:${this.escapeText(event.title)}`,
            `DESCRIPTION:${this.escapeText(event.description)}`,
            `LOCATION:${this.escapeText(event.location)}`,
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
        ];
        // Add geographic position if coordinates available
        if (event.coordinates) {
            lines.push(`GEO:${event.coordinates.latitude};${event.coordinates.longitude}`);
        }
        // Add URL if available
        if (event.url) {
            lines.push(`URL:${this.escapeText(event.url)}`);
        }
        // Add alarm reminder (1 hour before)
        lines.push('BEGIN:VALARM');
        lines.push('TRIGGER:-PT1H');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:Reminder: ${this.escapeText(event.title)}`);
        lines.push('END:VALARM');
        lines.push('END:VEVENT');
        lines.push('END:VCALENDAR');
        return lines.join('\r\n');
    }
    /**
     * Create ICS event from fixture database record
     */
    createFixtureEvent(fixture) {
        // Validate fixture data
        if (!fixture.id || !fixture.date_time) {
            throw new Error('Invalid fixture data: missing required fields');
        }
        // Calculate end date (default 2 hours duration)
        const startDate = new Date(fixture.date_time);
        if (isNaN(startDate.getTime())) {
            throw new Error('Invalid fixture date_time');
        }
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        // Build location string
        const locationParts = [];
        if (fixture.venue_name) {
            locationParts.push(fixture.venue_name);
        }
        if (fixture.venue_address) {
            locationParts.push(fixture.venue_address);
        }
        const location = locationParts.length > 0 ? locationParts.join(', ') : 'TBD';
        // Build description
        const descriptionParts = [];
        if (fixture.competition_name) {
            descriptionParts.push(`Competition: ${fixture.competition_name}`);
        }
        if (fixture.home_team_name && fixture.away_team_name) {
            descriptionParts.push(`Match: ${fixture.home_team_name} vs ${fixture.away_team_name}`);
        }
        if (fixture.round) {
            descriptionParts.push(`Round: ${fixture.round}`);
        }
        descriptionParts.push('');
        descriptionParts.push('View details and live updates at 246Sports');
        const description = descriptionParts.join('\\n');
        // Extract coordinates if available
        const coordinates = fixture.latitude && fixture.longitude ? {
            latitude: parseFloat(fixture.latitude),
            longitude: parseFloat(fixture.longitude),
        } : undefined;
        // Build frontend URL
        const frontendUrl = process.env.FRONTEND_URL || 'https://246sports.barbados';
        const url = `${frontendUrl}/fixtures/${fixture.id}`;
        return {
            startDate,
            endDate,
            title: `${fixture.home_team_name || 'Team'} vs ${fixture.away_team_name || 'Team'}`,
            description,
            location,
            coordinates,
            url,
            uid: `fixture-${fixture.id}@246sports.barbados`,
        };
    }
    /**
     * Validate ICS event before generation
     */
    validateEvent(event) {
        const errors = [];
        if (!event.title || event.title.trim() === '') {
            errors.push('Event title is required');
        }
        if (!event.startDate || isNaN(event.startDate.getTime())) {
            errors.push('Invalid start date');
        }
        if (!event.endDate || isNaN(event.endDate.getTime())) {
            errors.push('Invalid end date');
        }
        if (event.endDate <= event.startDate) {
            errors.push('End date must be after start date');
        }
        if (event.coordinates) {
            if (event.coordinates.latitude < -90 || event.coordinates.latitude > 90) {
                errors.push('Latitude must be between -90 and 90');
            }
            if (event.coordinates.longitude < -180 || event.coordinates.longitude > 180) {
                errors.push('Longitude must be between -180 and 180');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
exports.ICSService = ICSService;
//# sourceMappingURL=ics.service.js.map